var awsIot = require('aws-iot-device-sdk');

var topic = "test/testTopic"; //de
var pub = "test/testTopic1";
var host = "a12ez8atbtwwyu-ats.iot.us-east-1.amazonaws.com";

function mqtt(hostAdd, subTop, pubTop) {
    var device = awsIot.device({ // default entries
        keyPath: "uploads/cert.pem.key",
        certPath: "uploads/cert.crt",
        caPath: "uploads/rootCA.txt",
        clientId: "cozzy_website_" + Math.random().toString(36).substr(2, 9),
        host: hostAdd
    });

    device
        .on('connect', function() {
            console.log('Connected to AWS MQTT Broker');
            device.subscribe(subTop);
            console.log("Subscribed now to : " + topic);
            device.publish(pubTop, JSON.stringify({ test_data: 1}));
        });

    device
        .on('message', function(topic, payload) {
            console.log('MQTT message: ', topic, payload.toString());
            var testTopic = payload.toString();
            //io.emit('voltageData', payload);
        });
}

module.exports = mqtt;