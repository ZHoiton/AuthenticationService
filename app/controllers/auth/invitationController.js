const db = require("./../../../database/database");
const Invites = new db.models.Invites();
const key_generator = require("./../keyController");
const Users = new db.models.Users();

module.exports = {
	createInvitation,
	activateAccount
};

function createInvitation(request, response) {
	Users.findOne({ where: { email: request.body.email } }).then(user => {
		if (user === null) {
			Invites.create({
				email: request.body.email,
				invite_code: key_generator.generateToken()
			}).then(invite => {
				if (invite !== null && invite.invite_code !== null) {
					// returning the code if everything went as planed
					response.status(200).send({
						status: "ok",
						code: 200,
						messages: [],
						data: {
							email: invite.email,
							invite_link:
								request.body.invite_activation_link +
								"?invite_code=" +
								invite.invite_code
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
								"And error was rased when trying to generate invite code.",
							fields: {}
						}
					});
				}
			});
		} else {
			response.status(409).send({
				status: "Conflict",
				code: 409,
				messages: ["resource already exists"],
				data: {},
				error: {
					status: 409,
					error: "RESOURCE_EXISTS_ERROR",
					description:
						"And error was rased when trying to invite already existing user.",
					fields: {}
				}
			});
		}
	});
}

function activateAccount(request, response) {
	Invites.findOne({ where: { invite_code: request.body.invite_code } }).then(
		invite => {
			if (invite !== null) {
				Users.create({
					email: invite.email,
					password: request.body.password,
					activated: true
				}).then(user => {
					if (user !== null) {
						Invites.destroy({
							where: {
								invite_code: request.body.invite_code
							}
						}).then(() => {
							response.status(204).send({
								status: "No Content",
								code: 204,
								messages: ["user successfully registered"],
								data: {},
								error: {}
							});
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
									"And error was rased when trying to register the user.",
								fields: {}
							}
						});
					}
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
		}
	);
}
