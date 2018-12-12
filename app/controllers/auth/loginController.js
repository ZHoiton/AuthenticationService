const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./../../../database/database");
const Users = new db.models.Users();

module.exports = {
	login
};

function login(request, response, key) {
	Users.findOne({ where: { email: request.body.email } }).then(user => {
		if (user !== null) {
			if (user.activated) {
				bcrypt.compare(request.body.password, user.password, function(
					error_hash,
					result_hash
				) {
					if (error_hash) {
						response
							.status(400)
							.send({ error: "password", info: "de-hash" });
					} else {
						if (result_hash) {
							//deleting the following keys because could not find in the
							//documentation how to exclude them in the return object from the db
							delete user.get().password;
							delete user.get().activated;

							jwt.sign({ user: user }, key, (error, token) => {
								if (error) {
									response
										.status(400)
										.send({ error: "JWT", info: "sign" });
								} else {
									response.json({
										// user: user.get({ plain: true }),
										token: token
									});
								}
							});
						} else {
							response
								.status(400)
								.send({ error: "user", info: "incorrect password" });
						}
					}
				});
			} else {
				response
					.status(400)
					.send({ error: "user", info: "not activated" });
			}
		} else {
			response.status(400).send({ error: "user", info: "no_match" });
		}
	});
}
