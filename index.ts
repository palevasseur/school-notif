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
app.get('/notif', (req, res) => {
    try {
        if (!req.query.message) {
            res.send('Error: missing message parameter !');
            return;
        }

        const sns = new AWS.SNS();
        const params = {
            Message: req.query.message,
            TopicArn: 'arn:aws:sns:eu-west-1:089938603528:school-notif-topic'
        };

        const pub = sns.publish(params).promise();
        pub.then(data => {
            console.log('' + new Date().toLocaleString() + ': Successful sent email, data=' + JSON.stringify(data) + ', params=' + JSON.stringify(params));
            const success = {
                date: new Date().toLocaleString(),
                action: 'email',
                params: params,
                result: 'success',
                data: data
            };
            res.send(JSON.stringify(success));
        }).catch(err => {
            console.log('' + new Date().toLocaleString() + ': FAILED to sent email, error=' + err + ', params=' + JSON.stringify(params), err.stack);
            const failed = {
                date: new Date().toLocaleString(),
                action: 'email',
                params: params,
                result: 'failed',
                error: err
            };
            res.send(JSON.stringify(failed));
        });

        return pub;
    }
    catch (e) {
        console.log('' + new Date().toLocaleString() + ': Send sms FAILED, message=' + req.query.message + ' to ' + JSON.stringify(appConfig.phonesList) + ', Error=', e);
    }
});

app.get('/log', (req, res) => {
    const pathLog = __dirname + '/school-notif.log';
    fs.existsSync(pathLog)
        ? res.send('' + fs.readFileSync(pathLog)) // need to convert to string (avoid "download file")
        : res.send('Log file "' + pathLog + '" doesn\'t exist');
});

app.listen(4000, () => {
    console.log('App listening on http://localhost:4000 / http://192.168.1.16:4000');
});

