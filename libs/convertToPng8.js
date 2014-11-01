var execFile = require('child_process').execFile;
var path = require('path');
var when = require('when');

convertToPng8 = function (imgFilePath) {
    var promise = when.defer();
    var dirName = path.dirname(imgFilePath);
    var fileName = path.basename(imgFilePath, '.png');
    var png8FileName = fileName + '-ie6' + '.png';
    var png8FilePath = dirName + '/' + png8FileName;

    execFile(pngquant, ['-o', png8FilePath, imgFilePath], function (err) {
        if (err) {
            throw err;
        }
        promise.resolve(png8FileName);
    });

    return promise.promise;
};


module.exports = exports = convertToPng8;