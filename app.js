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
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_MISSING_ERROR",
 *				description: "One or more fields raised errors.",
 *				fields: <missing_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if any of the parameters is empty.
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_EMPTY_ERROR",
 *				description: "One or more fields raised errors.",
 *				fields: <empty_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if the password complexity is insufficient.
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 422,
 *			messages: ["information is okay, but invalid"],
 *			data: {},
 *			error: {
 *				status: 422,
 *				error: "FIELDS_VALIDATION_ERROR",
 *				description: "One or more fields raised validation errors.",
 *				fields: <invalid_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if the value passed under the email param is faulty.
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 422,
 *			messages: ["information is okay, but invalid"],
 *			data: {},
 *			error: {
 *				status: 422,
 *				error: "FIELDS_VALIDATION_ERROR",
 *				description: "One or more fields raised validation errors.",
 *				fields: <invalid_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if the user is already registered.
 * @example
 * 		{
 *			status: "Conflict",
 *			code: 409,
 *			messages: ["resource already exists"],
 *			data: {},
 *			error: {
 *				status: 409,
 *				error: "RESOURCE_EXISTS_ERROR",
 *				description:
 *					"And error was rased when trying to create a resource which already exists.",
 *				fields: {}
 *			}
 *		}
 *
 * @returns {Response Error} - if there was a problem generating the activation code, a new request can be considered.
 * @example
 * 		{
 *			status: "Internal Server Error",
 *			code: 500,
 *			messages: ["server error"],
 *			data: {},
 *			error: {
 *				status: 500,
 *				error: "SERVER_ERROR",
 *				description:
 *					"And error was rased when trying to generate activation code.",
 *				fields: {}
 *			}
 *		}
 *
 * @returns {Response Success} - user is created.
 * @example
 * 		{
 *			status: "ok",
 *			code: 200,
 *			messages: [],
 *			data: {
 *				user_email: user.email,
 *				activation_link: <activation_link>
 *			},
 *			error: {}
 *		}
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
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_MISSING_ERROR",
 *				description: "One or more fields raised errors.",
 *				fields: <missing_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if any of the parameters is empty.
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_EMPTY_ERROR",
 *				description: "One or more fields raised errors.",
 *				fields: <empty_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if the value passed under the email param is faulty.
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 422,
 *			messages: ["information is okay, but invalid"],
 *			data: {},
 *			error: {
 *				status: 422,
 *				error: "FIELDS_VALIDATION_ERROR",
 *				description: "One or more fields raised validation errors.",
 *				fields: <invalid_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if no user with the given credentials was found.
 * @example
 *		{
 *			status: "Not Found",
 *			code: 404,
 *			messages: ["resource not found"],
 *			data: {},
 *			error: {
 *				status: 404,
 *				error: "RESOURCE_NOT_FOUND_ERROR",
 *				description:
 *					"And error was rased when trying to access a resource which does not exists.",
 *				fields: {}
 *			}
 *		}
 *
 * @returns {Response Error} - if the user is not activated (not confirmed).
 * @example
 * 		{
 *			status: "Forbidden",
 *			code: 403,
 *			messages: ["action not allowed"],
 *			data: {},
 *			error: {
 *				status: 403,
 *				error: "ACTION_NOT_ALLOWED_ERROR",
 *				description:
 *					"And error was rased when trying to take action on a un-authorized resource.",
 *				fields: {}
 *		}
 *
 * @returns {Response Error} - if there was problem de-hashing the password from the database.
 * @example
 *		{
 *			status: "Internal Server Error",
 *			code: 500,
 *			messages: ["server error"],
 *			data: {},
 *			error: {
 *				status: 500,
 *				error: "SERVER_ERROR",
 *				description:
 *					"And error was rased when trying to de-hash password.",
 *				fields: {}
 *			}
 *		}
 *
 * @returns {Response Error} - if the password provided does not match.
 * @example
 *		{
 *			status: "Bad Request",
 *			code: 422,
 *			messages: ["information is okay, but invalid"],
 *			data: {},
 *			error: {
 *				status: 422,
 *				error: "FIELDS_VALIDATION_ERROR",
 *				description: "credentials not correct",
 *				fields: {}
 *			}
 *		}
 *
 * @returns {Response Error} - if there was problem signing the JWT token.
 * @example
 *		{
 *			status: "Internal Server Error",
 *			code: 500,
 *			messages: ["server error"],
 *			data: {},
 *			error: {
 *				status: 500,
 *				error: "SERVER_ERROR",
 *				description:
 *					"And error was rased when trying to sign token.",
 *				fields: {}
 *			}
 *		}
 *
 * @returns {Response Success} - user is logged.
 * @example
 *		{
 *			status: "ok",
 *			code: 200,
 *			messages: [],
 *			data: {
 *				token: <token>
 *			},
 *			error: {}
 *		}
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
 * @example
 * 		{
 *			status: "Unauthorized",
 *			code: 401,
 *			messages: ["access token isn’t provided, or is invalid"],
 *			data: {},
 *			error: {
 *				status: 401,
 *				error: "AUTHENTICATION_ERROR",
 *				description:
 *					"And error was rased when trying to get the authentication header.",
 *			fields: {}
 *		}
 *
 * @returns {Response Error} - if there was problems with verifying the token.
 * @example
 * 		{
 *			status: "Internal Server Error",
 *			code: 500,
 *			messages: ["server error"],
 *			data: {},
 *			error: {
 *				status: 500,
 *				error: "SERVER_ERROR",
 *				description:
 *					"And error was rased when trying to verify token.",
 *				fields: {}
 *		}
 *
 * @returns {Response Success} - returns all the data which is in the token.
 * @example
 * 		{
 *			status: "ok",
 *			code: 200,
 *			messages: [],
 *			data: token_data,
 *			error: {}
 *		}
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
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_MISSING_ERROR",
 *				description: "One or more fields raised errors.",
 *				fields: <missing_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if any of the parameters is empty.
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_EMPTY_ERROR",
 *				description: "One or more fields raised errors.",
 *				fields: <empty_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if an invalid activation code was passed.
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 422,
 *			messages: ["information is okay, but invalid"],
 *			data: {},
 *			error: {
 *				status: 422,
 *				error: "FIELDS_VALIDATION_ERROR",
 *				description: "One or more fields raised validation errors.",
 *				fields: { activation_code: "Invalid activation code" }
 *		}
 *
 * @returns {Response Error} - if the user associated with the activation code is already activated (impossible to get,
 * 							   because the activation is destroyed after the user is activated).
 * @example
 * 		{
 *			status: "Gone",
 *			code: 410,
 *			messages: [
 *				"information is okay, but requested resource is gone"
 *			],
 *			data: {},
 *			error: {
 *				status: 410,
 *				error: "USER_ERROR",
 *				description: "User is already activated.",
 *				fields: {}
 *		}
 *}
 *
 * @returns {Response Success} - if everything proceeds as it should.
 * @example
 * 		{
 *			status: "No Content",
 *			code: 204,
 *			messages: ["user successfully activated"],
 *			data: {},
 *			error: {}
 *		}
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
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_MISSING_ERROR",
 *				description: "One or more fields raised errors.",
 *				fields: <missing_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if any of the parameters is empty.
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_EMPTY_ERROR",
 *				description: "One or more fields raised errors.",
 *				fields: <empty_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if the user either does not exist.
 * @example
 * 		{
 *			status: "Not Found",
 *			code: 404,
 *			messages: ["resource not found"],
 *			data: {},
 *			error: {
 *				status: 404,
 *				error: "RESOURCE_NOT_FOUND_ERROR",
 *				description:
 *					"And error was rased when trying to access a resource which does not exists.",
 *				fields: {}
 *		}
 *
 * @returns {Response Error} - if the user either does exist but not activated.
 * @example
 * 		{
 *			status: "Forbidden",
 *			code: 403,
 *			messages: ["action not allowed"],
 *			data: {},
 *			error: {
 *				status: 403,
 *				error: "ACTION_NOT_ALLOWED_ERROR",
 *				description:
 *					"And error was rased when trying to take action on a un-authorized resource.",
 *				fields: {}
 *		}
 *
 * @returns {Response Error} - if there are any problems generating the reset code.
 * @example
 * 		{
 *			status: "Internal Server Error",
 *			code: 500,
 *			messages: ["server error"],
 *			data: {},
 *			error: {
 *				status: 500,
 *				error: "SERVER_ERROR",
 *				description:
 *					"And error was rased when trying to generate reset code.",
 *				fields: {}
 *		}
 *
 * @returns {Response Success} - all the data which is in the token.
 * @example
 * 		{
 *			status: "ok",
 *			code: 200,
 *			messages: [],
 *			data: {
 *				user_email: <user_email>,
 *				register_link:<register_link>
 *			},
 *			error: {}
 *		}
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
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_MISSING_ERROR",
 *				description: "One or more fields raised errors.",
 *				fields: <missing_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if any of the parameters is empty.
 * @example
 * 		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_EMPTY_ERROR",
 *				description: "One or more fields raised errors.",
 *				fields: <empty_inputs>
 *			}
 *		}
 *
 * @returns {Response Error} - if the @param new_password does NOT match with the @param new_password_confirm .
 * @example
 *		{
 *			status: "Bad Request",
 *			code: 400,
 *			messages: ["information is incomplete or malformed"],
 *			data: {},
 *			error: {
 *				status: 400,
 *				error: "FIELDS_VALIDATION_ERROR",
 *				description:
 *					"And error was rased when trying to match the new_password and the new_password_confirm.",
 *				fields: {
 *					new_password:
 *						"Does not match with new_password_confirm.",
 *					new_password_confirm:
 *						"Does not match with new_password."
 *				}
 *			}
 *		}
 *
 * @returns {Response Error} - if there was a problem generating the salt used for hashing the @param new_password .
 * @example
 * 		{
 *			status: "Internal Server Error",
 *			code: 500,
 *			messages: ["server error"],
 *			data: {},
 *			error: {
 *				status: 500,
 *				error: "SERVER_ERROR",
 *				description:
 *					"And error was rased when trying to generate salt for the hashing of the password.",
 *				fields: {}
 *			}
 *		}
 *
 * @returns {Response Error} - if there was a problem generating the hash of the @param new_password .
 * @example
 * 		{
 *			status: "Internal Server Error",
 *			code: 500,
 *			messages: ["server error"],
 *			data: {},
 *			error: {
 *				status: 500,
 *				error: "SERVER_ERROR",
 *				description:
 *					"And error was rased when trying to hash the password.",
 *				fields: {}
 *			}
 *		}
 *
 * @returns {Response Error} - if @param reset_code is incorrect.
 * @example
 * 		{
 *			status: "Not Found",
 *			code: 404,
 *			messages: ["resource not found"],
 *			data: {},
 *			error: {
 *				status: 404,
 *				error: "RESOURCE_NOT_FOUND_ERROR",
 *				description:
 *					"And error was rased when trying to access a resource which does not exists.",
 *				fields: {}
 *			}
 *		}
 *
 * @returns {Response Success} - when everything proceeded correctly.
 * @example
 * 		{
 *			status: "No Content",
 *			code: 204,
 *			messages: ["password reset"],
 *			data: {},
 *			error: {}
 *		}
 */

 
/*
|================================================================
| Invite creation route
|================================================================
*/
/**
 * @param {Request Body} email                  - the email of the new user.
 * @param {Request Body} invite_activation_link - the link to where the user needs to be taken to register.
 */
app.post("/invite/create", middleware.createInvite, auth.invite);

/*
|================================================================
| Invite activation route
|================================================================
*/
/**
 * @param {Request Body} password    - the new password the user will be using.
 * @param {Request Body} invite_code - the invite code associated with the user taken from the '/invite/create' response.
 */
app.post("/invite/activate", middleware.activateAccount, auth.activateInvite);

app.listen(5001, () => {
	console.log("Auth service running...");
});
