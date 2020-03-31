var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userData = new Schema({
    array: [],
    name: {type: String, required: true, max: 100},
    email: String,
    password: String,
    rootCA: String,
    privateCert: String,
    cert: String
}, {collection: 'userCollection'});

module.exports = mongoose.model('videoInfo', userData );