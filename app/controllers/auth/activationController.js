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
							response.json({
								activated: true
							});
						});
					});
				} else {
					response.status(400).send({
						error: "user",
						info: "activated"
					});
				}
			});
		} else {
			response.status(400).send({
				error: "activation_code",
				info: "invalid"
			});
		}
	});
}
