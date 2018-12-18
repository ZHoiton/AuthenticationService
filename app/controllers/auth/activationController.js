const db = require("./../../../database/database");
const Users = new db.models.Users();
const Activations = new db.models.Activations();

module.exports = {
	activate
};

function activate(request, response) {
	Activations.findOne({
		where: { activation_code: request.query.activation_code }
	}).then(activation => {
		if (activation !== null) {
			Users.findOne({ where: { id: activation.user_id } }).then(user => {
				if (!user.activated) {
					user.update({
						activated: 1
					}).then(() => {
						Activations.destroy({
							where: {
								activation_code: request.query.activation_code
							}
						}).then(() => {
							response.status(204).send({
								status: "No Content",
								code: 204,
								messages: ["user successfully activated"],
								data: {},
								error: {}
							});
						});
					});
				} else {
					response.status(410).send({
						status: "Gone",
						code: 410,
						messages: [
							"information is okay, but requested resource is gone"
						],
						data: {},
						error: {
							status: 410,
							error: "USER_ERROR",
							description: "User is already activated.",
							fields: {}
						}
					});
				}
			});
		} else {
			response.status(422).send({
				status: "Bad Request",
				code: 422,
				messages: ["information is okay, but invalid"],
				data: {},
				error: {
					status: 422,
					error: "FIELDS_VALIDATION_ERROR",
					description: "One or more fields raised validation errors.",
					fields: { activation_code: "Invalid activation code" }
				}
			});
		}
	});
}
