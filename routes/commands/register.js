const router = require('express').Router()
const busboy = require('connect-busboy')
const fs = require('fs')
const path = require('path')
const uuid = require('uuid/v1')
const bcrypt = require('bcrypt')
const saltRounds = 10

const isAdmin = require('../privileges')
const models = require('../mongoose/models')
const person = models.person

const messages = [
	'User is registered!',
	'Email is already taken',
	'Username is already taken',
	'Email and username are taken',
	"You don't have the permissions to do that.",
	'Sorry - something went wrong!',
	"Don't be silly - you can't delete yourself!!"
]

router.post('/register', busboy(), (req, res) => {
	req.pipe(req.busboy)

	const tmpDir = __dirname + '../../../static/img/tmp/'
	const formData = new Map() // Map inputs to their values

	let user
	let query = {}
	let unique = true
	let problem = 0
	let profileDir = path.join(__dirname + '../../../static/img/profiles/')

	const existCheck = async () => {
		await new Promise((resolve, reject) => {
			try {
				let uid = ['email', 'username']
				let info = [user.email, user.username]
				for (i = 0; i < 2; i++) {
					query[uid[i]] = info[i] // Output: {'email': user.email}
					person.find(query, function(err, result) {
						if (err) reject(err)
						else if (result.length) {
							if (result[0].email == user.email) problem += 1
							if (result[0].username == user.username) problem += 2
							unique = false
							resolve()
						} else resolve()
					})
				}
			} catch (error) {
				console.log(error)
			}
		})
	}

	const fileSave = async () => {
		if (unique) {
			try {
				await new Promise((resolve, reject) => {
					if (user.filename) {
						// don't run if there's no file
						function ext() {
							let t = user.filename.split('.')
							return t[t.length - 1].toString()
						}

						let tmpName = path.join(tmpDir + user.filename)
						let newName = path.join(profileDir + uuid() + user.name.replace(/ /g, '') + '.' + ext())
						user.filename = "'./" + newName.split('/static/')[1] + "'"
						fs.rename(tmpName, newName, err => {
							if (err) reject(err)
							else resolve()
						})
					} else resolve()
				})
			} catch (err) {
				console.log(err)
			}
		} else return
	}

	const userSave = async () => {
		if (unique) {
			try {
				await new Promise((resolve, reject) => {
					let pass = user.password
					bcrypt.genSalt(saltRounds, function(err, salt) {
						if (err) reject(err)
						else {
							bcrypt.hash(pass, salt, function(err, hash) {
								if (err) reject(err)
								else {
									user.password = hash
									let uData = new person(user)
									uData
										.save()
										.then(() => {
											resolve()
										})
										.catch(err => {
											console.log(err)
										})
									resolve() // fallback
								}
							})
						}
					})
				})
			} catch (err) {
				console.log(err)
			}
		} else return
	}

	req.busboy.on('field', (fieldname, val) => {
		formData.set(fieldname, val)
		user = JSON.parse(formData.get('data'))
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
		let resolve = () => {
			res.send(messages[problem])
		}
		async function handler() {
			await existCheck()
			await fileSave()
			await userSave()
			resolve()
		}

		isAdmin.level(
			req,
			res,
			1,
			() => {
				handler().catch(() => {
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
