const jwt = require("jsonwebtoken");
const { global_key } = require("../keyController");

function verify(request, response) {
	
	jwt.verify(request.token, global_key, (error, token_data) => {
		if (error) {
			response.status(500).send({
				status: "Internal Server Error",
				code: 500,
				messages: ["server error"],
				data: {},
				error: {
					status: 500,
					error: "SERVER_ERROR",
					description:
						"And error was rased when trying to verify token.",
					fields: {}
				}
			});
		} else {
			response.status(200).send({
				status: "ok",
				code: 200,
				messages: [],
				data: token_data,
				error: {}
			});
		}
	});
}


module.exports = {
	verify
};
