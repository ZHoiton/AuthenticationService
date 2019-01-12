const registerMiddleware = require("./registerMiddleware");
const loginMiddleware = require("./loginMiddleware");
const verifyTokenMiddleware = require("./verifyTokenMiddleware");
const activationMiddleware = require("./activationMiddleware");
const resetPasswordMiddleware = require("./resetPasswordMiddleware");
const inviteMiddleware = require("./invitationMiddleware");

module.exports = {
	register: registerMiddleware.register,
	login: loginMiddleware.login,
	verifyToken: verifyTokenMiddleware.verifyToken,
	activate: activationMiddleware.activate,
	resetPasswordNew: resetPasswordMiddleware.newPassword,
	resetPassword: resetPasswordMiddleware.resetPassword,
	createInvite: inviteMiddleware.registerInvite,
	activateAccount: inviteMiddleware.activateAccount
};
