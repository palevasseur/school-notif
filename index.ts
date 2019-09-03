import * as fs from "fs";

const AWS = require('aws-sdk');
const express = require('express');

const appConfig = {
    phonesList: ['+33607666798', '+33643207293']
};

const credentials = new AWS.SharedIniFileCredentials({profile: 'school-notif-account'});
console.log('Use aws credentials:', credentials);
AWS.config.credentials = credentials;
AWS.config.region = 'eu-west-1'; // Ireland (Paris or Frankfurt don't have SMS)

const app = express();

// serve static file, ex: http://localhost:4000/index.html || http://localhost:4000
app.use(express.static(__dirname + '/web'));

// sms api
app.get('/sms', (req, res) => {
    try {
        if (!req.query.message) {
            res.send('Error: missing message parameter !');
            return;
        }

        const sns = new AWS.SNS();
        appConfig.phonesList.forEach(phoneNumber => {
            var params = {
                Message: req.query.message,
                MessageStructure: 'string',
                PhoneNumber: /^\+/.test(phoneNumber) ? phoneNumber.slice(1) : phoneNumber, // phone number without the '+'
                Subject: 'school notification'
            };

            sns.publish(params, function (err, data) {
                if (err) {
                    console.log('FAILED to sent sms, error=' + err + ', params=' + JSON.stringify(params, null, 2), err.stack);
                    //res.send('FAILED to sent sms, error=' + err + ', params=' + JSON.stringify(params, null, 2)); // todo: send here => throw err "Error: Can't set headers after they are sent"
                } else {
                    console.log('Successful sent sms, data=' + JSON.stringify(data, null, 2) + ', params=' + JSON.stringify(params, null, 2));
                    //res.send('Successful sent sms, data=' + JSON.stringify(data, null, 2) + ', params=' + JSON.stringify(params, null, 2)); // todo: send here => throw err "Error: Can't set headers after they are sent"
                }
            });
        });

        res.send('' + new Date().toLocaleString() + ': Sent sms, message=' + req.query.message + ' to ' + JSON.stringify(appConfig.phonesList));
    }
    catch (e) {
        console.log('Send sms FAILED, message=' + req.query.message + ' to ' + JSON.stringify(appConfig.phonesList) + ', Error=', e);
    }
});

app.get('/log', (req, res) => {
    const pathLog = __dirname + '/school-notif.log';
    fs.existsSync(pathLog)
        ? res.send('' + fs.readFileSync(pathLog)) // need to convert to string (avoid "download file")
        : res.send('Log file "' + pathLog + '" doesn\'t exist');
});

app.listen(4000, _ => {
    console.log('App listening on http://localhost:4000 / http://192.168.1.16:4000');
});

