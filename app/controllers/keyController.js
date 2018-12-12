module.exports = {
	getKey,
	generate,
	generateToken
};

let global_key = "";
generate(250, true);

function getKey() {
	return global_key;
}

/**
 * generating new secret key to sign all the tokens with
 */
function generate(length, include_special) {
	let key = "";
	const date = new Date().getTime();
	let char_list =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	if (include_special) {
		char_list =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
	}

	for (var i = 0; i < length; i++) {
		key += char_list.charAt(Math.floor(Math.random() * char_list.length));
	}
	global_key = key + date;
}

function generateToken() {
	let key = "";
	const date = new Date().getTime();
	let char_list =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const length = 100;
	for (var i = 0; i < length; i++) {
		key += char_list.charAt(Math.floor(Math.random() * char_list.length));
	}
	return key + date;
}
