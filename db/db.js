var mongoose = require("mongoose"),
  bcryptjs = require("bcryptjs");

const passportLocalMongoose = require("passport-local-mongoose");

const classSchema = new mongoose.Schema({
  country: String,
  firstName: String,
  lastName: String,
  email: String,
  password: {
    type: String,
    required: true,
    set(val) {
      return bcryptjs.hashSync(val, 5);
    },
  },
  address: String,
  city: String,
  state: String,
  code: String,
  phone: String,
});

classSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", classSchema);
