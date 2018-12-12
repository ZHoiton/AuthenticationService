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
		where: { email: request.body.email, activated: true }
	}).then(user => {
		// project will be the first entry of the Projects table with the title 'aProject' || null
		if (user !== null) {
			Resets.create({
				user_id: user.id,
				reset_code: key_generator.generateToken()
			}).then(reset => {
				if (reset !== null) {
					// returning the reset code if everything went as planed
					response.json({
						user_email: user.email,
						register_link:
							request.body.register_link +
							"?reset_code=" +
							reset.reset_code
					});
				} else {
					response
						.status(400)
						.send({ error: "reset_code", info: "generation" });
				}
			});
		} else {
			response.status(400).send({
				error: "user",
				info: { case_1: "!exists", case_2: "!activated" }
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
						response.json({
							reset: true
						});
					});
				});
			});
		} else {
			response.status(400).send({ error: "reset_code", info: "!exists" });
		}
	});
}
