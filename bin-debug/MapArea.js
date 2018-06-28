var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) { 
 function r() { 
 this.constructor = t;
}
for (var i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
r.prototype = e.prototype, t.prototype = new r();
};
var MapArea = (function (_super) {
    __extends(MapArea, _super);
    function MapArea() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.pointArr = [];
        _this.tfArr = [];
        return _this;
    }
    MapArea.prototype.init = function () {
        this.spContainer = new egret.DisplayObjectContainer();
        this.addChild(this.spContainer);
        this.tfContainer = new egret.DisplayObjectContainer();
        this.addChild(this.tfContainer);
        this.sp = new egret.Shape();
        this.spContainer.addChild(this.sp);
        for (var i = 0; i < 8; i++) {
            this.pointArr[i] = [];
        }
    };
    MapArea.prototype.release = function () {
        for (var i = 0, m = this.tfArr.length; i < m; i++) {
            var tf = this.tfArr[i];
            this.tfContainer.removeChild(tf);
            MapArea.tfPool.push(tf);
        }
        this.tfArr.length = 0;
        this.sp.graphics.clear();
    };
    MapArea.getTf = function (_container) {
        var tf;
        if (this.tfPool.length > 0) {
            tf = this.tfPool.pop();
        }
        else {
            tf = new egret.TextField();
            tf.width = Main.GUID_WIDTH;
            tf.height = Main.GUID_HEIGHT;
            tf.verticalAlign = egret.VerticalAlign.MIDDLE;
            tf.textAlign = egret.HorizontalAlign.CENTER;
            tf.bold = true;
            tf.textColor = 0x000000;
        }
        _container.addChild(tf);
        return tf;
    };
    MapArea.prototype.setData = function (_unitArr, _id) {
        // console.log("------");
        // for(let v of _unitArr){
        //     console.log(v.pos);
        // }
        this.unitArr = _unitArr;
        this.id = _id;
        for (var i = 0; i < 8; i++) {
            this.pointArr[i].length = 0;
        }
        var command = this.sp.graphics;
        var pointArr = this.pointArr;
        command.beginFill(Main.MAP_COLOR[this.unitArr[0].color]);
        command.lineStyle(5);
        for (var i = 0, m = this.unitArr.length; i < m; i++) {
            var unit = this.unitArr[i];
            unit.area = this;
            var pos = unit.pos;
            var x = pos % Main.MAP_WIDTH;
            var y = Math.floor(pos / Main.MAP_WIDTH);
            var tf = MapArea.getTf(this.tfContainer);
            this.tfArr.push(tf);
            tf.x = x * Main.GUID_WIDTH;
            tf.y = y * Main.GUID_HEIGHT;
            tf.text = unit.score.toString();
            if (x == 0 || !(this.id & (1 << (pos - 1)))) {
                var sx_1 = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH;
                var sy_1 = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT;
                command.moveTo(sx_1, sy_1);
                pointArr[0].push([sx_1, sy_1]);
                var tx = sx_1;
                var ty = sy_1 + (Main.GUID_HEIGHT - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2);
                pointArr[1].push([tx, ty]);
            }
            if (x == Main.MAP_WIDTH - 1 || !(this.id & (1 << pos + 1))) {
                var sx_2 = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2);
                var sy_2 = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT;
                command.moveTo(sx_2, sy_2);
                pointArr[2].push([sx_2, sy_2]);
                var tx = sx_2;
                var ty = sy_2 + (Main.GUID_HEIGHT - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2);
                pointArr[3].push([tx, ty]);
            }
            if (y == 0 || (!(this.id & (1 << (pos - Main.MAP_WIDTH))))) {
                var sx_3 = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH;
                var sy_3 = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT;
                command.moveTo(sx_3, sy_3);
                pointArr[4].push([sx_3, sy_3]);
                var tx = sx_3 + (Main.GUID_WIDTH - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2);
                var ty = sy_3;
                pointArr[5].push([tx, ty]);
            }
            if (y == Main.MAP_HEIGHT - 1 || !(this.id & (1 << (pos + Main.MAP_WIDTH)))) {
                var sx_4 = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH;
                var sy_4 = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT + (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2);
                command.moveTo(sx_4, sy_4);
                pointArr[6].push([sx_4, sy_4]);
                var tx = sx_4 + (Main.GUID_WIDTH - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2);
                var ty = sy_4;
                pointArr[7].push([tx, ty]);
            }
        }
        var sx = pointArr[0][0][0];
        var sy = pointArr[0][0][1];
        var lx = sx;
        var ly = sy + (Main.GUID_HEIGHT - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2);
        command.moveTo(lx, ly);
        this.drawLine(sx, sy, 0, sx, sy, command, pointArr, true);
    };
    // private ii:number = 0;
    MapArea.prototype.drawLine = function (_x, _y, _type, _startX, _startY, _graphics, _arr, _first) {
        // this.ii++;
        // if(this.ii > 4){
        //     return;
        // }
        _graphics.lineTo(_x, _y);
        if (!_first && _x == _startX && _y == _startY) {
            return;
        }
        switch (_type) {
            case 0:
                var tx = _x;
                var ty = _y - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;
                if (this.arrContains(tx, ty, _arr[1])) {
                    _graphics.lineTo(tx, ty);
                    var nx = _x;
                    var ny = _y - Main.GUID_HEIGHT;
                    this.drawLine(nx, ny, 0, _startX, _startY, _graphics, _arr);
                }
                else {
                    tx = _x + Main.GUID_CURVE_WIDTH;
                    ty = _y - Main.GUID_CURVE_HEIGHT;
                    if (this.arrContains(tx, ty, _arr[4])) {
                        var cx = _x;
                        var cy = ty;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);
                        var ny = ty;
                        this.drawLine(nx, ny, 5, _startX, _startY, _graphics, _arr);
                    }
                    else {
                        tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);
                        ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);
                        var cx = _x;
                        var cy = ty;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = _x - (Main.GUID_WIDTH - Main.GUID_CURVE_WIDTH);
                        var ny = ty;
                        this.drawLine(nx, ny, 6, _startX, _startY, _graphics, _arr);
                    }
                }
                break;
            case 1:
                tx = _x;
                ty = _y + (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;
                if (this.arrContains(tx, ty, _arr[0])) {
                    _graphics.lineTo(tx, ty);
                    var nx = _x;
                    var ny = _y + Main.GUID_HEIGHT;
                    this.drawLine(nx, ny, 1, _startX, _startY, _graphics, _arr);
                }
                else {
                    tx = _x + Main.GUID_CURVE_WIDTH;
                    ty = _y + Main.GUID_CURVE_HEIGHT;
                    if (this.arrContains(tx, ty, _arr[6])) {
                        var cx = _x;
                        var cy = ty;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);
                        var ny = ty;
                        this.drawLine(nx, ny, 7, _startX, _startY, _graphics, _arr);
                    }
                    else {
                        tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);
                        ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);
                        var cx = _x;
                        var cy = ty;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = _x - (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH);
                        var ny = ty;
                        this.drawLine(nx, ny, 4, _startX, _startY, _graphics, _arr);
                    }
                }
                break;
            case 2:
                tx = _x;
                ty = _y - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;
                if (this.arrContains(tx, ty, _arr[3])) {
                    _graphics.lineTo(tx, ty);
                    var nx = _x;
                    var ny = _y - Main.GUID_HEIGHT;
                    this.drawLine(nx, ny, 2, _startX, _startY, _graphics, _arr);
                }
                else {
                    tx = _x - Main.GUID_CURVE_WIDTH;
                    ty = _y - Main.GUID_CURVE_HEIGHT;
                    if (this.arrContains(tx, ty, _arr[5])) {
                        var cx = _x;
                        var cy = ty;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = _x - (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);
                        var ny = ty;
                        this.drawLine(nx, ny, 4, _startX, _startY, _graphics, _arr);
                    }
                    else {
                        tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);
                        ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);
                        var cx = _x;
                        var cy = ty;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH);
                        var ny = ty;
                        this.drawLine(nx, ny, 7, _startX, _startY, _graphics, _arr);
                    }
                }
                break;
            case 3:
                tx = _x;
                ty = _y + (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;
                if (this.arrContains(tx, ty, _arr[2])) {
                    _graphics.lineTo(tx, ty);
                    var nx = _x;
                    var ny = _y + Main.GUID_HEIGHT;
                    this.drawLine(nx, ny, 3, _startX, _startY, _graphics, _arr);
                }
                else {
                    tx = _x - Main.GUID_CURVE_WIDTH;
                    ty = _y + Main.GUID_CURVE_HEIGHT;
                    if (this.arrContains(tx, ty, _arr[7])) {
                        var cx = _x;
                        var cy = ty;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = _x - (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);
                        var ny = ty;
                        this.drawLine(nx, ny, 6, _startX, _startY, _graphics, _arr);
                    }
                    else {
                        tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);
                        ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);
                        var cx = _x;
                        var cy = ty;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH);
                        var ny = ty;
                        this.drawLine(nx, ny, 5, _startX, _startY, _graphics, _arr);
                    }
                }
                break;
            case 4:
                tx = _x - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;
                ty = _y;
                if (this.arrContains(tx, ty, _arr[5])) {
                    _graphics.lineTo(tx, ty);
                    var nx = _x - Main.GUID_WIDTH;
                    var ny = _y;
                    this.drawLine(nx, ny, 4, _startX, _startY, _graphics, _arr);
                }
                else {
                    tx = _x - Main.GUID_CURVE_WIDTH;
                    ty = _y + Main.GUID_CURVE_HEIGHT;
                    if (this.arrContains(tx, ty, _arr[0])) {
                        var cx = tx;
                        var cy = _y;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = tx;
                        var ny = _y + (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);
                        this.drawLine(nx, ny, 1, _startX, _startY, _graphics, _arr);
                    }
                    else {
                        tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);
                        ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);
                        var cx = tx;
                        var cy = _y;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = tx;
                        var ny = _y - (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);
                        this.drawLine(nx, ny, 2, _startX, _startY, _graphics, _arr);
                    }
                }
                break;
            case 5:
                tx = _x + (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;
                ty = _y;
                if (this.arrContains(tx, ty, _arr[4])) {
                    _graphics.lineTo(tx, ty);
                    var nx = _x + Main.GUID_WIDTH;
                    var ny = _y;
                    this.drawLine(nx, ny, 5, _startX, _startY, _graphics, _arr);
                }
                else {
                    tx = _x + Main.GUID_CURVE_WIDTH;
                    ty = _y + Main.GUID_CURVE_HEIGHT;
                    if (this.arrContains(tx, ty, _arr[2])) {
                        var cx = tx;
                        var cy = _y;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = tx;
                        var ny = _y + (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);
                        this.drawLine(nx, ny, 3, _startX, _startY, _graphics, _arr);
                    }
                    else {
                        tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);
                        ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);
                        var cx = tx;
                        var cy = _y;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = tx;
                        var ny = _y - (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);
                        this.drawLine(nx, ny, 0, _startX, _startY, _graphics, _arr);
                    }
                }
                break;
            case 6:
                tx = _x - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;
                ty = _y;
                if (this.arrContains(tx, ty, _arr[7])) {
                    _graphics.lineTo(tx, ty);
                    var nx = _x - Main.GUID_WIDTH;
                    var ny = _y;
                    this.drawLine(nx, ny, 6, _startX, _startY, _graphics, _arr);
                }
                else {
                    tx = _x - Main.GUID_CURVE_WIDTH;
                    ty = _y - Main.GUID_CURVE_HEIGHT;
                    if (this.arrContains(tx, ty, _arr[1])) {
                        var cx = tx;
                        var cy = _y;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = tx;
                        var ny = _y - (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);
                        this.drawLine(nx, ny, 0, _startX, _startY, _graphics, _arr);
                    }
                    else {
                        tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);
                        ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);
                        var cx = tx;
                        var cy = _y;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = tx;
                        var ny = _y + (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);
                        this.drawLine(nx, ny, 3, _startX, _startY, _graphics, _arr);
                    }
                }
                break;
            default:
                tx = _x + (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;
                ty = _y;
                if (this.arrContains(tx, ty, _arr[6])) {
                    _graphics.lineTo(tx, ty);
                    var nx = _x + Main.GUID_WIDTH;
                    var ny = _y;
                    this.drawLine(nx, ny, 7, _startX, _startY, _graphics, _arr);
                }
                else {
                    tx = _x + Main.GUID_CURVE_WIDTH;
                    ty = _y - Main.GUID_CURVE_HEIGHT;
                    if (this.arrContains(tx, ty, _arr[3])) {
                        var cx = tx;
                        var cy = _y;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = tx;
                        var ny = _y - (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);
                        this.drawLine(nx, ny, 2, _startX, _startY, _graphics, _arr);
                    }
                    else {
                        tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);
                        ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);
                        var cx = tx;
                        var cy = _y;
                        _graphics.curveTo(cx, cy, tx, ty);
                        var nx = tx;
                        var ny = _y + (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);
                        this.drawLine(nx, ny, 1, _startX, _startY, _graphics, _arr);
                    }
                }
                break;
        }
    };
    MapArea.prototype.arrContains = function (_x, _y, _arr) {
        for (var i = 0, m = _arr.length; i < m; i++) {
            var arr = _arr[i];
            if (arr[0] == _x && arr[1] == _y) {
                return true;
            }
        }
        return false;
    };
    MapArea.tfPool = [];
    return MapArea;
}(egret.DisplayObjectContainer));
__reflect(MapArea.prototype, "MapArea");
//# sourceMappingURL=MapArea.js.map