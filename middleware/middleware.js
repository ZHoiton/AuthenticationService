const validator = require("validator");
const bcrypt = require("bcrypt");

const blacklist_sequence = "[\\\"<>=;:'`~,/?{}[]|()*&^%$#!]";

module.exports = {
	register,
	login,
	verifyToken,
	activate,
	resetPasswordNew,
	resetPassword
};

function register(request, responce, next) {
	const required_keys = [
		"first_name",
		"last_name",
		"password",
		"email",
		"redirect_link"
	];

	let has_error = false;

	for (const key of required_keys) {
		if (request.body[key] && !has_error) {
			if (!validator.isEmpty(request.body[key])) {
				if (key === "redirect_link") {
					request.body[key] = validator.blacklist(
						request.body[key],
						"[\\\"<>'`~,{}[]|()*^%$#!]"
					);
				} else {
					request.body[key] = validator.blacklist(
						request.body[key],
						blacklist_sequence
					);
				}

				if (key === "email") {
					if (!validator.isEmail(request.body[key])) {
						responce.status(400).send({
							error: "parameter",
							field: "email",
							info: "incorrect email"
						});
						has_error = true;
						break;
					}
				}
				if (key === "password") {
					const regex = new RegExp("([a-zA-Z][0-9]|[0-9][a-zA-z])");
					const regex_length = new RegExp(".{8,100}");
					if (
						!regex.test(request.body[key]) ||
						!regex_length.test(request.body[key])
					) {
						responce.status(400).send({
							error: "parameter",
							field: "password",
							info: "insufficient complexity"
						});
						has_error = true;
						break;
					}
				}
			} else {
				responce.status(400).send({
					error: "parameter",
					field: key,
					info: "empty"
				});
				has_error = true;
				break;
			}
		} else {
			responce.status(400).send({
				error: "parameter",
				field: key,
				info: "missing"
			});
			has_error = true;
			break;
		}
	}

	if (!has_error) {
		const salt_rounds = 10;
		bcrypt.genSalt(salt_rounds, function(error, salt) {
			if (error) {
				responce
					.status(400)
					.send({ error: "encrypting", info: "generating salt" });
			} else {
				bcrypt.hash(request.body.password, salt, function(
					error_hash,
					hash
				) {
					if (error_hash) {
						responce.status(400).send({
							error: "encrypting",
							info: "generating hash"
						});
					} else {
						request.body.password = hash;
						next();
					}
				});
			}
		});
	}
}

/**
 * middleware
 * @param {Request} request object
 * @param {Response} responce object
 * @param {Function} next callback function
 */
function login(request, responce, next) {
	//checking if there are the necessary credentials in the body
	const required_keys = ["password", "email"];

	const has_error = false;

	for (const key of required_keys) {
		if (!has_error && request.body[key]) {
			if (!validator.isEmpty(request.body[key])) {
				request.body[key] = validator.blacklist(
					request.body[key],
					blacklist_sequence
				);
			} else {
				responce.status(400).send({
					error: "parameter",
					field: key,
					info: "empty"
				});
				has_error = true;
				break;
			}
		} else {
			responce.status(400).send({
				error: "parameter",
				field: key,
				info: "missing"
			});
			has_error = true;
			break;
		}
	}

	if (!has_error) {
		next();
	}
}

/**
 * middleware
 * @param {Request} request request object
 * @param {Response} responce responce object
 * @param {Function} next callback function
 */
function verifyToken(request, responce, next) {
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
		responce.status(400).send({ error: "header", info: "no token found" });
	}
}

function activate(request, responce, next) {
	//checking if there are the necessary credentials in the body
	const required_keys = ["activation_code", "redirect_link"];

	const has_error = false;

	for (const key of required_keys) {
		if (!has_error && request.query[key]) {
			if (!validator.isEmpty(request.query[key])) {
				if (key === "redirect_link") {
					request.query[key] = validator.blacklist(
						request.query[key],
						"[\\\"<>'`~,{}[]|()*^%$#!]"
					);
				} else {
					request.query[key] = validator.blacklist(
						request.query[key],
						blacklist_sequence
					);
				}
			} else {
				responce.status(400).send({
					error: "parameter",
					field: key,
					info: "empty"
				});
				has_error = true;
				break;
			}
		} else {
			responce.status(400).send({
				error: "parameter",
				field: key,
				info: "missing"
			});
			has_error = true;
			break;
		}
	}

	if (!has_error) {
		next();
	}
}
function resetPasswordNew(request, responce, next) {
	//checking if there are the necessary credentials in the body
	const required_keys = ["email"];

	const has_error = false;

	for (const key of required_keys) {
		if (!has_error && request.body[key]) {
			if (!validator.isEmpty(request.body[key])) {
				request.body[key] = validator.blacklist(
					request.body[key],
					blacklist_sequence
				);
			} else {
				responce.status(400).send({
					error: "parameter",
					field: key,
					info: "empty"
				});
				has_error = true;
				break;
			}
		} else {
			responce.status(400).send({
				error: "parameter",
				field: key,
				info: "missing"
			});
			has_error = true;
			break;
		}
	}

	if (!has_error) {
		next();
	}
}

function resetPassword(request, responce, next) {
	//checking if there are the necessary credentials in the body
	const required_keys = ["new_password", "new_password_confirm"];

	let has_error = false;

	for (const key of required_keys) {
		if (!has_error && request.body[key]) {
			if (!validator.isEmpty(request.body[key])) {
				request.body[key] = validator.blacklist(
					request.body[key],
					blacklist_sequence
				);
				if (key === "new_password") {
					const regex = new RegExp("([a-zA-Z][0-9]|[0-9][a-zA-z])");
					const regex_length = new RegExp(".{8,100}");
					if (
						!regex.test(request.body[key]) ||
						!regex_length.test(request.body[key])
					) {
						responce.status(400).send({
							error: "parameter",
							field: "password",
							info: "insufficient complexity"
						});
						has_error = true;
						break;
					}
				}
			} else {
				responce.status(400).send({
					error: "parameter",
					field: key,
					info: "empty"
				});
				has_error = true;
				break;
			}
		} else {
			responce.status(400).send({
				error: "parameter",
				field: key,
				info: "missing"
			});
			has_error = true;
			break;
		}
	}

	if (!has_error) {
		if (request.query["reset_code"]) {
			if (!validator.isEmpty(request.query["reset_code"])) {
				request.query["reset_code"] = validator.blacklist(
					request.query["reset_code"],
					blacklist_sequence
				);
				if (
					request.body.new_password ===
					request.body.new_password_confirm
				) {
					const salt_rounds = 10;
					bcrypt.genSalt(salt_rounds, function(error, salt) {
						if (error) {
							responce.status(400).send({
								error: "encrypting",
								info: "generating salt"
							});
						} else {
							bcrypt.hash(
								request.body.new_password,
								salt,
								function(error_hash, hash) {
									if (error_hash) {
										responce.status(400).send({
											error: "encrypting",
											info: "generating hash"
										});
									} else {
										request.body.new_password = hash;
										next();
									}
								}
							);
						}
					});
				} else {
					responce
						.status(400)
						.send({ error: "password", info: "no match" });
				}
			} else {
				responce.status(400).send({
					error: "parameter",
					field: key,
					info: "empty"
				});
			}
		} else {
			responce.status(400).send({
				error: "parameter",
				field: key,
				info: "missing"
			});
		}
	}
}
