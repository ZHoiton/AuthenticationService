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

const app = express();

let key = generateRandom(250);

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
				activation_code: generateRandom(100)
			}).then(activation => {
				if (activation !== null) {
					// returning the code if everything went as planed
					responce.json({
						activation_code: activation.activation_code
					});
				} else {
					responce
						.status(400)
						.send({ error: "Could not generate activation_code" });
				}
			});
		} else {
			responce.json({ message: "already excists" });
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
							.send({ error: "could not de-hash the password" });
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
										.send({ error: "could not sign JWT" });
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
								.send({ error: "incorect password" });
						}
					}
				});
			} else {
				responce.status(400).send({ error: "email not confirmed" });
			}
		} else {
			responce.status(400).send({ error: "No such user" });
		}
	});
});

app.post("/verify", middleware.verifyToken, (request, responce) => {
	jwt.verify(request.token, key, (error, token_data) => {
		if (error) {
			responce.status(400).send({ error: "could not verify JWT" });
		} else {
			responce.json({
				data: token_data
			});
		}
	});
});

app.post("/activate", middleware.activate, (request, responce) => {
	Activations.findOne({
		where: { activation_code: request.body.activation_code }
	}).then(activation => {
		if (activation !== null) {
			Users.findOne({ where: { id: activation.user_id } }).then(user => {
				if (!user.activated) {
					user.update({
						activated: 1
					}).then(() => {
						responce.json({
							activated: true,
							redirect: "/login"
						});
					});
				} else {
					responce
						.status(400)
						.send({ error: "user already activated" });
				}
			});
		} else {
			responce.status(400).send({ error: "invalid activation key" });
		}
	});
});

/**
 * generating new secret key to sign all the tokens with
 */
function generateRandom(length) {
	let key = "";
	const date = new Date().getTime();
	const char_list =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

	for (var i = 0; i < length; i++) {
		key += char_list.charAt(Math.floor(Math.random() * char_list.length));
	}
	return key + date;
}

//running a cronjob every day at 00:00 to generate new key
new cron(
	"0 0 0 * * *",
	function() {
		key = generateRandom(250);
	},
	null,
	true,
	"Europe/Amsterdam"
);

app.listen(5001, () => {
	console.log("Auth service running...");
});
