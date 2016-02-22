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
const pubnub = require("pubnub")({
    ssl: true,
    publish_key: nconf.get('pubnub_publish_key'),
    subscribe_key: nconf.get('pubnub_subscribe_key')
});

// set up redis
const redisClient = redis.createClient(
    nconf.get('redis_port') || '6379',
    nconf.get('redis_host') || '127.0.0.1', 
    {
        'auth_pass': nconf.get('redis_password'),
        'return_buffers': true
    }
).on('error', function(err) {
    console.error('ERR:REDIS: ' + err);
});

// show the index page
app.get('/', function(req, res, next) {
    redisClient.get('clicks', function(err, data) {
        let clicks = data ? data : 0;
        clicks = clicks > 100 ? 100 : clicks;
        if (err) { return next(err); }
        res.render('index', {
            subscribeKey: nconf.get('pubnub_subscribe_key'),
            clicks: clicks + "" // swig type coersion bug
        });
    });
});

// reset the counter in redis to 0 votes
app.get('/reset', function(req, res, next) {
    redisClient.set('clicks', 0, function(err, data) {
        if (err) { return next(err); }
        res.sendStatus(202);
    });
});


// increment the click counter in memcached
app.post('/click', function(req, res, next) {
    redisClient.incr('clicks', function(err, reply) {
        if (err) return next(err);
        // broadcast the new click count to connected clients
        let clicks = (reply > 100) ? 100 : reply;
        api.output();
        pubnub.publish({
            channel: 'click',
            message: clicks,
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
