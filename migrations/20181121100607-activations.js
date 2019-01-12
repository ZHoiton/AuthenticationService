"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
	dbm = options.dbmigrate;
	type = dbm.dataType;
	seed = seedLink;
};

exports.up = function(db) {
	return db
		.createTable("activations", {
			id: { type: "int", primaryKey: true, autoIncrement: true },
			user_id: "int",
			activation_code: "string",
			createdAt: "timestamp",
			updatedAt: "timestamp"
		})
		.then(() => {
			db.addIndex(
				"activations",
				"activations_table_activation_code_index",
				["activation_code"],
				false
			);
			db.addIndex(
				"activations",
				"activations_table_user_id_index",
				["user_id"],
				false
			);
		});
};

exports.down = function(db) {
	return db.dropTable("activations");
};

exports._meta = {
	version: 1
};
