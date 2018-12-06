const cron = require("cron").CronJob;
const key_generator = require("./../controllers/keyController");

//running a cronjob every day at 00:00 to generate new key
new cron(
	"0 0 0 * * *",
	function() {
        key_generator.generate(250, true);
	},
	null,
	true,
	"Europe/Amsterdam"
);
