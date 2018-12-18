module.exports = {
	verifyToken
};

/**
 * Summary - middleware which validates that the JWT token is in the request.
 *
 * @access public
 *
 * @param {Request} request   - the incoming request object.
 * @param {Response} response - the response of the request object.
 * @param {Function} next     - callback function executed only if all the steps pass.
 */
function verifyToken(request, response, next) {
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
		response.status(401).send({
			status: "Unauthorized",
			code: 401,
			messages: ["access token isn’t provided, or is invalid"],
			data: {},
			error: {
				status: 401,
				error: "AUTHENTICATION_HEADER_ERROR",
				description:
					"And error was rased when trying to get the authentication header.",
				fields: {}
			}
		});
	}
}
