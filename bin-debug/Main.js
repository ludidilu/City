//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
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
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.unitArr = [];
        _this.unitPool = [];
        _this.areaDic = {};
        _this.areaPool = [];
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    Main.prototype.onAddToStage = function (event) {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this.initContainer();
        this.initClick();
        this.start();
    };
    Main.prototype.initContainer = function () {
        this.clickContainer = new egret.DisplayObjectContainer();
        this.addChild(this.clickContainer);
        this.mapContainer = new egret.DisplayObjectContainer();
        this.mapContainer.touchChildren = false;
        this.addChild(this.mapContainer);
    };
    Main.prototype.initClick = function () {
        var _loop_1 = function (i) {
            var pos = i;
            var x = pos % Main.MAP_WIDTH;
            var y = Math.floor(pos / Main.MAP_WIDTH);
            var sp = new egret.Sprite();
            sp.touchEnabled = true;
            sp.graphics.beginFill(0xff0000, 0);
            sp.graphics.drawRect(x * Main.GUID_WIDTH, y * Main.GUID_HEIGHT, Main.GUID_WIDTH, Main.GUID_HEIGHT);
            var fun = function (e) {
                this.click(pos);
            };
            sp.addEventListener(egret.TouchEvent.TOUCH_TAP, fun, this_1);
            this_1.clickContainer.addChild(sp);
        };
        var this_1 = this;
        for (var i = 0; i < Main.MAP_WIDTH * Main.MAP_HEIGHT; i++) {
            _loop_1(i);
        }
    };
    Main.prototype.click = function (_pos) {
        console.log("click:" + _pos);
        var unit = this.unitArr[_pos];
        var area = unit.area;
        if (area.unitArr.length > 1) {
            for (var i = 0, m = area.unitArr.length; i < m; i++) {
                var tmpUnit = area.unitArr[i];
                if (tmpUnit != unit) {
                    unit.score += tmpUnit.score;
                    this.unitPool.push(tmpUnit);
                    this.unitArr[tmpUnit.pos] = null;
                }
            }
            this.unitFall();
            this.refill();
            this.refreshMap();
        }
    };
    Main.prototype.unitFall = function () {
        for (var i = Main.MAP_WIDTH * Main.MAP_HEIGHT - 1; i > -1; i--) {
            var unit = this.unitArr[i];
            if (unit) {
                while (unit.pos < Main.MAP_WIDTH * (Main.MAP_HEIGHT - 1)) {
                    if (!this.unitArr[unit.pos + Main.MAP_WIDTH]) {
                        this.unitArr[unit.pos] = null;
                        unit.pos += Main.MAP_WIDTH;
                        this.unitArr[unit.pos] = unit;
                    }
                    else {
                        break;
                    }
                }
            }
        }
    };
    Main.prototype.refill = function () {
        for (var i = Main.MAP_WIDTH * Main.MAP_HEIGHT - 1; i > -1; i--) {
            if (!this.unitArr[i]) {
                var unit = this.getMapUnit();
                unit.pos = i;
                unit.color = Math.floor(Math.random() * Main.MAP_COLOR.length);
                unit.score = 1;
                this.unitArr[i] = unit;
            }
        }
    };
    Main.prototype.start = function () {
        this.refill();
        this.refreshMap();
    };
    Main.prototype.refreshMap = function () {
        var dic = {};
        var arr = [];
        for (var i = 0, m = Main.MAP_WIDTH * Main.MAP_HEIGHT; i < m; i++) {
            if (!dic[i]) {
                var unit = this.unitArr[i];
                if (unit) {
                    var tmpArr = [unit];
                    arr.push(tmpArr);
                    dic[i] = true;
                    this.checkNeighbour(tmpArr, dic, unit);
                }
            }
        }
        var areaDic = {};
        for (var i = 0, m = arr.length; i < m; i++) {
            var tmpArr = arr[i];
            var id = Main.arrToNumber(tmpArr);
            areaDic[id] = tmpArr;
        }
        for (var key in this.areaDic) {
            if (!areaDic[key]) {
                var area = this.areaDic[key];
                area.release();
                this.mapContainer.removeChild(area);
                this.areaPool.push(area);
                delete this.areaDic[key];
            }
            else {
                delete areaDic[key];
            }
        }
        for (var key in areaDic) {
            var tmpArr = areaDic[key];
            var area = this.getMapArea();
            area.setData(tmpArr, key);
            this.areaDic[key] = area;
            this.mapContainer.addChild(area);
        }
    };
    Main.prototype.checkNeighbour = function (_arr, _dic, _unit) {
        var x = _unit.pos % Main.MAP_WIDTH;
        var y = Math.floor(_unit.pos / Main.MAP_WIDTH);
        if (x > 0) {
            var tmpUnit = this.unitArr[_unit.pos - 1];
            if (tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]) {
                _dic[tmpUnit.pos] = true;
                _arr.push(tmpUnit);
                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }
        if (x < Main.MAP_WIDTH - 1) {
            var tmpUnit = this.unitArr[_unit.pos + 1];
            if (tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]) {
                _dic[tmpUnit.pos] = true;
                _arr.push(tmpUnit);
                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }
        if (y > 0) {
            var tmpUnit = this.unitArr[_unit.pos - Main.MAP_WIDTH];
            if (tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]) {
                _dic[tmpUnit.pos] = true;
                _arr.push(tmpUnit);
                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }
        if (y < Main.MAP_HEIGHT - 1) {
            var tmpUnit = this.unitArr[_unit.pos + Main.MAP_WIDTH];
            if (tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]) {
                _dic[tmpUnit.pos] = true;
                _arr.push(tmpUnit);
                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }
    };
    Main.prototype.getMapArea = function () {
        if (this.areaPool.length > 0) {
            return this.areaPool.pop();
        }
        else {
            var area = new MapArea();
            area.init();
            return area;
        }
    };
    Main.prototype.getMapUnit = function () {
        if (this.unitPool.length > 0) {
            return this.unitPool.pop();
        }
        else {
            var unit = new MapUnit();
            return unit;
        }
    };
    Main.arrToNumber = function (_arr) {
        var r = 0;
        for (var i = 0, m = _arr.length; i < m; i++) {
            r = r | (1 << _arr[i].pos);
        }
        r |= _arr[0].color << (Main.MAP_WIDTH * Main.MAP_HEIGHT);
        return r;
    };
    Main.GUID_WIDTH = 120;
    Main.GUID_HEIGHT = 120;
    Main.GUID_CUT_WIDTH = 10;
    Main.GUID_CUT_HEIGHT = 10;
    Main.GUID_CURVE_WIDTH = 10;
    Main.GUID_CURVE_HEIGHT = 10;
    Main.MAP_WIDTH = 5;
    Main.MAP_HEIGHT = 5;
    Main.MAP_COLOR = [0xff0000, 0x00ff00, 0x5555ff, 0xffffff];
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
//# sourceMappingURL=Main.js.map