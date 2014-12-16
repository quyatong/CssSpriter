var fs = require('fs');
var css = require('css');
var _ = require('underscore');
var path = require('path');

var cssHandler = function (ast, imgInfos, imgFilePath) {
    var version = (new Date()).getTime();
    _.each(imgInfos, function (imgInfo) {

        // 将各种background属性塞进去
        imgInfo.rule.declarations.push(
            {
                "type": "declaration",
                "property": "background-image",
                "value": 'url("' + imgFilePath + '?ver=' + version + '")'
            },            
            {
                "type": "declaration",
                "property": "background-position",
                "value": '-' + imgInfo.x + 'px ' + '-' + imgInfo.y + 'px'
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
