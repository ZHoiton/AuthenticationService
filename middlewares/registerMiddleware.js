const validationMiddleware = require("./validationMiddleware");
const bcrypt = require("bcrypt");

//salt used for the encryption of the password
const salt_rounds = 10;

module.exports = {
	register
};

const input_params = [
	{
		name: "password",
		type: validationMiddleware.type.password,
		scope: validationMiddleware.scope.body
	},
	{
		name: "email",
		type: validationMiddleware.type.email,
		scope: validationMiddleware.scope.body
	},
	{
		name: "activation_link",
		type: validationMiddleware.type.link,
		scope: validationMiddleware.scope.body
	}
];

/**
 * Summary - middleware which validates all the input and hashes the password from the request.
 * 
 * @access public
 * 
 * @param {Request} request   - the incoming request object.
 * @param {Response} response - the response of the request object.
 * @param {Function} next     - callback function executed only if all the steps pass.
 */
function register(request, response, next) {
	if (!validationMiddleware.validate(request, response, input_params)) {
		//encrypting the password input from the request
		bcrypt.genSalt(salt_rounds, function(error, salt) {
			if (error) {
				//if the generating of the password fails return a response
				response.status(500).send({
					status: "Internal Server Error",
					code: 500,
					messages: ["server error"],
					data: {},
					error: {
						status: 500,
						error: "PASSWORD_ENCRYPTION_ERROR",
						description: "And error was rased when trying to generate salt for the hashing of the password.",
						fields: {}
					}
				});
			} else {
				bcrypt.hash(request.body.password, salt, function(
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
								description: "And error was rased when trying to hash the password.",
								fields: {}
							}
						});
					} else {
						//overwrite the password fiend if the request with the new hased one
						request.body.password = hash;
						next();
					}
				});
			}
		});
	}
}
