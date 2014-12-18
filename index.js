var fs = require('fs');
var analyser = require('./libs/analyser');
var combine  = require('./libs/combine');
var convert  = require('./libs/convert');
var nesting  = require('./libs/nesting');
var cssCreator = require('./libs/cssCreator');
var path = require('path');
var when = require('when');



/**
 * 根据css文件数据做CSS SPRITE
 * 
 * @param  {string} cssData  css 数据
 * @param  {string} filePath 文件路径
 * @return {Promise}                    promise
 */
var cssDataSpriter = function (cssData, filePath) {
    var promise = when.defer();

    // 分析css文件，获取有背景的node
    var options = analyser.analyseCssData(cssData, filePath);
    var ast = options.ast;
    var imgInfos = options.imgInfos;

    // 根据bkInfos生成imgInfos
    var imgInfos = nesting(imgInfos);
    var imgFileName = 'sprite-' + path.basename(filePath, path.extname(filePath)) + '.png';
    var imgFilePath = path.dirname(filePath)+ '/' + imgFileName;

    if (!imgInfos.length) {
        promise.reject();
        return promise.promise;
    }

    // 生成合并图片
    combine(imgInfos, imgFilePath).then(
        function (imgInfos) {
            promise.resolve({
                ast: ast,
                cssData: cssCreator.cssHandler(ast, imgInfos, imgFileName),
                imgFilePath: imgFilePath,
                imgInfos: imgInfos,
                imgFileName: imgFileName
            });
        }
    );

    return promise.promise;
};

/**
 * CssSpriter
 * 
 * @param  {string}     filePath        css路径
 * @param  {string}     newFilePath     css新文件路径
 * @return {Promise}                    promise
 */
var cssSpriter = function (filePath, newFilePath) {
    var promise = when.defer();
    var cssData = fs.readFileSync(filePath, {encoding: 'utf8'});

    cssDataSpriter(
        cssData, filePath
    ).then(
        function (data) {

            data.newFilePath = newFilePath;

            // 生成css文件
            cssCreator.cssCreator(data.ast, data.imgInfos, newFilePath, data.imgFileName);

            // 将图片的信息告诉外界
            promise.resolve(data);
        }, 
        function () {
            promise.reject();
        }
    );

    return promise.promise;
};


module.exports = {
    cssSpriter: cssSpriter,
    cssDataSpriter: cssDataSpriter
};