

/* Clarity 引擎 */

var Clarity = function () {
    this.alert_errors = false;
    this.log_info = true;
    this.tile_size = 16;//每一小格大小
    this.limit_viewport = false;
    this.jump_switch = 0;
    this.npc = new Npc;
    this.viewport = {
        x: 200,
        y: 200
    };

    this.camera = {
        x: 0,
        y: 0
    };

    this.key = {
        left: false,
        right: false,
        up: false
    };

    this.player = {
        // 主角所在的坐标
        loc: {
            x: 0,
            y: 0
        },
        // 移动的坐标距离
        vel: {
            x: 0,
            y: 0
        },

        can_jump: true
    };

    window.onkeydown = this.keydown.bind(this);
    window.onkeyup = this.keyup.bind(this);
};

Clarity.prototype.error = function (message) {

    if (this.alert_errors) alert(message);
    if (this.log_info) console.log(message);
};

Clarity.prototype.log = function (message) {

    if (this.log_info) console.log(message);
};

Clarity.prototype.set_viewport = function (x, y) {

    this.viewport.x = x;
    this.viewport.y = y;
};

Clarity.prototype.keydown = function (e) {

    var _this = this;

    switch (e.keyCode) {
        case 37:
            _this.key.left = true;
            break;
        case 38:
            _this.key.up = true;
            break;
        case 39:
            _this.key.right = true;
            break;
    }
};

Clarity.prototype.keyup = function (e) {

    var _this = this;

    switch (e.keyCode) {
        case 37:
            _this.key.left = false;
            break;
        case 38:
            _this.key.up = false;
            break;
        case 39:
            _this.key.right = false;
            break;
    }
};

Clarity.prototype.load_map = function (map) {

    if (typeof map === 'undefined'
        || typeof map.data === 'undefined'
        || typeof map.keys === 'undefined') {

        this.error('Error: Invalid map data!');

        return false;
    }

    this.current_map = map;

    this.current_map.background = map.background || '#333';//地图背景
    this.current_map.gravity = map.gravity || { x: 0, y: 0.3 };//地图重力
    this.tile_size = map.tile_size || 16;

    var _this = this;

    this.current_map.width = 0;
    this.current_map.height = 0;

    map.keys.forEach(function (key) {//行

        map.data.forEach(function (row, y) {//每一个对象

            _this.current_map.height = Math.max(_this.current_map.height, y);

            row.forEach(function (tile, x) {

                _this.current_map.width = Math.max(_this.current_map.width, x);

                if (tile == key.id)
                    _this.current_map.data[y][x] = key;
            });
        });
    });

    this.current_map.width_p = this.current_map.width * this.tile_size;
    this.current_map.height_p = this.current_map.height * this.tile_size;

    this.player.loc.x = map.player.x * this.tile_size || 0;
    this.player.loc.y = map.player.y * this.tile_size || 0;
    this.player.colour = map.player.colour || '#000';

    this.key.left = false;
    this.key.up = false;
    this.key.right = false;

    this.camera = {
        x: 0,
        y: 0
    };

    this.player.vel = {
        x: 0,
        y: 0
    };

    this.log('Successfully loaded map data.');

    return true;
};

Clarity.prototype.get_tile = function (x, y) {

    return (this.current_map.data[y] && this.current_map.data[y][x]) ? this.current_map.data[y][x] : 0;
};

Clarity.prototype.draw_tile = function (x, y, tile, context) {//x是能见到的宽，y是能见到的高，方块数字，context就是canvas对象
    if (!tile || !tile.colour) return;



    context.fillStyle = tile.colour;//给每一块上色
    context.fillRect(
        x,
        y,
        this.tile_size,
        this.tile_size
    );
    if (tile.id == 12) {
        context.save();
        context.beginPath();
        context.fillStyle = '#fff';
        context.font = '10px';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('^.^', x, y);
    }
    if (tile.id == 8) {
        context.save();
        context.beginPath();
        context.fillStyle = '#fff';
        context.font = '10px';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('终', x, y);
    }

};

Clarity.prototype.draw_map = function (context, fore) {//画地图,canvavs,false

    for (var y = 0; y < this.current_map.data.length; y++) {//行

        for (var x = 0; x < this.current_map.data[y].length; x++) {//列

            if ((!fore && !this.current_map.data[y][x].fore) || (fore && this.current_map.data[y][x].fore)) {

                var t_x = (x * this.tile_size) - this.camera.x;
                var t_y = (y * this.tile_size) - this.camera.y;

                if (t_x < -this.tile_size
                    || t_y < -this.tile_size
                    || t_x > this.viewport.x
                    || t_y > this.viewport.y) continue;


                this.draw_tile(
                    t_x,
                    t_y,
                    this.current_map.data[y][x],//每一个坐标的值
                    context
                );
            }
        }
    }



    if (!fore) this.draw_map(context, true);
};

