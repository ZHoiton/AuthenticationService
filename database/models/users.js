const Sequelize = require("sequelize");

module.exports = Users;

function Users(sequelize) {
	return sequelize.define(
		"users",
		{
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true
			},
			email: {
				type: Sequelize.STRING,
				validate: {
					isEmail: true
				}
			},
			password: {
				type: Sequelize.STRING
			},
			activated: {
				type: Sequelize.BOOLEAN
			}
		},
		{
			freezeTableName: true // Model tableName will be the same as the model name
		}
	);
}
