/* 发动机的安装 */
// 高帧率模式
window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        return window.setTimeout(callback, 1000 / 60);
    };

var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;


var game = new Clarity();
game.set_viewport(canvas.width, canvas.height);
map.data = mapData[1];//传入地图
map.dataId =1;//传入地图

game.load_map(map);

/* 将viewport限制在地图的范围内*/
game.limit_viewport = true;

var Loop = function () {

    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);//填充

    game.update();
    game.draw(ctx);

    window.requestAnimFrame(Loop);


};