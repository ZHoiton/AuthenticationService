const registerController = require("./auth/registerController");
const loginController = require("./auth/loginController");
const passwordRestController = require("./auth/passwordResetController");
const activationController = require("./auth/activationController");
const verificationController = require("./auth/verificationController");
const key_generator = require("./keyController");

module.exports = {
	register,
	login,
	verify,
	activate,
	link,
    reset,
};

function register(request, response) {
	return registerController.register(request, response);
}
function login(request, response) {
	return loginController.login(request, response, key_generator.getKey());
}
function verify(request, response) {
	return verificationController.verify(request, response, key_generator.getKey());
}
function activate(request, response) {
	return activationController.activate(request, response);
}
function link(request, response) {
	return passwordRestController.link(request, response);
}
function reset(request, response) {
	return passwordRestController.reset(request, response);
}