Clarity.prototype.move_player = function () {//玩家移动

    var tX = this.player.loc.x + this.player.vel.x;//原本列的位置+移动的位置，平移
    var tY = this.player.loc.y + this.player.vel.y;//原本行的位置+移动的位置，下落

    var offset = Math.round((this.tile_size / 2) - 1);//大于0.5的向上取1

    var tile = this.get_tile(//获取当前位置方块的data对象
        Math.round(this.player.loc.x / this.tile_size),
        Math.round(this.player.loc.y / this.tile_size)
    );

    if (tile.gravity) {//受重力限制时

        this.player.vel.x += tile.gravity.x;
        this.player.vel.y += tile.gravity.y;

    } else {

        this.player.vel.x += this.current_map.gravity.x;
        this.player.vel.y += this.current_map.gravity.y;
    }

    if (tile.friction) {//弹力加成

        this.player.vel.x *= tile.friction.x;
        this.player.vel.y *= tile.friction.y;
    }

    var t_y_up = Math.floor(tY / this.tile_size);//最接近的较小整数（floor地板的意思）
    var t_y_down = Math.ceil(tY / this.tile_size);//最接近的较大整数（ceiling天花板的意思）
    var y_near1 = Math.round((this.player.loc.y - offset) / this.tile_size);//4舍5入
    var y_near2 = Math.round((this.player.loc.y + offset) / this.tile_size);

    var t_x_left = Math.floor(tX / this.tile_size);
    var t_x_right = Math.ceil(tX / this.tile_size);
    var x_near1 = Math.round((this.player.loc.x - offset) / this.tile_size);
    var x_near2 = Math.round((this.player.loc.x + offset) / this.tile_size);

    var top1 = this.get_tile(x_near1, t_y_up);//取得坐标对象
    var top2 = this.get_tile(x_near2, t_y_up);
    var bottom1 = this.get_tile(x_near1, t_y_down);
    var bottom2 = this.get_tile(x_near2, t_y_down);
    var left1 = this.get_tile(t_x_left, y_near1);
    var left2 = this.get_tile(t_x_left, y_near2);
    var right1 = this.get_tile(t_x_right, y_near1);
    var right2 = this.get_tile(t_x_right, y_near2);


    if (tile.jump && this.jump_switch > 15) {

        this.player.can_jump = true;

        this.jump_switch = 0;

    } else this.jump_switch++;

    this.player.vel.x = Math.min(Math.max(this.player.vel.x, -this.current_map.vel_limit.x), this.current_map.vel_limit.x);
    this.player.vel.y = Math.min(Math.max(this.player.vel.y, -this.current_map.vel_limit.y), this.current_map.vel_limit.y);

    this.player.loc.x += this.player.vel.x;
    this.player.loc.y += this.player.vel.y;

    this.player.vel.x *= .9;

    if (left1.solid || left2.solid || right1.solid || right2.solid) {

        /* 解决重叠 */

        while (this.get_tile(Math.floor(this.player.loc.x / this.tile_size), y_near1).solid
            || this.get_tile(Math.floor(this.player.loc.x / this.tile_size), y_near2).solid)
            this.player.loc.x += 0.1;

        while (this.get_tile(Math.ceil(this.player.loc.x / this.tile_size), y_near1).solid
            || this.get_tile(Math.ceil(this.player.loc.x / this.tile_size), y_near2).solid)
            this.player.loc.x -= 0.1;

        /* 瓷砖反弹 */

        var bounce = 0;

        if (left1.solid && left1.bounce > bounce) bounce = left1.bounce;
        if (left2.solid && left2.bounce > bounce) bounce = left2.bounce;
        if (right1.solid && right1.bounce > bounce) bounce = right1.bounce;
        if (right2.solid && right2.bounce > bounce) bounce = right2.bounce;

        this.player.vel.x *= -bounce || 0;

    }

    if (top1.solid || top2.solid || bottom1.solid || bottom2.solid) {

        /* 解决重叠 */

        while (this.get_tile(x_near1, Math.floor(this.player.loc.y / this.tile_size)).solid
            || this.get_tile(x_near2, Math.floor(this.player.loc.y / this.tile_size)).solid)
            this.player.loc.y += 0.1;

        while (this.get_tile(x_near1, Math.ceil(this.player.loc.y / this.tile_size)).solid
            || this.get_tile(x_near2, Math.ceil(this.player.loc.y / this.tile_size)).solid)
            this.player.loc.y -= 0.1;

        /* 瓷砖反弹 */

        var bounce = 0;

        if (top1.solid && top1.bounce > bounce) bounce = top1.bounce;
        if (top2.solid && top2.bounce > bounce) bounce = top2.bounce;
        if (bottom1.solid && bottom1.bounce > bounce) bounce = bottom1.bounce;
        if (bottom2.solid && bottom2.bounce > bounce) bounce = bottom2.bounce;

        this.player.vel.y *= -bounce || 0;

        if ((bottom1.solid || bottom2.solid) && !tile.jump) {

            this.player.on_floor = true;
            this.player.can_jump = true;
        }

    }

    // 调整相机

    var c_x = Math.round(this.player.loc.x - this.viewport.x / 2);
    var c_y = Math.round(this.player.loc.y - this.viewport.y / 2);
    var x_dif = Math.abs(c_x - this.camera.x);
    var y_dif = Math.abs(c_y - this.camera.y);

    if (x_dif > 5) {

        var mag = Math.round(Math.max(1, x_dif * 0.1));

        if (c_x != this.camera.x) {

            this.camera.x += c_x > this.camera.x ? mag : -mag;

            if (this.limit_viewport) {

                this.camera.x =
                    Math.min(
                        this.current_map.width_p - this.viewport.x + this.tile_size,
                        this.camera.x
                    );

                this.camera.x =
                    Math.max(
                        0,
                        this.camera.x
                    );
            }
        }
    }

    if (y_dif > 5) {

        var mag = Math.round(Math.max(1, y_dif * 0.1));

        if (c_y != this.camera.y) {

            this.camera.y += c_y > this.camera.y ? mag : -mag;

            if (this.limit_viewport) {

                this.camera.y =
                    Math.min(
                        this.current_map.height_p - this.viewport.y + this.tile_size,
                        this.camera.y
                    );

                this.camera.y =
                    Math.max(
                        0,
                        this.camera.y
                    );
            }
        }
    }
    
    if (tile.id != 12) {
        this.npc.noTalk();
    }
    if (this.last_tile != tile.id && tile.script) {//触发script事件
        if (tile.id == 12) {
            this.npc.talk(this.current_map.scripts[tile.script]);
        } else {
            if(tile.id == 8){
                map.data = mapData[this.current_map.dataId+1];
                if(this.current_map.dataId == mapData[0]){
                    eval(this.current_map.scripts[tile.script]);//函数可计算某个字符串，并执行其中的的 JavaScript 代码
                    map.dataId = 1;
                }else{
                    map.dataId = this.current_map.dataId+1;
                    game.load_map(map);
                }
            }else{
                eval(this.current_map.scripts[tile.script]);//函数可计算某个字符串，并执行其中的的 JavaScript 代码
            }
        }
    }

    this.last_tile = tile.id;
};

