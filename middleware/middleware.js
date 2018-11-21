const validator = require("validator");
const bcrypt = require("bcrypt");

const blacklist_sequence = "[\\\"<>=;:'`~,/?{}[]|()*&^%$#!]";

module.exports = {
    register,
    login,
    verifyToken,
    activate
};

function register(request, responce, next) {
    const required_keys = ["first_name", "last_name", "password", "email"];

    let has_error = false;

    for (const key of required_keys) {
        console.log("qwe:" + request.body[key]);
        if (request.body[key] && !has_error) {
            if (!validator.isEmpty(request.body[key])) {
                request.body[key] = validator.blacklist(request.body[key], blacklist_sequence);
                if (key === "email") {
                    if (!validator.isEmail(request.body[key])) {
                        responce.status(400).send({ error: "email param not an email", field: key });
                        has_error = true;
                        break;
                    }
                }
            } else {
                responce.status(400).send({ error: "empty param", field: key });
                has_error = true;
                break;
            }
        } else {
            responce.status(400).send({ error: "missing param", field: key });
            has_error = true;
            break;
        }
    }

    if (!has_error) {
        const salt_rounds = 10;
        bcrypt.genSalt(salt_rounds, function(error, salt) {
            if (error) {
                responce.status(400).send({ error: "error generating salt" });
            } else {
                bcrypt.hash(request.body.password, salt, function(error_hash, hash) {
                    if (error_hash) {
                        responce.status(400).send({ error: "error generating hash" });
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
                request.body[key] = validator.blacklist(request.body[key], blacklist_sequence);
            } else {
                responce.status(400).send({ error: "empty param", field: key });
                has_error = true;
                break;
            }
        } else {
            responce.status(400).send({ error: "missing param", field: key });
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
        logError({
            function: "verifyToken",
            error: { name: "VerificationFailed", message: "no_token_found" }
        });
        responce.sendStatus(403);
    }
}

function activate(request, responce, next) {
    const blacklist = "\\\"=<>;";
    //checking if there are the necessary credentials in the body
    const required_keys = ["activation_code"];

    const has_error = false;

    for (const key of required_keys) {
        if (!has_error && request.body[key]) {
            if (!validator.isEmpty(request.body[key])) {
                request.body[key] = validator.blacklist(request.body[key], blacklist);
            } else {
                responce.status(400).send({ error: "empty param", field: key });
                has_error = true;
                break;
            }
        } else {
            responce.status(400).send({ error: "missing param", field: key });
            has_error = true;
            break;
        }
    }

    if (!has_error) {
        next();
    }}
