var when = require('when');
var _ = require('underscore');
var PNG = require('pngjs').PNG;
var fs = require('fs');

/**
 * 合并图片
 * 
 * @param  {Array}   imgInfos   图片数组
 * @param  {String}  path       雪碧图生成路径
 * @param  {Promise}            Promise对象
 */
function combine(imgInfos, path) {
    var promise = when.defer();

    // 将所有图片写入内存
    createAllPngs(imgInfos).then(function (imgInfos) {
        // 根据一组数组的大小创建适合宽高的png图片
        var png = createFitPng(imgInfos);

        imgInfos.forEach(function(imgInfo) {
            var x = (imgInfo.properties.position && imgInfo.properties.position.x) || 0;
            var y = (imgInfo.properties.position && imgInfo.properties.position.y) || 0;

            if (x == 'left') {
                x = 0;
            }
            else if (x == 'center') {
                x = parseInt((imgInfo.width - imgInfo.originWidth) / 2, 10);
            }
            else if (x == 'right') {
                x = imgInfo.width - imgInfo.originWidth;
            }
            else {
                x = parseInt(x) - 0;
            }

            if (y == 'top') {
                y = 0;
            }
            else if (y == 'center') {
                y = parseInt((imgInfo.height - imgInfo.originHeight) / 2, 10);
            }
            else if (y == 'bottom') {
                y = imgInfo.height - imgInfo.originHeight;
            }
            else {
                y = parseInt(y) - 0;
            }

            imgInfo.x = imgInfo.fit.x;
            imgInfo.y = imgInfo.fit.y;

            var width;
            if (imgInfo.width >= (imgInfo.originWidth + x)) {
                width = imgInfo.originWidth;
            }
            else {
                width = imgInfo.width - x;
            }

            var height;
            if (imgInfo.height >= (imgInfo.originHeight + y)) {
                height = imgInfo.originHeight;
            }
            else {
                height = imgInfo.height - y;
            }

            x += (imgInfo.fit.x);
            y += (imgInfo.fit.y);
            
            // 对图片进行填充
            imgInfo.image.bitblt(
                png,
                0, 0, 
                width, height,
                x, y
            );
        });

        var imgReadStream = png.pack();
        var imgWriteStream = fs.createWriteStream(path);

        // 生成图片
        imgWriteStream.on('finish', function () {
            promise.resolve(imgInfos);
        });
        imgReadStream.pipe(imgWriteStream);
    });

    return promise.promise;
}

/**
 * 创建所有的图像
 * 
 * @param  {Array}    imgInfos   图片信息数组
 * @return {Promise}             Promise对象
 */
var createAllPngs = function (imgInfos) {
    var promise = when.defer();
    var promises = [];

    // 每个图片存入内存
    _.each(imgInfos, function (imgInfo) {
        var promise = when.defer();

        promises.push(promise.promise);

        fs
        .createReadStream(imgInfo.path)
        .pipe(new PNG({}))
        .on('parsed', function () {
            imgInfo.image = this;
            promise.resolve();
        });
    });

    // 对所有图片都处理完成后，执行合并和css替换
    when.all(promises).then(
        function () {
            promise.resolve(imgInfos);
        }
    );

    return promise.promise;
}


/**
 * 创建一个合适尺寸的 png 图片
 * 
 * @param  {Array}  imgInfos    图片对象数组
 * @return {Object}             png图片对象
 */
function createFitPng(imgInfos) {

    // 最右边
    var rightRect = _.max(
        imgInfos, 
        function (imgInfo) {
            return imgInfo.fit.x + imgInfo.width;
        }
    );

    // 最底部
    var bottomRect = _.max(
        imgInfos, 
        function (imgInfo) { 
            return imgInfo.fit.y + imgInfo.height;
        }
    );

    // 根据最大宽高确定png大小
    var png = createPng(
        rightRect.fit.x + rightRect.width,
        bottomRect.fit.y + bottomRect.height
    );

    return png;
}

/**
 * 创建一个 png 图片
 * 
 * @param  {Number} width   宽度
 * @param  {Number} height  高度
 * @return {Object}         png图片对象
 */
function createPng(width, height) {
    // 创建一张定宽定高的png图片
    var png = new PNG({
        width: width,
        height: height
    });

    // 必须把图片的所有像素都设置为 0, 否则会出现一些随机的噪点
    for (var y = 0; y < png.height; y++) {
        for (var x = 0; x < png.width; x++) {
            var idx = (png.width * y + x) << 2;

            png.data[idx] = 0;
            png.data[idx + 1] = 0;
            png.data[idx + 2] = 0;
            png.data[idx + 3] = 0;
        }
    }
    return png;
}

module.exports = exports = combine;
