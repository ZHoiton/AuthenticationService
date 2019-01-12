const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./../../../database/database");
const Users = new db.models.Users();
const { global_key } = require("../keyController");

module.exports = {
	login
};

function login(request, response) {
	Users.findOne({ where: { email: request.body.email } }).then(user => {
		if (user !== null) {
			if (user.activated) {
				bcrypt.compare(request.body.password, user.password, function(
					error_hash,
					result_hash
				) {
					if (error_hash) {
						response.status(500).send({
							status: "Internal Server Error",
							code: 500,
							messages: ["server error"],
							data: {},
							error: {
								status: 500,
								error: "SERVER_ERROR",
								description:
									"And error was rased when trying to de-hash password.",
								fields: {}
							}
						});
					} else {
						if (result_hash) {
							//deleting the following keys because could not find in the
							//documentation how to exclude them in the return object from the db
							user.get().auth_id = user.get().id;
							delete user.get().id;
							delete user.get().password;
							delete user.get().activated;
							
							jwt.sign(
								{ user: user },
								global_key,
								(error, token) => {
									if (error) {
										response.status(500).send({
											status: "Internal Server Error",
											code: 500,
											messages: ["server error"],
											data: {},
											error: {
												status: 500,
												error: "SERVER_ERROR",
												description:
													"And error was rased when trying to sign token.",
												fields: {}
											}
										});
									} else {
										response.status(200).send({
											status: "ok",
											code: 200,
											messages: [],
											data: {
												token: token
											},
											error: {}
										});
									}
								}
							);
						} else {
							response.status(422).send({
								status: "Bad Request",
								code: 422,
								messages: ["information is okay, but invalid"],
								data: {},
								error: {
									status: 422,
									error: "FIELDS_VALIDATION_ERROR",
									description: "credentials not correct",
									fields: {}
								}
							});
						}
					}
				});
			} else {
				response.status(403).send({
					status: "Forbidden",
					code: 403,
					messages: ["action not allowed"],
					data: {},
					error: {
						status: 403,
						error: "ACTION_NOT_ALLOWED_ERROR",
						description:
							"And error was rased when trying to take action on a un-authorized resource.",
						fields: {}
					}
				});
			}
		} else {
			response.status(404).send({
				status: "Not Found",
				code: 404,
				messages: ["resource not found"],
				data: {},
				error: {
					status: 404,
					error: "RESOURCE_NOT_FOUND_ERROR",
					description:
						"And error was rased when trying to access a resource which does not exists.",
					fields: {}
				}
			});
		}
	});
}