Clarity.prototype.update_player = function () {

    if (this.key.left) {

        if (this.player.vel.x > -this.current_map.vel_limit.x)
            this.player.vel.x -= this.current_map.movement_speed.left;
    }

    if (this.key.up) {

        if (this.player.can_jump && this.player.vel.y > -this.current_map.vel_limit.y) {

            this.player.vel.y -= this.current_map.movement_speed.jump;
            this.player.can_jump = false;
        }
    }

    if (this.key.right) {

        if (this.player.vel.x < this.current_map.vel_limit.x)
            this.player.vel.x += this.current_map.movement_speed.left;
    }

    this.move_player();
};

Clarity.prototype.draw_player = function (context) {

    context.fillStyle = this.player.colour;

    context.beginPath();

    context.arc(
        this.player.loc.x + this.tile_size / 2 - this.camera.x,
        this.player.loc.y + this.tile_size / 2 - this.camera.y,
        this.tile_size / 2 - 1,
        0,
        Math.PI * 2
    );

    context.fill();
    context.save();
    context.beginPath();
    context.fillStyle = '#fff';
    context.font = '10px';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('你', this.player.loc.x + this.tile_size / 2 - this.camera.x,
        this.player.loc.y + this.tile_size / 2 - this.camera.y);
    context.fill();
};

Clarity.prototype.update = function () {

    this.update_player();
};

Clarity.prototype.draw = function (context) {
    this.draw_map(context, false);
    this.draw_player(context);
};



