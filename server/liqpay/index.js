var crypto  = require('crypto');
import * as config from "../config/environment"


function LiqPay(publicKey, privateKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.apiEndpoint = 'https://www.liqpay.com/api/3/checkout';
    this.apiVersion = '3';

    this.generatePaymentLink = function(params) {
        params.***REMOVED*** = this.publicKey;
        params.version = this.apiVersion;

        var data = this.paramsToDataString(params);
        var signature = this.signString(data);

        return this.apiEndpoint + '?data=' + data + '&signature=' + signature;
    };

    this.signString = function(data) {
        var sha1 = crypto.createHash('sha1');
        sha1.update(this.privateKey + data + this.privateKey);

        return sha1.digest('base64');
    };

    this.paramsToDataString = function (params) {
        return new Buffer(JSON.stringify(params)).toString('base64');
    }
}

export default new LiqPay(config.liqpay.publicKey, config.liqpay.privateKey);
