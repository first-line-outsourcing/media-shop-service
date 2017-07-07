"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var wkhtmltopdf = require("wkhtmltopdf");
var mustache_1 = require("mustache");
var aws_sdk_1 = require("aws-sdk");
var fs_1 = require("fs");
var s3 = new aws_sdk_1.S3();
var tmpFileLocation = '/tmp/rendered.pdf';
wkhtmltopdf.command = './wkhtmltopdf';
function receipt(event, context, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var data, resp, blob;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = JSON.parse(event.body);
                    if (!data || !data.hasOwnProperty('id')) {
                        return [2 /*return*/, callback(data)];
                    }
                    return [4 /*yield*/, getTemplate('receipt.html')];
                case 1:
                    resp = _a.sent();
                    return [4 /*yield*/, generatePdf(mustache_1.render(resp.Body.toString('utf8'), data))];
                case 2:
                    _a.sent();
                    blob = fs_1.readFileSync(tmpFileLocation);
                    s3.putObject({
                        Bucket: process.env.PDF_BUCKET,
                        Key: data.id,
                        Body: blob,
                        ContentType: 'application/pdf',
                        ACL: 'public-read-write',
                        Metadata: { "x-amz-meta-requestId": context.awsRequestId }
                    }, function (err) {
                        fs_1.unlinkSync(tmpFileLocation);
                        callback(err, {
                            statusCode: 200,
                            headers: {
                                'Access-Control-Allow-Origin': '*'
                            },
                            body: data.id
                        });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.receipt = receipt;
function getTemplate(templateName) {
    return s3.getObject({
        Bucket: process.env.BUCKET,
        Key: templateName
    }).promise();
}
function generatePdf(rendered) {
    return new Promise(function (ok, notOk) {
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
            'image-quality': 100
        }, function (err) { return err ? notOk(err) : ok(); })
            .pipe(fs_1.createWriteStream(tmpFileLocation));
    });
}
