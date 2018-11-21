const Sequelize = require("sequelize");
const UsersModel = require("./models/users");
const ActivationsModel = require("./models/activations");

module.exports = {
	models: {
		Users,
		Activations
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
