const bcrypt = require("bcrypt");
const validationMiddleware = require("./validationMiddleware");

const salt_rounds = 10;

module.exports = {
	newPassword,
	resetPassword
};

const input_params_new = [
	{
		name: "email",
		type: validationMiddleware.type.email,
		scope: validationMiddleware.scope.body
	},
	{
		name: "register_link",
		type: validationMiddleware.type.link,
		scope: validationMiddleware.scope.body
	}
];

/**
 * Summary - middleware which validates all the input from the request.
 *
 * @access public
 *
 * @param {Request} request   - the incoming request object.
 * @param {Response} response - the response of the request object.
 * @param {Function} next     - callback function executed only if all the steps pass.
 */
function newPassword(request, response, next) {
	if (!validationMiddleware.validate(request, response, input_params_new)) {
		next();
	}
}

const input_params_reset = [
	{
		name: "new_password",
		type: validationMiddleware.type.password,
		scope: validationMiddleware.scope.body
	},
	{
		name: "new_password_confirm",
		type: validationMiddleware.type.password,
		scope: validationMiddleware.scope.body
	}
];

const input_params_reset_query = [
	{
		name: "reset_code",
		type: validationMiddleware.type.field,
		scope: validationMiddleware.scope.query
	}
];

/**
 * Summary - middleware which validates all the input from the request and encrypts the new password.
 *
 * @access public
 *
 * @param {Request} request   - the incoming request object.
 * @param {Response} response - the response of the request object.
 * @param {Function} next     - callback function executed only if all the steps pass.
 */
function resetPassword(request, response, next) {
	if (!validationMiddleware.validate(request, response, input_params_reset)) {
		if (
			!validationMiddleware.validate(
				request,
				response,
				input_params_reset_query
			)
		) {
			if (
				request.body.new_password === request.body.new_password_confirm
			) {
				bcrypt.genSalt(salt_rounds, function(error, salt) {
					if (error) {
						response.status(500).send({
							status: "Internal Server Error",
							code: 500,
							messages: ["server error"],
							data: {},
							error: {
								status: 500,
								error: "PASSWORD_ENCRYPTION_ERROR",
								description:
									"And error was rased when trying to generate salt for the hashing of the password.",
								fields: {}
							}
						});
					} else {
						bcrypt.hash(request.body.new_password, salt, function(
							error_hash,
							hash
						) {
							if (error_hash) {
								response.status(500).send({
									status: "Internal Server Error",
									code: 500,
									messages: ["server error"],
									data: {},
									error: {
										status: 500,
										error: "PASSWORD_ENCRYPTION_ERROR",
										description:
											"And error was rased when trying to hash the password.",
										fields: {}
									}
								});
							} else {
								request.body.new_password = hash;
								next();
							}
						});
					}
				});
			} else {
				response.status(400).send({
					status: "Bad Request",
					code: 400,
					messages: ["information is incomplete or malformed"],
					data: {},
					error: {
						status: 400,
						error: "FIELDS_VALIDATION_ERROR",
						description:
							"And error was rased when trying to match the new_password and the new_password_confirm.",
						fields: {
							new_password:
								"Does not match with new_password_confirm.",
							new_password_confirm:
								"Does not match with new_password."
						}
					}
				});
			}
		}
	}
}
