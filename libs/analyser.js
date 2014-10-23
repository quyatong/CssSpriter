var fs = require('fs');
var css = require('css');
var _ = require('underscore');

/**
 * 分析CSS内容
 * 
 * @param  {string} filePath css文件路径
 */
var analyseCss = function (filePath) {

    var fileData = fs.readFileSync(filePath, {encoding: 'utf8'});
    var ast = css.parse(fileData);
    var rules = ast.stylesheet.rules;
    var trueRules = _.where(rules, {type: 'rule'});

    ast.bkInfos = getBkInfo(trueRules);

    return ast;
};

/**
 * 根据CSS RULES 分析
 * 
 * @param  {Array} rules  ast rules
 * @return {Array}        图片信息数组
 */
var getBkInfo = function (rules) {

    var bkInfos = [];
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

        var background = {
            'background-image': '',
            'background-color': '',
            'background-position': '',
            'background-repeat': ''
        };
        
        _.each(bkgrdDcrs, function (declaration) {

            switch (declaration.property) {
                case 'background':
                    var value = declaration.value;
                    background = {
                        'background-image': (/\s*(url\(.*?\))\s*/.exec(value) || [])[1] || '',
                        'background-color': (/\s*(#\S*|rgba\(.*?\))\s*/.exec(value) || [])[1] || '',
                        'background-position': (/\s*((left|center|right|\d+(px)?)\s*(top|bottom|center|\d+(px)?))\s*/.exec(value) || [])[1] || '0 0',
                        'background-repeat': (/(repeat-x|repeat-y|repeat)/.exec(value) || [])[1] || ''
                    };
                    break;
                default:
                    background[declaration.property] = declaration.value;
                    break;
            }
        });

        // 处理完成后如果有image，放入图片中
        var bkimg = background['background-image'];

        if (bkimg) {

            var url = /\s*url\(\s*(['"]?)(.*?)\1\s*\)\s*/.exec(bkimg)[2];
            
            if (/http/.test(url)) {
                return;
            }

            var options = url.match(/#[^#]*/g);

            url = url.replace(/#.*/g, '');
            options = _.map(options, function (option) {
                return option.replace('#', '');
            });

            _.each(bkgrdDcrs, function (declaration) {
                rule.declarations.splice(rule.declarations.indexOf(declaration), 1);
            });

            bkInfos.push({
                url: url,
                rule: rule,
                properties: analyseOptions(background, options)
            });
        }
    });
    return bkInfos;
};

/**
 * 分析options
 * 
 * @param  {Object} options 要分析的options
 * @return {Object}         解析后的属性
 */
var analyseOptions = function (background, options) {
    var properties = {};

    _.each(background, function (property) {

        switch (property) {
            
            // 背景位置
            case 'background-position':
                var x = background[property].split(/\s+/)[0];
                var y = background[property].split(/\s+/)[1];

                properties.position = {
                    x: x,
                    y: y
                };

                break;

            // 重复方向
            case 'background-repeat':
                var repeatValue = background[property];
                
                if (repeatValue == 'repeat-x') {
                    properties.repeatX = true;
                }
                else if (repeatValue == 'repeat-y') {
                    properties.repeatY = true;
                }
                else if (repeatValue == 'repeat') {
                    properties.nocombine = true;
                }
                
                break;

            default:
                break;
        }
    });

    _.each(options, function (option) {
            
        // e.g. 15*16 确定容器大小
        if(/\d*\*\d*/.test(option)) {
            properties.dimension = {
                width: option.split('*')[0] - 0,
                height: option.split('*')[1] - 0
            };
        }
        // 不合并
        else if(/(nocombine|repeat)/.test(option)) {
            properties.nocombine = true;
        }
        // repeat-x
        else if(/repeat-x/.test(option)) {
            properties.repeatX = true;
        }
        // repeat-y
        else if(/repeat-y/.test(option)) {
            properties.repeatY = true;
        }
        // 位置
        else if(/\d*,\d*/.test(option)) {
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
};


exports.analyseCss = exports = analyseCss;