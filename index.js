var analyser = require('./libs/analyser');
var combine  = require('./libs/combine');
var convert  = require('./libs/convert');
var nesting  = require('./libs/nesting');
var cssCreator = require('./libs/cssCreator');
var path = require('path');
var when = require('when');

/**
 * CssSpriter
 * 
 * @param  {Object} path     路径
 * @return {Promise}         promise
 */
var CssSpriter = function (filePath) {
    var promise = when.defer();

    // 分析css文件，获取有背景的node
    var ast = analyser.analyseCss(filePath);
    var bkInfos = ast.bkInfos;

    // 根据bkInfos生成imgInfos
    var imgInfos = nesting(convert(bkInfos, filePath));
    var imgFileName = path.basename(filePath, path.extname(filePath));
    var imgFilePath = 'sprite-' + imgFileName + '.png';

    // 生成合并图片
    combine(imgInfos, imgFilePath).then(function () {

        // 生成css文件
        cssCreator(ast, imgInfos, filePath, imgFilePath);

        // 将图片的信息告诉外界
        promise.resolve(imgInfos);

    });

    return promise.promise;
};




module.exports = exports = CssSpriter;