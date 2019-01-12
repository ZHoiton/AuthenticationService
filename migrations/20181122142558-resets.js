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
		.createTable("resets", {
			id: { type: "int", primaryKey: true, autoIncrement: true },
			user_id: "int",
			reset_code: "string",
			createdAt: "timestamp",
			updatedAt: "timestamp"
		})
		.then(() => {
			db.addIndex(
				"resets",
				"resets_table_reset_code_index",
				["reset_code"],
				false
			);
			db.addIndex(
				"resets",
				"resets_table_user_id_index",
				["user_id"],
				false
			);
		});
};

exports.down = function(db) {
	return db.dropTable("resets");
};

exports._meta = {
	version: 1
};
