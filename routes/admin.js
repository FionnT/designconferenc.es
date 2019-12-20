const router = require('express').Router()
const busboy = require('connect-busboy')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const saltRounds = 10
const isAdmin = require('./privileges')
const models = require('./mongoose/models')
const person = models.person

router.post('/update', busboy(), (req, res) => {
	req.pipe(req.busboy)

	const messages = [
		'Details were updated!',
		'Email is already taken',
		'Username is already taken',
		'Email and username are taken',
		"You don't have the permissions to do that.",
		'Something went wrong!',
		"Couldn't save that password for some reason!",
		"You can't delete yourself!",
		'User was deleted!'
	]

	const tmpDir = __dirname + '../../static/img/tmp/'
	const staticDir = __dirname + '../../static/'
	const formData = new Map() // Map inputs to their values

	const bools = {
		email: 0,
		username: 0
	}

	let incoming
	let original
	let found = []
	let problem = 0

	const fetchOrigin = async () => {
		try {
			await person.findOne({_id: incoming.id}, (err, result) => {
				if (err) reject(err)
				else original = result
			})
		} catch (err) {
			console.log(err)
		}
	}

	const fetchAndFilter = async () => {
		try {
			await new Promise((resolve, reject) => {
				let uid = ['email', 'username']
				let info = [incoming.email, incoming.username]
				for (let i = 0; i < 2; i++) {
					let query = {}
					query[uid[i]] = info[i] // Output: query = {email: incoming.email}
					person.find(query, function(err, result) {
						if (err) reject(err)
						else {
							for (user in result) found.push(result[user])
							for (i in found) {
								if (found[i].id !== incoming.id && found.length) {
									// skip checking the user being modified
									if (found[i].email === incoming.email) bools.email += 1
									if (found[i].username === incoming.username) bools.username += 1
								}
							}
							resolve()
						}
					})
				}
			})
		} catch (err) {
			console.log(err)
		}
	}

	const saveFile = async () => {
		try {
			await new Promise((resolve, reject) => {
				if (incoming.filename) {
					// set to false on client side if we're not updating it

					let tmpName = path.join(tmpDir + incoming.filename)
					let newName = path.join(staticDir + original.filename.split("'./")[1].split("'")[0]) // No need to generate a new UUID, we're just going to overwrite

					incoming.filename = original.filename
					fs.rename(tmpName, newName, err => {
						if (err) reject(err)
						else resolve()
					})
				} else {
					resolve()
				}
			})
		} catch (err) {
			console.log(err)
		}
	}

	const updatePassword = async () => {
		try {
			await new Promise((resolve, reject) => {
				bcrypt.genSalt(saltRounds, function(err, salt) {
					bcrypt.hash(incoming.password, salt, function(err, hash) {
						if (err) reject(err)
						else {
							incoming.password = hash
							resolve()
						}
					})
				})
			})
		} catch (err) {
			console.log(err)
		}
	}

	const updateUser = async requestor => {
		try {
			await new Promise((resolve, reject) => {
				person.findOne(
					{
						_id: incoming.id
					},
					(err, result) => {
						if (err) reject(err)
						else {
							// Not using object.assign as we have some checks in place
							if (incoming.password) result.password = incoming.password
							if (incoming.filename) result.filename = incoming.filename
							if (requestor.isAdmin <= incoming.isAdmin && original.isAdmin !== -1) result.isAdmin = incoming.isAdmin
							else {
								problem = 4
								reject()
							}
							result.username = incoming.username
							result.email = incoming.email
							result.name = incoming.name
							result
								.save()
								.then(() => {
									resolve()
								})
								.catch(err => {
									throw err
								})
							resolve() // fallback
						}
					}
				)
			})
		} catch (err) {
			console.log(err)
		}
	}

	const deleteUser = async requestor => {
		if (incoming.id == requestor.id) {
			problem = 7
			resolve()
		} else {
			try {
				await person.findByIdAndDelete(
					{
						_id: incoming.id
					},
					err => {
						if (err) throw err
						else {
							problem = 8
							return true
						}
					}
				)
			} catch (err) {
				console.log(err)
			}
		}
	}

	req.busboy.on('field', (fieldname, val) => {
		formData.set(fieldname, val)
		incoming = JSON.parse(formData.get('data'))
	})

	req.busboy.on('file', (fieldname, file, fileName) => {
		new Promise((resolve, reject) => {
			const fstream = fs.createWriteStream(path.join(tmpDir, fileName))
			file.pipe(fstream).on('finish', () => {
				resolve()
			})
		})
	})

	req.busboy.on('finish', () => {
		function resolve() {
			if (bools.email) problem += 1
			if (bools.username) problem += 2
			res.send(messages[problem])
		}
		async function handler(requestor) {
			if (incoming.remove) {
				await deleteUser(requestor)
				resolve()
			} else {
				await fetchOrigin()
				await fetchAndFilter()
				if (bools.email || bools.username) resolve()
				else {
					if (incoming.password) {
						await updatePassword()
					}
					if (incoming.filename) {
						await saveFile()
					}
					await updateUser(requestor)
					resolve()
				}
			}
		}

		isAdmin.basic(
			req,
			res,
			requestor => {
				handler(requestor).catch(() => {
					if (problem > 0) res.send(messages[problem])
					else res.send(messages[5])
				})
			},
			() => {
				res.send(messages[4])
			}
		)
	})
})

module.exports = router
