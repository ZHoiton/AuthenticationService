const Sequelize = require("sequelize");

module.exports = Invites;

function Invites(sequelize) {
	return sequelize.define(
		"invites",
		{
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			invite_code: {
				type: Sequelize.STRING
			},
			email: {
				type: Sequelize.STRING
			}
		},
		{
			freezeTableName: true // Model tableName will be the same as the model name
		}
	);
}
