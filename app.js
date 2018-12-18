const express = require("express");
const body_parser = require("body-parser");
const multer = require("multer");
const upload = multer();

const cors = require("cors");

const middleware = require("./middlewares/middleware");
const auth = require("./app/controllers/authController");
//called to initialize the cronjob
const resetKey = require("./app/jobs/resetKeyJob");

const app = express();

//disabling the header due to some vulnerabilities by which a hacker can abuse the service, 
//as it will give away on what the service is running on
app.disable("x-powered-by");

//cors to tighten up the allowed incoming requests
app.use(
	cors({
		optionsSuccessStatus: 200,
		// origin: '<gateway_service_domain>',
		methods: ["POST"],
		allowedHeaders: ["Content-Type", "Authorization"],
		preflightContinue: false
	})
);

// for parsing application/x-www-form-urlencoded
app.use(body_parser.urlencoded({ extended: false }));

// for parsing application/json
app.use(body_parser.json());

// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

/*
|================================================================
| Response variants
|================================================================
*/
// for Data Errors
// 		400 for when the requested information is incomplete or malformed.
// 		422 for when the requested information is okay, but invalid.
// 		404 for when everything is okay, but the resource doesn’t exist.
// 		409 for when a conflict of data exists, even with valid information.
//		410 for when a resource  is no longer available and will not be available again.
// for Auth Errors
// 		401 for when an access token isn’t provided, or is invalid.
// 		403 for when an access token is valid, but requires more privileges.
// for Standard Statuses
// 		200 for when everything is okay.
// 		204 for when everything is okay, but there’s no content to return.
// 		500 for when the server throws an error, completely unexpected.

/*
|================================================================
| Register route
|================================================================
*/
/**
 * @param {Request Body} email           - email of the user which is being registered.
 * @param {Request Body} password        - password of the user which is being registered.
 * @param {Request Body} activation_link - an activation link which the user needs to visit to activate his/her user.
 */
app.post("/register", middleware.register, auth.register);
/**
 * @returns {Response Error} - if any of the parameters is missing.
 * @example {
 * 				error: "parameter",
 * 				field: <parameter.name>,
 * 				info: "missing"
 * 			}
 *
 * @returns {Response Error} - if any of the parameters is empty.
 * @example {
 * 				error: "parameter",
 * 				field: <name>,
 * 				info: "empty"
 * 			}
 *
 * @returns {Response Error} - if the password complexity is insufficient.
 * @example {
 * 				error: "parameter",
 * 				field: "password",
 * 				info: "insufficient complexity"
 * 			}
 *
 * @returns {Response Error} - if the value passed under the email param is faulty.
 * @example {
 * 				error: "parameter",
 * 				field: "email",
 * 				info: "incorrect email"
 * 			}
 *
 * @returns {Response Error} - if the user is already registered.
 * @example {
 * 				error: "user",
 * 				info: "exists"
 * 			}
 *
 * @returns {Response Error} - if there was a problem generating the activation code, a new request can be considered.
 * @example {
 * 				error: "activation_code",
 * 				info: "Could not generate."
 * 			}
 *
 * @returns {Response Success} - user is created.
 * @example {
 * 				user_email: <email>,
 * 				activation_link: <activation_link>
 * 			}
 */

/*
|================================================================
| Login route
|================================================================
*/
/**
 * @param {Request Body} email    - email of the user which is being logged in.
 * @param {Request Body} password - password of the user which is being logged in.
 */
app.post("/login", middleware.login, auth.login);
/**
 * @returns {Response Error} - if any of the parameters is missing.
 * @example {
 * 				error: "parameter",
 * 				field: <parameter.name>,
 * 				info: "missing"
 * 			}
 *
 * @returns {Response Error} - if any of the parameters is empty.
 * @example {
 * 				error: "parameter",
 * 				field: <name>,
 * 				info: "empty"
 * 			}
 *
 * @returns {Response Error} - if the value passed under the email param is faulty.
 * @example {
 * 				error: "parameter",
 * 				field: "email",
 * 				info: "incorrect email"
 * 			}
 *
 * @returns {Response Error} - if no user with the given credentials was found.
 * @example {
 * 				error: "user",
 * 				info: "no_match"
 * 			}
 *
 * @returns {Response Error} - if the user is not activated (not confirmed).
 * @example {
 * 				error: "user",
 * 				info: "not activated"
 * 			}
 *
 * @returns {Response Error} - if there was problem de-hashing the password from the database.
 * @example {
 * 				error: "password",
 * 				info: "de-hash"
 * 			}
 *
 * @returns {Response Error} - if the password provided does not match.
 * @example {
 * 				error: "user",
 * 				info: "incorrect password"
 * 			}
 *
 * @returns {Response Error} - if there was problem signing the JWT token.
 * @example {
 * 				error: "JWT",
 * 				info: "sign"
 * 			}
 *
 * @returns {Response Success} - user is logged.
 * @example {
 * 				token: <token>
 * 			}
 */

