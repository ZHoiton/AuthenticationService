const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const body_parser = require("body-parser");
const multer = require("multer");
const upload = multer();
const cron = require("cron").CronJob;
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");
const validator = require('validator');

const sequelize = new Sequelize("auth_service", "root", "", {
	host: "localhost",
	dialect: "mysql",
	operatorsAliases: false,
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}
});

const Users = sequelize.define(
	"users",
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		first_name: {
			type: Sequelize.STRING
		},
		last_name: {
			type: Sequelize.STRING
		},
		email: {
			type: Sequelize.STRING,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: Sequelize.STRING
		}
	},
	{
		freezeTableName: true // Model tableName will be the same as the model name
	}
);

const app = express();

let key = generateSignKey();

//app.use(body_parser()); is depricated
// parse application/x-www-form-urlencoded
app.use(body_parser.urlencoded({ extended: false }));

// parse application/json
app.use(body_parser.json());

// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

app.get("/", (request, responce) => {});

//test register
app.post("/register", (request, responce) => {
	Users.findOrCreate({
		where: { email: "asd1@asd.com" },
		defaults: { first_name: "use1", last_name: "las1", password: "asdqawf" }
	}).spread(function(user, created) {
		console.log(
			user.get({
				plain: true
			})
		);
		console.log(created);
	});
});

app.post("/generate", extractUser, (request, responce) => {
	jwt.sign(
		{ user: request.user },
		key,
		{ algorithm: "ES256", expiresIn: "1d" },
		(error, token) => {
			if (error) {
				logError({ function: "jwt.sign", error: error });
				responce.sendStatus(403);
			}
			responce.json({ token: token });
		}
	);
});

app.post("/verify", verifyToken, (request, responce) => {
	jwt.verify(request.token, key, (error, token_data) => {
		if (error) {
			logError({ function: "jwt.verify", error: error });
			responce.sendStatus(403);
		} else {
			responce.json({
				data: token_data
			});
		}
	});
});

/**
 * middleware
 * @param {Request} request object
 * @param {Response} responce object
 * @param {Function} next callback function
 */
function extractUser(request, responce, next) {
	//checking if there are the necessary credentials in the body
	if (
		request.body.user_key !== undefined &&
		request.body.user_name !== undefined
	) {
		request.user = {
			user_key: request.body.user_key,
			user_name: request.body.user_name
		};
		next();
	} else {
		logError({
			function: "extractUser",
			error: {
				name: "UserCredentialsError",
				message: "no_creadentials_found"
			}
		});
		responce.sendStatus(403);
	}
}

/**
 * middleware
 * @param {Request} request request object
 * @param {Response} responce responce object
 * @param {Function} next callback function
 */
function verifyToken(request, responce, next) {
	//getting the auth header
	const bearer_header = request.headers["authorization"];

	if (bearer_header !== undefined) {
		//Token Syntax: Bearer <JWT>
		const bearer = bearer_header.split(" ");
		//getting the token
		const bearer_token = bearer[1];
		//attaching it to the request
		request.token = bearer_token;
		//continue
		next();
	} else {
		logError({
			function: "verifyToken",
			error: { name: "VerificationFailed", message: "no_token_found" }
		});
		responce.sendStatus(403);
	}
}

/**
 * used to log all the errors occured in the service
 * @param {JSON} error object representing the name of the error and the message
 */
function logError(error) {
	const timestamp = new Date();
	const line = timestamp + ": " + JSON.stringify(error) + "\r\n";
	fs.appendFile("log.txt", line, function(error_write, data) {});
}

/**
 * generating new secret key to sign all the tokens with
 */
function generateSignKey() {
	let key = "";
	const date = new Date().getTime();
	const char_list =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+/?.,<>";

	for (var i = 0; i < 250; i++) {
		key += char_list.charAt(Math.floor(Math.random() * char_list.length));
	}
	return key + date;
}

//running a cronjob every day at 00:00 to generate new key
new cron(
	"0 0 0 * * *",
	function() {
		key = generateSignKey();
	},
	null,
	true,
	"Europe/Amsterdam"
);

app.listen(5001, () => {
	console.log("Auth service running...");
});
