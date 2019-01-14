const db = require("./../../../database/database");
const Users = new db.models.Users();
const Activations = new db.models.Activations();
const key_generator = require("./../keyController");

module.exports = {
	register
};

function register(request, response) {
	Users.findOrCreate({
		where: { email: request.body.email },
		defaults: {
			password: request.body.password,
			activated: false
		}
	}).spread(function(user, created) {
		if (created) {
			//creating an activation code which could be used in email confirm.
			Activations.create({
				user_id: user.get().id,
				activation_code: key_generator.generateToken()
			}).then(activation => {
				if (
					activation !== null &&
					activation.activation_code !== null
				) {
					// returning the code if everything went as planed
					response.status(200).send({
						status: "ok",
						code: 200,
						messages: [],
						data: {
							user_email: user.email,
							auth_id: user.id,
							activation_link:
								request.body.activation_link +
								"?activation_code=" +
								activation.activation_code
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
								"And error was rased when trying to generate activation code.",
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
						"And error was rased when trying to create a resource which already exists.",
					fields: {}
				}
			});
		}
	});
}
