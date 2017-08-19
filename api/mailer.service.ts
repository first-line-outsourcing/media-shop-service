const nodemailer = require('nodemailer');

export class Nodemailer {
  private nodemailerMailgun: any;

  constructor() {
    this.nodemailerMailgun = nodemailer.createTransport({
      service: 'Mailgun',
      host: 'smtp.mailgun.org',
      port: 465,
      auth: {
        user: 'postmaster@support.bestmood.tech',
        pass: 'e2242ac7e2c433e58ec90ae81559f14b'
      }
    })
  }

  public sendMailInvoiceLink(email, orderId) {
    return this.nodemailerMailgun.sendMail({
      from: 'BMT',
      to: `${email}`,
      subject: 'Media shop - BMT',
      text: 'Link to Invoice?',
      html: `
              <div>
                <h1>Notification</h1>
                <p>
                  <a href="https://s3.eu-central-1.amazonaws.com/${process.env.PDF_BUCKET}/${orderId}">Invoice link</a>
                </p>
              </div>
            `
    });
  }
}
