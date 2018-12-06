const jwt = require("jsonwebtoken");

module.exports = {
	verify
};

function verify(request, response, key) {
	jwt.verify(request.token, key, (error, token_data) => {
		if (error) {
			response.status(400).send({ error: "JWT", info: "verification" });
		} else {
			response.json({
				data: token_data
			});
		}
	});
}
