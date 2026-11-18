const { model } = require("mongoose");
const { UserSchema } = require("../../schemas/signup/UserSchema.js");

const User = new model("User", UserSchema);

module.exports = { User };
