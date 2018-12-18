const db = require("./../../../database/database");
const Users = new db.models.Users();
const Resets = new db.models.Resets();
const key_generator = require("./../keyController");

module.exports = {
	link,
	reset
};

function link(request, response) {
	Users.findOne({
		where: { email: request.body.email }
	}).then(user => {
		// project will be the first entry of the Projects table with the title 'aProject' || null
		if (user !== null) {
			if (user.activated) {
				Resets.create({
					user_id: user.id,
					reset_code: key_generator.generateToken()
				}).then(reset => {
					if (reset !== null) {
						// returning the reset code if everything went as planed
						response.status(200).send({
							status: "ok",
							code: 200,
							messages: [],
							data: {
								user_email: user.email,
								register_link:
									request.body.register_link +
									"?reset_code=" +
									reset.reset_code
							},
							error: {}
						});
					} else {
						response.status(500).send({
							status: "Internal Server Error",
							code: 500,
							messages: ["server error"],
							data: {},
							error: {
								status: 500,
								error: "SERVER_ERROR",
								description:
									"And error was rased when trying to generate reset code.",
								fields: {}
							}
						});
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

function reset(request, response) {
	Resets.findOne({
		where: { reset_code: request.query.reset_code }
	}).then(reset => {
		// project will be the first entry of the Projects table with the title 'aProject' || null
		if (reset !== null) {
			Users.findOne({ where: { id: reset.user_id } }).then(user => {
				user.update({
					password: request.body.new_password
				}).then(() => {
					Resets.destroy({
						where: {
							reset_code: request.query.reset_code
						}
					}).then(() => {
						response.status(204).send({
							status: "No Content",
							code: 204,
							messages: ["password reset"],
							data: {},
							error: {}
						});
					});
				});
			});
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
