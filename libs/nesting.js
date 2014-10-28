var _ = require('underscore');
var GrowingPacker = require('../utils/bin-packing.js');

/**
 * 矩形排料
 * 
 * @param  {Array} imgInfos 图片信息数组
 * @return {Array} imgInfos 图片信息数组(已排料好的)
 */
var nesting = function (imgInfos) {

    // 复制 去重 排序
    var nestingImgInfos = _.chain([])
        .extend(imgInfos)
        .uniq(function (item) {
            return item.path;
        })
        .sortBy(function (item) {
            return -item.height;
        })
        .value();

    // 计算每个矩形排放位置
    new GrowingPacker().fit(nestingImgInfos);

    // 将去重后的排序结果回归到原有图片信息数组中
    _.each(nestingImgInfos, function (nestingImg) {

        var samePathImgs = _.where(imgInfos, {path: nestingImg.path});

        // 对相同引用路径的图片，
        samePathImgs.forEach(function (samePathImg) {
            samePathImg.fit = nestingImg.fit;
        });
    });

    return imgInfos;
};


module.exports = exports = nesting;
