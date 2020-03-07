// 基本数据对象
var map = {

    tile_size: 16,

    keys: [
        { id: 0, colour: '#333', solid: 0 },//黑边
        { id: 1, colour: '#f2faff', solid: 0 },//可移动区域
        { id: 2, colour: '#0333', solid: 1, bounce: 0.35 },//普通地板的重力
        { id: 3, colour: '#69c8f9', friction: { x: 0.9, y: 0.9 }, gravity: { x: 0, y: 0.1 }, jump: 1, fore: 1 },//水里
        { id: 4, colour: '#5bc4fb', jump: 1 },//连跳
        { id: 5, colour: '#E373FA', solid: 1, bounce: 1.1 },//弹簧床
        { id: 6, colour: '#666', solid: 1, bounce: 0 },//限制跳动
        { id: 7, colour: '#73C6FA', solid: 0, script: 'change_colour' },
        { id: 8, colour: '#FADF73', solid: 0, script: 'next_level' },//终点
        { id: 9, colour: '#C93232', solid: 0, script: 'death' },//火
        { id: 10, colour: '#555', solid: 1 },
        { id: 11, colour: '#0FF', solid: 0, script: 'unlock' },//解锁
        { id: 12, colour: 'rgb(148, 191, 85)', script: 'npc1' },//npc引路人
    ],

    /* 默认的重力地图 */

    gravity: {
        x: 0,
        y: 0.3
    },

    /* 速度限制*/

    vel_limit: {
        x: 2,
        y: 16
    },

    /*按下键时运动速度 */

    movement_speed: {
        jump: 6,
        left: 0.3,
        right: 0.3
    },

    /* 球员产生的坐标和球员的颜色 */

    player: {
        x: 2,
        y: 2,
        colour: '#FF9900'
    },

    /* 在tile keys中由“脚本”变量引用的脚本 */

    scripts: {
        /* 您可以使用“this”代替您的引擎变量(“game”)，但是Codepen不喜欢它 */
        change_colour: 'game.player.colour = "#"+(Math.random()*0xFFFFFF<<0).toString(16);',
        /* 你可以在这里载入一个新的地图变量 */
        next_level: 'alert("闯关成功！");map.data = mapData[1];game.load_map(map);',
        death: 'alert("很遗憾，闯关失败！");game.load_map(map);',
        unlock: 'game.current_map.keys[10].solid = 0;game.current_map.keys[10].colour = "#888";',
        npc1:'引路人：加油啊，年轻人！'
    }
};