/**
 * @file 转化为png8图片(效果不大好，先抛弃不用)
 * @author quyatong <quyatong@baidu.com>
 */

var execFile = require('child_process').execFile;
var path = require('path');
var when = require('when');

/**
 * 转化为png8
 *
 * @param  {string} imgFilePath 图片路径
 * @return {Promise}            promise
 */
function convertToPng8 (imgFilePath) {
    var promise = when.defer();
    var dirName = path.dirname(imgFilePath);
    var fileName = path.basename(imgFilePath, '.png');
    var png8FileName = fileName + '-ie6' + '.png';
    var png8FilePath = dirName + '/' + png8FileName;

    execFile('pngquant', ['-o', png8FilePath, imgFilePath], function (err) {
        if (err) {
            throw err;
        }
        promise.resolve(png8FileName);
    });

    return promise.promise;
}

module.exports = exports = convertToPng8;
