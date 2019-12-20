const router = require('express').Router()
const isAdmin = require('../privileges')
const models = require('../mongoose/models')
const conf = models.conference

router.get('/accept', (req, res) => {
	const approve = async () => {
		try {
			await conf.findById(req.query.id, (err, result) => {
				if (err) throw err
				else {
					result.approved = true
					result
						.save()
						.then(() => {
							return true
						})
						.catch(err => {
							console.log(err)
						})
				}
			})
		} catch (err) {
			console.log(err)
		}
	}

	async function handler() {
		await approve()
	}

	isAdmin.basic(
		req,
		res,
		() => {
			handler().then(() => {
				res.redirect('/' + req.query.return)
			})
		},
		() => {
			res.redirect('/404')
		}
	)
})

module.exports = router
