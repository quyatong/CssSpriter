var path = require('path');
var sizeOf = require('image-size');
var _ = require('underscore');

var convert = function (bkInfos, filePath) {
    
    var imgInfos = [];

    _.each(bkInfos, function (bkInfo) {
        imgInfos.push(bkInfo);
    });

    return imgInfos;
};

module.exports = exports = convert;
