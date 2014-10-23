var path = require('path');
var sizeOf = require('image-size');
var _ = require('underscore');

var convert = function (bkInfos, filePath) {
    
    var imgInfos = [];

    _.each(bkInfos, function (bkInfo) {
        var url = bkInfo.url;
        var imgPath = path.resolve(filePath, '../', url);

        var properties = bkInfo.properties;
        var originDimension = sizeOf(imgPath);
        var dimension = properties.dimension || originDimension;
        var nocombine = properties.nocombine;

        // 不合并直接返回
        if (nocombine) {
            return;
        }

        imgInfos.push(
            _.extend(
                {
                    path: imgPath,
                    width: dimension.width,
                    height: dimension.height,
                    originWidth: originDimension.width,
                    originHeight: originDimension.height
                },
                bkInfo
            )
        );
    });

    return imgInfos;
};

module.exports = exports = convert;
