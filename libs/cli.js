/**
 * @file 命令行功能模块
 * @author quyatong@baidu.com
 */

var path = require('path');
var CssSpriter = require('../index');

/**
 * 解析参数。作为命令行执行的入口
 *
 * @param {Array} args 参数列表
 */
exports.parse = function (args) {
    args = args.slice(2);

    // 无参数时显示默认信息
    if (args.length === 0) {
        console.log('--usage:   CssSpriter <file> <new file>');
        console.log('--example: CssSpriter index.css index-release.css');
        return;
    }

    var filePath = path.resolve(args[0]);
    var newFilePath = (args[1] && path.resolve(args[1])) || filePath;

    CssSpriter.cssSpriter(filePath, newFilePath);
};
