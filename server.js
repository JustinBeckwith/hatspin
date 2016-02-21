'use strict';

const express = require('express');
const nconf = require('nconf');
const swig = require('swig');
const path = require('path');
const redis = require('redis');

nconf.argv().env().file({
    file: 'secrets.json'
});

// littlebits setup
const api = require('@littlebits/cloud-http')
    .defaults({
        access_token: nconf.get('cloudbit_access_token'),
        device_id: nconf.get('cloudbit_device_id')
    });

// express setup
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

// pubnub setup
const publishKey = nconf.get('pubnub_publish_key');
const subscribeKey = nconf.get('pubnub_subscribe_key');
console.log(publishKey + ":" + subscribeKey);
var pubnub = require("pubnub")({
    ssl: true,
    publish_key: publishKey,
    subscribe_key: subscribeKey
});

pubnub.subscribe({
    channel: "party",
    callback: function(message) {
        console.log('someone decided to PAARTY!');
        api.output();
    }
});

// set up redis
const redisClient = redis.createClient(
    nconf.get('redisPort') || '6379',
    nconf.get('redisHost') || '127.0.0.1', 
    {
        'auth_pass': nconf.get('redisKey'),
        'return_buffers': true
    }
).on('error', function(err) {
    console.error('ERR:REDIS: ' + err);
});

// routes
app.get('/', function(req, res, next) {
    res.render('index');
});


// increment the click counter in memcached
app.post('/click', function(req, res, next) {
    console.log("registering a click");
    redisClient.incr('clicks', function(err, reply) {
        if (err) {
            return callback(err);
        }
        console.log('reply:' + reply);
        // get the click count 
        redisClient.get('clicks', function(err, value) {
            if (err) {
                return callback(err);
            }
            var cc = 0;
            console.log('value is: ' + value);
            if (value) {
                cc = value;
            }

            // broadcast the new click count to all connected clients
            pubnub.publish({
                channel: 'click',
                message: cc,
                callback: function(r) {
                    callback();
                },
                error: function(e) {
                    callback(e);
                }
            });
        });
    });
});

// Start the server
const server = app.listen(process.env.PORT || 8080, '0.0.0.0', function() {
    console.log('App listening at http://%s:%s', server.address().address,
        server.address().port);
    console.log('Press Ctrl+C to quit.');
});
