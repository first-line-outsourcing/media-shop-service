const nodemailer = require('nodemailer');
import { config } from '../options/config';

const nodemailerMailgun = nodemailer.createTransport({
    service: config.mailer.service,
    host: config.mailer.host,
    port: 465,
    auth: {
        user: config.mailer.user,
        pass: config.mailer.pass
    }
});

export function sendmail(event, context, callback) {
    return nodemailerMailgun.sendMail({
        from: config.mailer.from,
        to: 'oskvortsov@bestmood.tech',
        subject: 'Hello',
        text: 'Hello world?',
        html: '<h1>Htm text</h1>'
    }, (error, response) => {
        if (error) {
            console.error(error)
        } else {
            const response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'mail send'
                }),
            };
            callback(null, response);
        }
    });
}