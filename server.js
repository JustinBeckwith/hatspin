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
var pubnub = require("pubnub")({
    ssl: true,
    publish_key: nconf.get('pubnub_publish_key'),
    subscribe_key: nconf.get('pubnub_subscribe_key')
});

pubnub.subscribe({
    channel: "party",
    callback: function(message) {
        console.log('someone decided to PAARTY!');
        api.output({ percent: 100, duration_ms: 500 });
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
    redisClient.get('clicks', function(err, data) {
        console.log("err: " + err);
        console.log("data: " + data);
        if (err) { return next(err); }
        res.render('index', {
            subscribeKey: nconf.get('pubnub_subscribe_key'),
            clicks: (data ? data : 0) + "" // swig type bug
        });
    });
});


// increment the click counter in memcached
app.post('/click', function(req, res, next) {
    console.log("registering a click");
    redisClient.incr('clicks', function(err, reply) {
        if (err) return next(err);
        // broadcast the new click count to connected clients
        api.output();
        pubnub.publish({
            channel: 'click',
            message: reply,
            callback: function(r) {
                res.sendStatus(202);
            },
            error: function(err) {
                return next(err);
            }
        });
    });
});

// Start the server
const server = app.listen(process.env.PORT || 8080, 
    '0.0.0.0', function() {
    console.log('App listening at http://%s:%s', 
        server.address().address,
        server.address().port);
    console.log('Press Ctrl+C to quit.');
});
