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
		.createTable("invites", {
			id: { type: "int", primaryKey: true, autoIncrement: true },
			invite_code: "string",
			email: "string",
			createdAt: "timestamp",
			updatedAt: "timestamp"
		})
		.then(() => {
			db.addIndex(
				"invites",
				"invites_table_invite_code_index",
				["invite_code"],
				false
			);
		});
};

exports.down = function(db) {
	return db.dropTable("invites");
};

exports._meta = {
	version: 1
};
