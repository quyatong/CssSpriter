/**
 * @file 转换模块（预留接口，供后续使用）
 * @author quyatong <quyatong@baidu.com>
 */

var path = require('path');
var sizeOf = require('image-size');
var _ = require('underscore');

/**
 * 转换
 *
 * @param  {Array}  bkInfos  图片对象数组
 * @param  {string} filePath 文件路径
 * @return {Array}           转换后图片对象数组
 */
var convert = function (bkInfos, filePath) {

    var imgInfos = [];

    _.each(bkInfos, function (bkInfo) {
        imgInfos.push(bkInfo);
    });

    return imgInfos;
};

module.exports = exports = convert;
