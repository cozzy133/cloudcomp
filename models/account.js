var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Account = new Schema({
    entry: { type: Date, default: Date.now() },
    name: {type: String, default: "None given"},
    email: String,
    password: String
});

module.exports = mongoose.model('Account', Account);