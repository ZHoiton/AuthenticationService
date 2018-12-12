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
				if (activation !== null) {
					// returning the code if everything went as planed
					response.json({
						user_email: user.email,
						activation_link:
							request.body.activation_link +
							"?activation_code=" +
							activation.activation_code
					});
				} else {
					response.status(400).send({
						error: "activation_code",
						info: "Could not generate."
					});
				}
			});
		} else {
			response.status(400).send({
				error: "user",
				info: "exists"
			});
		}
	});
}
