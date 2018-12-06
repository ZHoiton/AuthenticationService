const express = require("express");
const body_parser = require("body-parser");
const multer = require("multer");
const upload = multer();

const cors = require("cors");

const middleware = require("./middlewares/middleware");
const auth = require("./app/controllers/authController");
const resetKey = require("./app/jobs/resetKeyJob");

const app = express();

app.disable("x-powered-by");

app.use(
	cors({
		optionsSuccessStatus: 200,
		methods: ["POST"],
		allowedHeaders: ["Content-Type", "Authorization"],
		preflightContinue: false
	})
);
//app.use(body_parser()); is depricated
// parse application/x-www-form-urlencoded
app.use(body_parser.urlencoded({ extended: false }));

// parse application/json
app.use(body_parser.json());

// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

app.post("/register", middleware.register, auth.register);

app.post("/login", middleware.login, auth.login);

app.post("/verify", middleware.verifyToken, auth.verify);

app.post("/activate", middleware.activate, auth.activate);

app.post("/password/link", middleware.resetPasswordNew, auth.link);

app.post("/password/reset", middleware.resetPassword, auth.reset);

app.listen(5001, () => {
	console.log("Auth service running...");
});
