const express = require("express");
const jwt = require("jsonwebtoken");
const body_parser = require("body-parser");
const multer = require("multer");
const upload = multer();
const cron = require("cron").CronJob;
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");
const middleware = require("./middleware/middleware");

const sequelize = new Sequelize("auth_service", "root", "", {
    host: "localhost",
    dialect: "mysql",
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

const Users = sequelize.define(
    "users",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        first_name: {
            type: Sequelize.STRING
        },
        last_name: {
            type: Sequelize.STRING
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

const Activations = sequelize.define(
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

const app = express();

let key = generateRandom(250);

//app.use(body_parser()); is depricated
// parse application/x-www-form-urlencoded
app.use(body_parser.urlencoded({ extended: false }));

// parse application/json
app.use(body_parser.json());

// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

app.get("/", (request, responce) => {
    responce.sendStatus(200);
});

app.post("/register", middleware.register, (request, responce) => {
    Users.findOrCreate({
        where: { email: request.body.email },
        defaults: {
            first_name: request.body.first_name,
            last_name: request.body.last_name,
            password: request.body.password,
            activated: false
        }
    }).spread(function(user, created) {
        if (created) {
            jwt.sign({ user: user.get() }, key, (error, token) => {
                if (error) {
                    responce.status(400).send({ error: "Could not sign JWT" });
                } else {
                    Activations.create({ user_id: user.get().id, activation_code: generateRandom(100) }).then(activation => {
                        // you can now access the newly created activation via the variable activation
                    });
                    //deleting the following keys because could not find in the
                    //documentation how to exclude them in the return object from the db
                    delete user.get().id;
                    delete user.get().password;
                    delete user.get().activated;
                    delete user.get().createdAt;
                    delete user.get().updatedAt;

                    responce.json({
                        user: user.get({ plain: true }),
                        token: token
                    });
                }
            });
        } else {
            responce.json({ message: "already excists" });
        }
    });
});

app.post("/login", middleware.login, (request, responce) => {
    Users.findOne({ where: { email: request.body.email } }).then(user => {
        // project will be the first entry of the Projects table with the title 'aProject' || null
        if (user !== null) {
            if (user.activated) {
                bcrypt.compare(request.body.password, user.password, function(error_hash, result_hash) {
                    if (error_hash) {
                        responce.status(400).send({ error: "could not de-hash the password" });
                    } else {
                        if (result_hash) {
                            jwt.sign({ user: user }, key, (error, token) => {
                                if (error) {
                                    responce.status(400).send({ error: "could not sign JWT" });
                                } else {
                                    //deleting the following keys because could not find in the
                                    //documentation how to exclude them in the return object from the db
                                    delete user.get().password;
                                    delete user.get().activated;

                                    responce.json({
                                        user: user.get({ plain: true }),
                                        token: token
                                    });
                                }
                            });
                        } else {
                            responce.status(400).send({ error: "incorect password" });
                        }
                    }
                });
            } else {
                responce.status(400).send({ error: "email not confirmed" });
            }
        } else {
            responce.status(400).send({ error: "No such user" });
        }
    });
});

app.post("/verify", middleware.verifyToken, (request, responce) => {
    jwt.verify(request.token, key, (error, token_data) => {
        if (error) {
            responce.status(400).send({ error: "could not verify JWT" });
        } else {
            responce.json({
                data: token_data
            });
        }
    });
});

app.post("/activate", middleware.activate, (request, responce) => {
    Activations.findOne({ where: { activation_code: request.body.activation_code } }).then(activation => {
        if (activation !== null) {
            Users.findOne({ where: { id: activation.user_id } }).then(user => {
                if (!user.activated) {
                    user.update({
                        activated: 1
                    }).then(() => {
                        //deleting the following keys because could not find in the
                        //documentation how to exclude them in the return object from the db
                        delete user.get().password;
                        delete user.get().activated;

                        responce.json({
                            user: user.get({ plain: true })
                        });
                    });
                } else {
                    responce.status(400).send({ error: "user already activated" });
                }
            });
        } else {
            responce.status(400).send({ error: "invalid activation key" });
        }
    });
});

/**
 * generating new secret key to sign all the tokens with
 */
function generateRandom(length) {
    let key = "";
    const date = new Date().getTime();
    const char_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

    for (var i = 0; i < length; i++) {
        key += char_list.charAt(Math.floor(Math.random() * char_list.length));
    }
    return key + date;
}

//running a cronjob every day at 00:00 to generate new key
new cron(
    "0 0 0 * * *",
    function() {
        key = generateRandom(250);
    },
    null,
    true,
    "Europe/Amsterdam"
);

app.listen(5001, () => {
    console.log("Auth service running...");
});
