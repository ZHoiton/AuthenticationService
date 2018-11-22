const Sequelize = require("sequelize");

module.exports = Resets;

function Resets(sequelize) {
	return sequelize.define(
		"resets",
		{
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			user_id: {
				type: Sequelize.INTEGER
			},
			reset_code: {
				type: Sequelize.STRING
			}
		},
		{
			freezeTableName: true // Model tableName will be the same as the model name
		}
	);
}