/*
|================================================================
| Verify route
|================================================================
*/
/**
 * @param {Request Header} Authorization - JWT token.
 */
app.post("/verify", middleware.verifyToken, auth.verify);
/**
 * @returns {Response Error} - if no token is found in the request.
 * @example {
 * 				error: "header",
 * 				info: "no token found"
 * 			}
 *
 * @returns {Response Error} - if there was problems with verifying the token.
 * @example {
 * 				error: "JWT",
 * 				info: "verification"
 * 			}
 *
 * @returns {Response Success} - returns all the data which is in the token.
 * @example {
 * 				data: <token_data>
 * 			}
 */

/*
|================================================================
| Activate route
|================================================================
*/
/**
 * @param {Request Query} activation_code - activation code associated with the user taken from the /register response.
 */
app.post("/activate", middleware.activate, auth.activate);
/**
 * @returns {Response Error} - if any of the parameters is missing.
 * @example {
 * 				error: "parameter",
 * 				field: <parameter.name>,
 * 				info: "missing"
 * 			}
 *
 * @returns {Response Error} - if any of the parameters is empty.
 * @example {
 * 				error: "parameter",
 * 				field: <name>,
 * 				info: "empty"
 * 			}
 *
 * @returns {Response Error} - if an invalid activation code was passed.
 * @example {
 * 				error: "activation_code",
 * 				info: "invalid"
 * 			}
 *
 * @returns {Response Error} - if the user associated with the activation code is already activated (impossible to get,
 * 							   because the activation is destroyed after the user is activated).
 * @example {
 * 				error: "user",
 * 				info: "activated"
 * 			}
 *
 * @returns {Response Success} - if everything proceeds as it should.
 * @example {
 * 				activated: true
 * 			}
 */

/*
|================================================================
| Password Link route
|================================================================
*/
/**
 * @param {Request Body} email         - email of the user which needs a password reset link.
 * @param {Request Body} register_link - the link to which the user will be redirected to after the request is complete
 */
app.post("/password/link", middleware.resetPasswordNew, auth.link);
/**
 * @returns {Response Error} - if any of the parameters is missing.
 * @example {
 * 				error: "parameter",
 * 				field: <parameter.name>,
 * 				info: "missing"
 * 			}
 *
 * @returns {Response Error} - if any of the parameters is empty.
 * @example {
 * 				error: "parameter",
 * 				field: <name>,
 * 				info: "empty"
 * 			}
 *
 * @returns {Response Error} - if the user either does not exist or its not activated.
 * @example {
 * 				error: "user",
 * 				info:
 * 					{
 * 						case_1: "!exists",
 * 						case_2: "!activated"
 * 					}
 * 			}
 *
 * @returns {Response Error} - if there are any problems generating the reset code.
 * @example {
 * 				error: "reset_code",
 * 				info: "generation"
 * 			}
 *
 * @returns {Response Success} - all the data which is in the token.
 * @example {
 * 				user_email: <email>,
 * 				register_link: <link>
 * 			}
 */

/*
|================================================================
| Password reset route
|================================================================
*/
/**
 * @param {Request Body} new_password         - the new password the user will be using.
 * @param {Request Body} new_password_confirm - the new password written for a second time, to check if the passwords are matching.
 * @param {Request Query} reset_code          - the reset code associated with the user taken from the '/password/link' response.
 */
app.post("/password/reset", middleware.resetPassword, auth.reset);
/**
 * @returns {Response Error} - if any of the parameters is missing.
 * @example {
 * 				error: "parameter",
 * 				field: <parameter.name>,
 * 				info: "missing"
 * 			}
 *
 * @returns {Response Error} - if any of the parameters is empty.
 * @example {
 * 				error: "parameter",
 * 				field: <name>,
 * 				info: "empty"
 * 			}
 *
 * @returns {Response Error} - if the @param new_password does NOT match with the @param new_password_confirm .
 * @example {
 * 				error: "password",
 * 				info: "no match"
 * 			}
 *
 * @returns {Response Error} - if there was a problem generating the salt used for hashing the @param new_password .
 * @example {
 * 				error: "encrypting",
 * 				info: "generating salt"
 * 			}
 *
 * @returns {Response Error} - if there was a problem generating the hash of the @param new_password .
 * @example {
 * 				error: "encrypting",
 * 				info: "generating hash"
 * 			}
 *
 * @returns {Response Error} - if @param reset_code is incorrect.
 * @example {
 * 				error: "reset_code",
 * 				info: "!exists"
 * 			}
 *
 * @returns {Response Success} - when everything proceeded correctly.
 * @example {
 *				reset: true
 * 			}
 */

app.listen(5001, () => {
	console.log("Auth service running...");
});
