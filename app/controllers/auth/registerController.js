const db = require("./../../../database/database");
const Users = new db.models.Users();
const key_generator = require("./../keyController");

module.exports = {
	register
};

function register(request, response) {
	Users.findOrCreate({
		where: { email: request.body.email },
		defaults: {
			first_name: request.body.first_name,
			last_name: request.body.last_name,
			password: request.body.password,
			activated: false
		}
	}).spread(function(user, created) {
		if (created) {
			//creating an activation code which could be used in email confrm.
			Activations.create({
				user_id: user.get().id,
				activation_code: key_generator.generate(100, false)
			}).then(activation => {
				if (activation !== null) {
					// returning the code if everything went as planed
					response.json({
						user_email: user.email,
						activation_code: activation.activation_code,
						redirect_link: request.body.redirect_link
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
