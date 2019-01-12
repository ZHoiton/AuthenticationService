const { register } = require("./auth/registerController");
const { login } = require("./auth/loginController");
const { verify } = require("./auth/verificationController");
const { link, reset } = require("./auth/passwordResetController");
const { activate } = require("./auth/activationController");
const {
	createInvitation,
	activateAccount
} = require("./auth/invitationController");

module.exports = {
	register,
	login,
	verify,
	activate,
	link,
	reset,
	invite: createInvitation,
	activateInvite: activateAccount
};
