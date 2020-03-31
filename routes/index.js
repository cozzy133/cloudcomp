const express = require("express")
const router = express.Router()
const passport = require('passport')
var mongoose = require('mongoose')
var async = require('async')
var fs = require('fs')
var awsIot = require('aws-iot-device-sdk');
var userModel = require('../models/users')
var Account = require('../models/account');

var message = "", prevMessage = ""; // mqtt message strings

var mongDB = "mongodb+srv://cozzy:CloudComp@clustercloudcomputing-nglqp.mongodb.net/cloud_computing?retryWrites=true&w=majority"
mongoose.connect(mongDB, { useNewUrlParser: true, useUnifiedTopology: true });

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
/* Once the database connection has succeeded, the code in db.once is executed. */
db.once("open", function(callback){
    console.log("Connection to database succeeded.");
});

// var topic = "test/testTopic"; //de
// var pub = "test/testTopic1";
// var host = "a12ez8atbtwwyu-ats.iot.us-east-1.amazonaws.com";
var device1 = awsIot.device;

router.get('/', checkAuthenticated, (req, res) => {
    res.render('index1.ejs', {name: req.user.name, host: "", topic: "",
        cert: "", key: "", root: ""})
})

router.post('/getMessage', checkAuthenticated, (req, res) => {
    if (message != prevMessage && message != "") {
        prevMessage = message;
        res.send("" + message);
    } else {
        console.log("No new message");
        //res.send("" + message);
    }
})

router.get('/appJS', checkAuthenticated, (req, res) => {
    res.render('app.ejs',{name: req.user.name});
})

router.get('/indexJS', checkAuthenticated, (req, res) => {
    res.render('app.ejs',{name: req.user.name});
})

router.get('/indexHTML', checkAuthenticated, (req, res) => {
    res.render('app.ejs',{name: req.user.name});
})

router.get('/loginHTML', checkAuthenticated, (req, res) => {
    res.render('app.ejs',{name: req.user.name});
})

router.get('/home', checkAuthenticated, (req, res) => {
    res.render('index1.ejs',{name: req.user.name, host: "", topic: "",
        cert: "", key: "", root: ""})
})

router.post('/home', checkAuthenticated, (req, res) => {
    const myFormObject = {
        host: req.body.host,
        topic: req.body.topic,
        cert: req.body.cert,
        key: req.body.key,
        root: req.body.root
    };

    if (req.body.cert !== "") {
        var cover = JSON.parse(req.body.cert)
        if (cover != null ) {
            var cert = new Buffer.from(cover.data, 'base64')
            myFormObject.cert = cert;
        }
    }

    if (req.body.key !== "") {
        var cover = JSON.parse(req.body.key)
        if (cover != null ) {
            var cert = new Buffer.from(cover.data, 'base64')
            myFormObject.key = cert;
        }
    }

    if (req.body.root !== "") {
        var cover = JSON.parse(req.body.root)
        if (cover != null ) {
            var cert = new Buffer.from(cover.data, 'base64')
            myFormObject.root = cert;
        }
    }
    var privateSize = getFilesizeInBytes('./uploads/cert.pem.key');
    var rootSize = getFilesizeInBytes('./uploads/rootCA.txt');
    var certSize = getFilesizeInBytes('./uploads/cert.crt');
    try {
        if (privateSize > 0) {
            console.log("private cert file already exists")
        } else {
            fs.writeFileSync('./uploads/cert.pem.key', myFormObject.key, function (err) {
                if (err) throw err;
                console.log('key saved!');
            });
        }
    } catch(err) {
        console.error(err)
    }
    try {
        if (rootSize > 0) {
            console.log("rootCA file already exists")
        } else {
            fs.writeFileSync('./uploads/rootCA.txt', myFormObject.root, function (err) {
                if (err) throw err;
                console.log('root saved!');
            });
        }
    } catch(err) {
        console.error(err)
    }
    try {
        if (certSize > 0) {
            //file exists
            console.log("Cert file already exists")
        }
        else {
            fs.writeFileSync('./uploads/cert.crt', myFormObject.cert, function (err) {
                if (err) throw err;
                console.log('cert saved!');
            });
        }
    } catch(err) {
        console.error(err)
    }
    host = myFormObject.host;
    topic = myFormObject.topic;

    device1 = awsIot.device({ // default entries
        keyPath: "uploads/cert.pem.key",
        certPath: "uploads/cert.crt",
        caPath: "uploads/rootCA.txt",
        clientId: "cozzy_website_" + Math.random().toString(36).substr(2, 9),
        host: host
    });
    device1
        .on('connect', function() {
            console.log('Connected to AWS MQTT Broker');
            device1.subscribe(topic);
            console.log("Subscribed now to : " + topic);
            device1.publish(topic, JSON.stringify({ test_data: 1}));
        });

    device1
        .on('message', function(topic, payload) {
            console.log('MQTT message: ', topic, payload.toString());
            testTopic = payload.toString();
        });

    mqttNew=true;

    //databaseTest();
    res.render('index1.ejs', {name: req.user.name, host: myFormObject.host, topic: myFormObject.topic,
        cert: myFormObject.cert, key: myFormObject.key, root: myFormObject.root});
})

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login2.ejs')
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}))

router.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

function userUpdate(array, name, email, password, rootCA, privateCert, cert, cb) {
    userDetail = {
        array: array,
        name: name,
        email: email,
        password: password,
        rootCA: rootCA,
        privateCert: privateCert,
        cert: cert
    }
    var user = new userModel(userDetail);
    user.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New user: ' + user);
        users.push(user)
        cb(null, user)
    }  );
}

function createUser(cb) {
    async.parallel([
        function(callback) {
            userUpdate(["null", "null"], "Test Name 1", "test@test.ie", "password",
                "root", "myFormObject.key", "myFormObject.cert", callback)
        },
        function(callback) {
            userUpdate(["null2", "null2"], "Test Name 2", "test2@test.ie", "password2",
                "root2", "myFormObject.key2", "myFormObject.cert2", callback)
        }
    ])
}

function databaseTest(){
        async.series([
            createUser
        ],
// Optional callback
        function(err, results) {
            if (err) {
                console.log('FINAL ERR: '+err);
            }
            else {
                console.log('users: ' + users);
            }
            // All done, disconnect from database
            mongoose.connection.close();
        });
}

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}


module.exports = router;