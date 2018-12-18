const validator = require("validator");

const blacklist_link_sequence = "\\\\\"<>'`~,{}[]|()*^%$#!";
const blacklist_field_sequence = "\\\\\"<>=;:'`~,/?{}[]|()*&^%$#!";

/**
 * @param type.field    - normal parameter.
 * @param type.password - parameter which is expected to be a password.
 * @param type.link     - parameter which is expected to be a link.
 * @param type.email    - parameter which is expected to be a email.
 */
const type = Object.freeze({
	field: "field",
	password: "password",
	link: "link",
	email: "email"
});

/**
 * @param scope.body  - for a parameter which should be present in the body of the request.
 * @param scope.query - for a parameter which should be present in the query of the request.
 */
const scope = Object.freeze({
	body: "body",
	query: "query"
});

module.exports = {
	scope,
	type,
	validate
};

/**
 * Summary - function to to validate all the required inputs from the request.
 *
 * @access	public
 *
 * @param {Request} request object
 * @param {Response} response object
 *
 * @param {Object[]} inputs    - an array of inputs used to loop thought.
 * @param {Object} input       - an object passed used in the validation.
 * @param {Object} input.name  - the name of the input by which it will be matched in the incoming request.
 * @param {Object} input.type  - the type of the input used to check specific validations.
 * @param {Object} input.scope - the scope in which the field should be present at.
 */
function validate(request, response, inputs) {
	if (!areInputsPresent(request, response, inputs)) {
		return true;
	}
	if (!areInputsFilled(request, response, inputs)) {
		return true;
	}
	if (!areInputsValid(request, response, inputs)) {
		return true;
	}

	//looping trough all the required inputs in the inputs[]
	for (const input of inputs) {
		//sanitize the current field
		request = sanitizeField(request, input);
	}

	return false;
}

function areInputsPresent(request, response, inputs) {
	let missing_input = {};
	//looping trough all the required inputs in the inputs[]
	for (const input of inputs) {
		let request_input = findField(request, input);
		//checking to see if the current input is not empty
		if (!request_input) {
			missing_input[input.name] = "Input Missing.";
		}
	}

	if (!isObjectEmpty(missing_input)) {
		response.status(400).send({
			status: "Bad Request",
			code: 400,
			messages: ["information is incomplete or malformed"],
			data: {},
			error: {
				status: 400,
				error: "FIELDS_MISSING_ERROR",
				description: "One or more fields raised errors.",
				fields: missing_input
			}
		});

		return false;
	}
	return true;
}

function areInputsFilled(request, response, inputs) {
	let empty_input = {};
	//looping trough all the required inputs in the inputs[]
	for (const input of inputs) {
		let request_input = findField(request, input);
		//checking to see if the current input is not empty
		if (isFieldEmpty(request_input)) {
			empty_input[input.name] = "Input Empty.";
		}
	}

	if (!isObjectEmpty(empty_input)) {
		response.status(400).send({
			status: "Bad Request",
			code: 400,
			messages: ["information is incomplete or malformed"],
			data: {},
			error: {
				status: 400,
				error: "FIELDS_EMPTY_ERROR",
				description: "One or more fields raised errors.",
				fields: empty_input
			}
		});

		return false;
	}
	return true;
}

function areInputsValid(request, response, inputs) {
	let invalid_input = {};
	//looping trough all the required inputs in the inputs[]
	for (const input of inputs) {
		let request_input = findField(request, input);
		//checking to see if the input is an email, if its applying specific validation
		if (input.type === type.email) {
			if (!isEmailValid(request_input)) {
				invalid_input[input.name] = "Invalid email address.";
			}
			//checking to see if the input is an password, if its applying specific validation
		} else if (input.type === type.password) {
			if (!isPasswordValid(request_input)) {
				invalid_input[input.name] = "Password complexity insufficient.";
			}
		}
	}

	if (!isObjectEmpty(invalid_input)) {
		response.status(422).send({
			status: "Bad Request",
			code: 422,
			messages: ["information is okay, but invalid"],
			data: {},
			error: {
				status: 422,
				error: "FIELDS_VALIDATION_ERROR",
				description: "One or more fields raised validation errors.",
				fields: invalid_input
			}
		});

		return false;
	}
	return true;
}

function isObjectEmpty(object) {
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			return false;
		}
	}
	return true;
}

/**
 * Summary - function to check if the passed email is a legitimate one.
 *
 * @access	private
 *
 * @param {String} email - request parameter to be validated.
 * @returns - false if the email is invalid, otherwise returns true.
 */
function isEmailValid(email) {
	if (validator.isEmail(email)) {
		return true;
	}
	return false;
}

/**
 * Summary - function to sanitize the passed input and reassign it in the request.
 *
 * @access	private
 *
 * @param {String} request - the incoming request.
 * @param {String} field   - request parameter for sanitization.
 * @returns - returns the request object with the changed field.
 */
function sanitizeField(request, field) {
	//depending on the input, a different sequence is used
	const blacklist =
		field.type === type.link
			? blacklist_link_sequence
			: blacklist_field_sequence;

	switch (field.scope) {
		case scope.body:
			request.body[field.name] = validator.blacklist(
				request.body[field.name],
				blacklist
			);
			return request;
		case scope.query:
			request.query[field.name] = validator.blacklist(
				request.query[field.name],
				blacklist
			);
			return request;
		default:
			return request;
	}
}

/**
 * Summary - function to sanitize the passed link in the parameters.
 *
 * @access	private
 *
 * @param {String} link - link to be sanitized.
 * @returns - the sanitized link.
 */
function sanitizeLink(link) {
	return validator.blacklist(link, "[\\\"<>'`~,{}[]|()*^%$#!]");
}

/**
 * Summary - function to check if the password passes all the rules.
 *
 * @access	private
 *
 * @param {string} password - password to be checked.
 * @returns - true if the password passes all the validation, otherwise false.
 */
function isPasswordValid(password) {
	//regex for checking if there is at least 1 number and at least 1 char in the password
	const regex_include_number_and_char = new RegExp(
		"([a-zA-Z][0-9]|[0-9][a-zA-z])"
	);
	//regex for checking the length of the password
	const regex_password_length = new RegExp(".{8,100}");
	if (
		!regex_include_number_and_char.test(password) ||
		!regex_password_length.test(password)
	) {
		return false;
	}
	return true;
}

/**
 * Summary - function to check if the field passed in the parameters is empty.
 *
 * @access	private
 *
 * @param {string} field - request field to be checked.
 * @returns - true if the field is empty or it doesn't exist, otherwise returns false.
 */
function isFieldEmpty(field) {
	return validator.isEmpty(field);
}

/**
 * Summary - function to extract the input from the request by the specified parameters in the input object
 *
 * @access	private
 *
 * @param {Request} request - the incoming request object.
 * @param {Object}  input   - input object with all the expected properties.
 * @returns - the input from the given scope,if no scone is given an undefined is returned.
 */
function findField(request, input) {
	switch (input.scope) {
		case scope.body:
			return request.body[input.name];
		case scope.query:
			return request.query[input.name];
		default:
			return undefined;
	}
}
