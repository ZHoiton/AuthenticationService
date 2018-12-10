const validationMiddleware = require("./validationMiddleware");

module.exports = {
	login
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
function login(request, response, next) {
	if (!validationMiddleware.validate(request, response, input_params)) {
		next();
	}
}
