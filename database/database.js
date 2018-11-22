const Sequelize = require("sequelize");
const UsersModel = require("./models/users");
const ActivationsModel = require("./models/activations");
const ResetsModel = require("./models/resets");

module.exports = {
	models: {
		Users,
		Activations,
		Resets
	}
};

const sequelize = new Sequelize("auth_service", "root", "", {
	host: "localhost",
	dialect: "mysql",
	operatorsAliases: false,
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	}
});

function Users() {
	return new UsersModel(sequelize);
}

function Activations() {
	return new ActivationsModel(sequelize);
}
function Resets() {
	return new ResetsModel(sequelize);
}
