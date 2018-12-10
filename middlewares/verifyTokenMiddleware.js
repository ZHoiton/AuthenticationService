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
		response.status(400).send({ error: "header", info: "no token found" });
	}
}
