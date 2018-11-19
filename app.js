const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const body_parser = require("body-parser");
const multer = require("multer");
const upload = multer();

const app = express();
//app.use(body_parser()); is depricated

// parse application/x-www-form-urlencoded
app.use(body_parser.urlencoded({ extended: false }));

// parse application/json
app.use(body_parser.json());

// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

const key = "NAoIZKEeWeL0hsv1x8mPJCYvXVgRt8mHrs5tyws4whxMeybm9m7Fb9b66B7D";

app.get("/", (request, responce) => {
	responce.json({
		message: "index"
	});
});

app.post("/generate", extractUser, (request, responce) => {
	jwt.sign({ user: request.user }, key, (error, token) => {
		if (error) {
			logError({ function: "jwt.sign", error: error });
			responce.sendStatus(403);
		}
		responce.json({ token: token });
	});
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

app.listen(5001, () => {
	console.log("Auth service running...");
});
