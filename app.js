const express = require("express");
const jwt = require("jsonwebtoken");
const body_parser = require("body-parser");
const multer = require("multer");
const upload = multer();
const cron = require("cron").CronJob;
const bcrypt = require("bcrypt");
const middleware = require("./middleware/middleware");

const db = require("./database/database");
const Users = new db.models.Users();
const Activations = new db.models.Activations();
const Resets = new db.models.Resets();

const app = express();

let key = generateRandom(250, true);

//app.use(body_parser()); is depricated
// parse application/x-www-form-urlencoded
app.use(body_parser.urlencoded({ extended: false }));

// parse application/json
app.use(body_parser.json());

// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

app.get("/", (request, responce) => {
	responce.sendStatus(200);
});

app.post("/register", middleware.register, (request, responce) => {
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
				activation_code: generateRandom(100, false)
			}).then(activation => {
				if (activation !== null) {
					// returning the code if everything went as planed
					responce.json({
						user_email: user.email,
						activation_code: activation.activation_code,
						redirect_link: request.body.redirect_link
					});
				} else {
					responce.status(400).send({
						error: "activation_code",
						info: "Could not generate."
					});
				}
			});
		} else {
			responce.status(400).send({
				error: "user",
				info: "exists"
			});
		}
	});
});

app.post("/login", middleware.login, (request, responce) => {
	Users.findOne({ where: { email: request.body.email } }).then(user => {
		// project will be the first entry of the Projects table with the title 'aProject' || null
		if (user !== null) {
			if (user.activated) {
				bcrypt.compare(request.body.password, user.password, function(
					error_hash,
					result_hash
				) {
					if (error_hash) {
						responce
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
									responce
										.status(400)
										.send({ error: "JWT", info: "sign" });
								} else {
									responce.json({
										user: user.get({ plain: true }),
										token: token
									});
								}
							});
						} else {
							responce
								.status(400)
								.send({ error: "password", info: "incorect" });
						}
					}
				});
			} else {
				responce
					.status(400)
					.send({ error: "email", info: "confirmation" });
			}
		} else {
			responce.status(400).send({ error: "user", info: "no_match" });
		}
	});
});

app.post("/verify", middleware.verifyToken, (request, responce) => {
	jwt.verify(request.token, key, (error, token_data) => {
		if (error) {
			responce.status(400).send({ error: "JWT", info: "verification" });
		} else {
			responce.json({
				data: token_data
			});
		}
	});
});

app.post("/activate", middleware.activate, (request, responce) => {
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
							responce.json({
								activated: true,
								redirect_link: request.query.redirect_link
							});
						});
					});
				} else {
					responce.status(400).send({
						error: "user",
						info: "activated",
						redirect_link: request.query.redirect_link
					});
				}
			});
		} else {
			responce.status(400).send({
				error: "activation_key",
				info: "invalid",
				redirect_link: request.query.redirect_link
			});
		}
	});
});

app.post("/password/link", middleware.resetPasswordNew, function(
	request,
	responce
) {
	Users.findOne({
		where: { email: request.body.email, activated: true }
	}).then(user => {
		// project will be the first entry of the Projects table with the title 'aProject' || null
		if (user !== null) {
			Resets.create({
				user_id: user.id,
				reset_code: generateRandom(100, false)
			}).then(reset => {
				if (reset !== null) {
					// returning the code if everything went as planed
					responce.json({
						user_email: user.email,
						register_link: request.body.register_link,
						reset_code: reset.reset_code
					});
				} else {
					responce
						.status(400)
						.send({ error: "reset_code", info: "generation" });
				}
			});
		} else {
			responce.status(400).send({
				error: "user",
				info: { case_1: "!exists", case_2: "!acitvated" }
			});
		}
	});
});

app.post("/password/reset", middleware.resetPassword, function(
	request,
	responce
) {
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
						responce.json({
							reset: true,
							redirect_link: request.query.redirect_link
						});
					});
				});
			});
		} else {
			responce.status(400).send({ error: "reset_code", info: "!exists" });
		}
	});
});

/**
 * generating new secret key to sign all the tokens with
 */
function generateRandom(length, include_special) {
	let key = "";
	const date = new Date().getTime();
	let char_list =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	if (include_special) {
		char_list =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
	}

	for (var i = 0; i < length; i++) {
		key += char_list.charAt(Math.floor(Math.random() * char_list.length));
	}
	return key + date;
}

//running a cronjob every day at 00:00 to generate new key
new cron(
	"0 0 0 * * *",
	function() {
		key = generateRandom(250, true);
	},
	null,
	true,
	"Europe/Amsterdam"
);

app.listen(5001, () => {
	console.log("Auth service running...");
});
