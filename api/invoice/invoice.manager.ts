import { Endpoint, S3 } from 'aws-sdk';
import { createWriteStream } from 'fs';
import { render } from 'mustache';
import * as wkhtmltopdf from 'wkhtmltopdf';
import { Dynamo, readFilePromise, log } from '../helper';
import { Order } from '../order/order.model';

wkhtmltopdf.command = './wkhtmltopdf';

export class InvoiceManager extends Dynamo {
  private s3;

  constructor() {
    super();
    const config = process.env.NODE_ENV ? {
        s3ForcePathStyle: true,
        endpoint: new Endpoint('http://localhost:8800'),
      } as any : {};
    this.s3 = new S3(config);
  }

  public printOrder(order: Order, awsRequestId): Promise<any> {
    return this.getTemplate('receipt.html')
      .then((template: string) => render(template, order))
      .then((rendered: string) => InvoiceManager.generatePdf(rendered, order.id))
      .then(() => readFilePromise(InvoiceManager.getFileLocation(order.id)))
      .then((data: Buffer) => this.putInvoiceToS3(order.id, data, awsRequestId));
  }

  private getTemplate(templateName): Promise<string> {
    return this.s3.getObject({
      Bucket: process.env.BUCKET as string,
      Key: templateName,
    }).promise().then(data => (data.Body as Buffer).toString('utf8'))
      .catch(e => console.log('============', e));
  }

  private putInvoiceToS3(id, data, awsRequestId): Promise<any> {
    const params = {
      Bucket: process.env.PDF_BUCKET as string,
      Key: id,
      Body: data,
      ContentType: 'application/pdf',
      ACL: 'public-read-write',
      Metadata: { 'x-amz-meta-requestId': awsRequestId },
    };

    return this.s3.putObject(params).promise();
  }

  public exists(id: string): Promise<boolean> {
    const params = {
      Bucket: process.env.PDF_BUCKET as string,
      Key: id
    };

    return this.s3.headObject(params).promise().then(data => !!data);
  }

  static generatePdf(rendered, orderId): Promise<any> {
    return new Promise((ok, notOk) => {
      wkhtmltopdf(rendered, {
        encoding: 'utf-8',
        pageSize: 'a4',
        'header-html': '',
        'footer-html': '',
        'margin-top': 15,
        'margin-bottom': 15,
        'margin-left': 15,
        'margin-right': 15,
        dpi: 300,
        'image-quality': 100,
        // 'user-style-sheet': styleSheet,
      }, (err) => {
        console.log('Generated', err);
        err ? notOk(err) : ok();
      })
        .pipe(createWriteStream(InvoiceManager.getFileLocation(orderId)));
    });
  }

  static getFileLocation(id): string {
    return process.env.NODE_ENV === 'development' ? `./.tmp/rendered-${id}.pdf`: `/tmp/rendered-${id}.pdf`;
  }

  static reformatOrderProducts(order: Order) {
    order.products.forEach(product => {
      product.description = product.description.substr(0, 130).replace(/([\uD800-\uDFFF].)|\n|([^\x00-\x7F])/g, ''),
        product.name = product.name.replace(/([\uD800-\uDFFF].)|([^\x00-\x7F])/g, '');
    });
    return order;
  }
}
