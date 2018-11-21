const Sequelize = require("sequelize");

module.exports = Activations;

function Activations(sequelize) {
	return sequelize.define(
		"activations",
		{
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			user_id: {
				type: Sequelize.INTEGER
			},
			activation_code: {
				type: Sequelize.STRING
			}
		},
		{
			freezeTableName: true // Model tableName will be the same as the model name
		}
	);
}
