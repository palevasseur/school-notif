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
    if(!req.query.message) {
        res.send('Error: missing message parameter !');
        return;
    }

    appConfig.phonesList.forEach(phoneNumber => {
        const sns = new AWS.SNS();
        var params = {
            Message: req.query.message,
            MessageStructure: 'string',
            PhoneNumber: /^\+/.test(phoneNumber) ? phoneNumber.slice(1) : phoneNumber, // phone number without the '+'
            Subject: 'school notification'
        };

        sns.publish(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
                res.send('FAILED to sent sms, error=' + JSON.stringify(err, null, 2) + ', params=' + JSON.stringify(params, null, 2));

            }
            else {
                console.log(data);
                res.send('Successful sent sms, data=' + JSON.stringify(data, null, 2) + ', params=' + JSON.stringify(params, null, 2));
            }
        });
    });
});

app.listen(4000, _ => {
    console.log('App listening on http://localhost:4000 / http://192.168.1.16:4000');
});

