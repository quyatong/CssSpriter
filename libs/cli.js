/**
 * @file 命令行功能模块
 *
 * @author quyatong@126.com
 */

var path = require('path');
var CssSpriter = require('../index')

/**
 * 解析参数。作为命令行执行的入口
 *
 * @param {Array} args 参数列表
 */
exports.parse = function ( args ) {
    args = args.slice( 2 );

    // 无参数时显示默认信息
    if ( args.length === 0 ) {
        console.log('--usage:   CssSpriter <file>');
        console.log('--example: CssSpriter index.css');
        return;
    }

    var filePath = path.resolve(args[0]);
    CssSpriter(filePath);
};