/**
 * @file 创建css文件
 * @author quyatong <quyatong@baidu.com>
 */

var fs = require('fs');
var css = require('css');
var _ = require('underscore');
var path = require('path');

/**
 * css处理器
 *
 * @param  {Objecr} ast         ast
 * @param  {Array}  imgInfos    图片信息数组
 * @param  {string} imgFilePath 图片路径
 * @return {string}             css内容
 */
var cssHandler = function (ast, imgInfos, imgFilePath) {
    var version = (new Date()).getTime();

    _.each(imgInfos, function (imgInfo) {

        // 将各种background属性塞进去
        imgInfo.rule.declarations.push(
            {
                'type': 'declaration',
                'property': 'background',
                'value': [
                    'url("' + imgFilePath + '#' + imgInfo.width + '*' + imgInfo.height + '?ver=' + version + '")',
                    '-' + imgInfo.fit.x + 'px ' + '-' + imgInfo.fit.y + 'px',
                    imgInfo.background['background-repeat'] || '',
                    imgInfo.background['background-color'] || ''
                ].join(' ')
            }
        );
    });

    return css.stringify(ast);
};

var cssCreator = function (ast, imgInfos, filePath, imgFilePath) {
    var cssData = cssHandler(ast, imgInfos, imgFilePath);
    fs.writeFileSync(filePath, cssData);
};

module.exports = {
    cssHandler: cssHandler,
    cssCreator: cssCreator
};
