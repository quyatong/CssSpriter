/**
 * @file 分析css文件
 * @author quyatong <quyatong@baidu.com>
 */

var fs = require('fs');
var path = require('path');
var css = require('css');
var sizeOf = require('image-size');
var _ = require('underscore');

/**
 * 根据CSS RULES 分析
 *
 * @param  {Array}  rules       ast rules
 * @param  {string} filePath    文件路径
 * @return {Array}              图片信息数组
 */
function getImgInfos (rules, filePath) {

    var imgInfos = [];
    _.each(rules, function (rule) {

        // 选取background开头的属性
        var declarations = _.filter(rule.declarations, function (declaration) {
            return /background*/.test(declaration.property);
        });

        var bkgrds = [];
        var bkgrdDcrs = [];

        // 去除重复的declaration
        for (var i = declarations.length - 1; i >= 0; i--) {
            if (!_.contains(bkgrds, declarations[i].property)) {
                bkgrdDcrs.unshift(declarations[i]);
                bkgrds.push(declarations[i].property);
            }
        }

        var background = {};

        ['background-image', 'background-color', 'background-position', 'background-repeat'].forEach(function (item) {
            background[item] = '';
        });

        var optionStr = '';

        _.each(bkgrdDcrs, function (declaration) {

            var value = declaration.value.replace(
                /(url\(\s*(['"])?.*?)(#[^#].*)*(\2\s*\))/,
                function (match, start, quotation, params, end) {

                    optionStr = params || '';

                    return start + end;
                }
            );

            switch (declaration.property) {
                case 'background':

                    var positionValue = /\s*(left|center|right|-?\d*px|0)?\s+(top|bottom|center|-?\d*px|0)\s*/.exec(
                        value
                    );

                    background['background-image'] = (/\s*(url\(.*?\))\s*/.exec(value) || [])[1] || '';
                    background['background-color'] = (/\s*(#[0-9a-fA-F]*|rgba\(.*?\))\s*/.exec(value) || [])[1] || '';

                    background['background-position'] =
                        positionValue
                        && (positionValue[1] + ' ' + positionValue[2])
                        || '0 0';

                    background['background-repeat'] =
                        (/(repeat-x|repeat-y|no-repeat|repeat)/.exec(value) || [])[1]
                        || '';

                    break;
                default:

                    background[declaration.property] = declaration.value;
                    break;
            }
        });

        // 处理完成后如果有image，放入图片中
        var bkimg = background['background-image'];

        if (bkimg && /\s*url\(\s*(['"]?)(.*?)\1\s*\)\s*/.test(bkimg)) {

            var url = /\s*url\(\s*(['"]?)(.*?)\1\s*\)\s*/.exec(bkimg)[2].replace(/#.*/g, '');

            if (/http/.test(url) || /^\/\//.test(url) || !/\.png$/.test(url)) {
                return;
            }

            var options = [];
            optionStr.replace(/#([^#]*)/g, function (match, option) {
                options.push(option);
                return match;
            });

            var properties = analyseOptions(background, options);

            if (!(properties.repeatX || properties.repeatY || properties.nocombine)) {
                url = url.replace(/\?.*/g, '');

                _.each(bkgrdDcrs, function (declaration) {
                    rule.declarations.splice(rule.declarations.indexOf(declaration), 1);
                });

                var imgInfo = {
                    url: url,
                    rule: rule,
                    properties: properties,
                    background: background
                };

                imgInfos.push(imgInfoHandler(imgInfo, filePath));
            }
        }
    });
    return imgInfos;
}

/**
 * 分析options
 *
 * @param  {Object} background  背景信息
 * @param  {Object} options     要分析的options
 * @return {Object}             解析后的属性
 */
function analyseOptions (background, options) {
    var properties = {};

    _.each(background, function (value, property) {
        switch (property) {

            // 背景位置
            case 'background-position':
                var x = value.split(/\s+/)[0];
                var y = value.split(/\s+/)[1];

                properties.position = {
                    x: x,
                    y: y
                };
                break;

            // 重复方向
            case 'background-repeat':
                var repeatValue = value;
                if (repeatValue === 'repeat-x') {
                    properties.repeatX = true;
                }
                else if (repeatValue === 'repeat-y') {
                    properties.repeatY = true;
                }
                else if (repeatValue === 'repeat') {
                    properties.nocombine = true;
                }

                break;

            default:
                break;
        }
    });

    _.each(options, function (option) {

        // e.g. 15*16 确定容器大小
        if (/(\d*)\*(\d*)/.test(option)) {
            properties.dimension = {
                width: RegExp.$1 - 0,
                height: RegExp.$2 - 0
            };
        }
        // 不合并
        else if (/(nocombine)/.test(option)) {
            properties.nocombine = true;
        }
        // repeat-x
        else if (/repeat-x/.test(option)) {
            properties.repeatX = true;
        }
        // repeat-y
        else if (/repeat-y/.test(option)) {
            properties.repeatY = true;
        }
        // 位置
        else if (/\d*,\d*/.test(option)) {
            properties.position = {
                x: option.split(',')[0],
                y: option.split(',')[1]
            };
        }
        else {
            // todo..
        }
    });

    return properties;
}

/**
 * 图片信息处理
 *
 * @param  {Object} imgInfo  图片信息
 * @param  {string} filePath 文件路径
 * @return {Object}          图片信息
 */
function imgInfoHandler (imgInfo, filePath) {

    var imgPath = path.resolve(filePath, '../', imgInfo.url);
    var originDimension = sizeOf(imgPath);

    var properties = imgInfo.properties;
    var dimension = properties.dimension || originDimension;

    imgInfo.path = imgPath;
    imgInfo.originWidth = originDimension.width;
    imgInfo.originHeight = originDimension.height;

    imgInfo.width = dimension.width;
    imgInfo.height = dimension.height;

    var x = (imgInfo.properties.position && imgInfo.properties.position.x) || 0;
    var y = (imgInfo.properties.position && imgInfo.properties.position.y) || 0;

    if (x === 'left') {
        x = 0;
    }
    else if (x === 'center') {
        x = parseInt((imgInfo.width - imgInfo.originWidth) / 2, 10);
    }
    else if (x === 'right') {
        x = imgInfo.width - imgInfo.originWidth;
    }
    else {
        x = parseInt(x, 10);
    }

    if (y === 'top') {
        y = 0;
    }
    else if (y === 'center') {
        y = parseInt((imgInfo.height - imgInfo.originHeight) / 2, 10);
    }
    else if (y === 'bottom') {
        y = imgInfo.height - imgInfo.originHeight;
    }
    else {
        y = parseInt(y, 10);
    }

    imgInfo.position = {};
    imgInfo.position.x = x;
    imgInfo.position.y = y;

    return imgInfo;
}

/**
 * 分析CSS内容
 *
 * @param  {string} fileData css文件内容
 * @param  {string} filePath css文件路径
 * @return {Object}          css信息
 */
function analyseCssData (fileData, filePath) {
    var ast = css.parse(fileData);
    var rules = ast.stylesheet.rules;
    var trueRules = _.where(rules, {type: 'rule'});

    return {
        ast: ast,
        imgInfos: getImgInfos(trueRules, filePath)
    };
}


/**
 * 分析CSS内容
 *
 * @param  {string} filePath css文件路径
 * @return {Object}          css信息
 */
function analyseCss (filePath) {
    var fileData = fs.readFileSync(filePath, {encoding: 'utf8'});

    return analyseCssData(fileData, filePath);
}

exports.analyseCss = analyseCss;
exports.analyseCssData = analyseCssData;
