const validationMiddleware = require("./validationMiddleware");

module.exports = {
	activate
};

const input_params = [
	{
		name: "activation_code",
		type: validationMiddleware.type.field,
		scope: validationMiddleware.scope.query
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
function activate(request, response, next) {
	if (!validationMiddleware.validate(request, response, input_params)) {
		next();
	}
}
