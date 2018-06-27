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

class Main extends egret.DisplayObjectContainer {

    public static readonly GUID_WIDTH:number = 120;

    public static readonly GUID_HEIGHT:number = 120;

    public static readonly GUID_CUT_WIDTH:number = 10;

    public static readonly GUID_CUT_HEIGHT:number = 10;

    public static readonly GUID_CURVE_WIDTH:number = 10;

    public static readonly GUID_CURVE_HEIGHT:number = 10;

    public static readonly MAP_WIDTH:number = 5;

    public static readonly MAP_HEIGHT:number = 5;

    public static readonly MAP_COLOR:number[] = [0xff0000, 0x00ff00, 0x5555ff, 0xffffff];

    private unitArr:MapUnit[] = [];

    private unitPool:MapUnit[] = [];

    private areaDic:{[key:number]:MapArea} = {};

    private areaPool:MapArea[] = [];

    private clickContainer:egret.DisplayObjectContainer;

    private mapContainer:egret.DisplayObjectContainer;

    public constructor() {

        super();

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event):void{
        
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

        this.initContainer();

        this.initClick();

        this.start();
    }

    private initContainer():void{

        this.clickContainer = new egret.DisplayObjectContainer();

        this.addChild(this.clickContainer);

        this.mapContainer = new egret.DisplayObjectContainer();

        this.mapContainer.touchChildren = false;

        this.addChild(this.mapContainer);
    }

    private initClick():void{

        for(let i:number = 0 ; i < Main.MAP_WIDTH * Main.MAP_HEIGHT ; i++){

            let pos:number = i;

            let x:number = pos % Main.MAP_WIDTH;

            let y:number = Math.floor(pos / Main.MAP_WIDTH);

            let sp:egret.Sprite = new egret.Sprite();

            sp.touchEnabled = true;

            sp.graphics.beginFill(0xff0000, 0);

            sp.graphics.drawRect(x * Main.GUID_WIDTH, y * Main.GUID_HEIGHT, Main.GUID_WIDTH, Main.GUID_HEIGHT);

            let fun:(e:egret.TouchEvent)=>void = function(e:egret.TouchEvent):void{

                this.click(pos);
            };

            sp.addEventListener(egret.TouchEvent.TOUCH_TAP, fun, this);

            this.clickContainer.addChild(sp);
        }
    }

    private click(_pos:number):void{

        console.log("click:" + _pos);

        let unit:MapUnit = this.unitArr[_pos];

        let area:MapArea = unit.area;

        if(area.unitArr.length > 1){

            for(let i:number = 0, m:number = area.unitArr.length ; i < m ; i++){

                let tmpUnit:MapUnit = area.unitArr[i];

                if(tmpUnit != unit){

                    unit.score += tmpUnit.score;

                    this.unitPool.push(unit);

                    this.unitArr[unit.pos] = null;
                }
            }

            this.unitFall();

            this.refill();

            this.refreshMap();
        }
    }

    private unitFall():void{

        for(let i:number = Main.MAP_WIDTH * Main.MAP_HEIGHT - 1 ; i > -1  ; i--){

            let unit:MapUnit = this.unitArr[i];

            if(unit){

                while(unit.pos < Main.MAP_WIDTH * (Main.MAP_HEIGHT - 1)){

                    if(!this.unitArr[unit.pos + Main.MAP_WIDTH]){

                        unit.pos += Main.MAP_WIDTH;
                    }
                    else{

                        break;
                    }
                }
            }
        }
    }

    private refill():void{

        for(let i:number = Main.MAP_WIDTH * Main.MAP_HEIGHT - 1 ; i > -1  ; i--){

            if(!this.unitArr[i]){

                let unit:MapUnit = this.getMapUnit();

                unit.pos = i;

                unit.color = Math.floor(Math.random() * Main.MAP_COLOR.length);

                unit.score = 1;

                this.unitArr[i] = unit;
            }
        }
    }

    private start():void{

        this.refill();

        this.refreshMap();
    }

    private refreshMap():void{

        let dic:{[key:number]:boolean} = {};

        let arr:MapUnit[][] = [];

        for(let i:number = 0, m:number = Main.MAP_WIDTH * Main.MAP_HEIGHT ; i < m; i++){

            if(!dic[i]){

                let unit:MapUnit = this.unitArr[i];

                let tmpArr:MapUnit[] = [unit];

                arr.push(tmpArr);

                dic[i] = true;

                this.checkNeighbour(tmpArr, dic, unit);
            }
        }

        let areaDic:{[key:number]:MapUnit[]} = {};

        for(let i:number = 0 , m:number = arr.length ; i < m ; i++){

            let tmpArr:MapUnit[] = arr[i];

            let id:number = Main.arrToNumber(tmpArr);

            areaDic[id] = tmpArr;
        }

        for(let key in this.areaDic){

            if(!areaDic[key]){

                let area:MapArea = this.areaDic[key];

                area.release();

                this.mapContainer.removeChild(area);

                this.areaPool.push(area);
            }
            else{

                delete areaDic[key];
            }
        }

        for(let key in areaDic){

            let tmpArr:MapUnit[] = areaDic[key];

            let area:MapArea = this.getMapArea();

            area.setData(tmpArr, key);

            this.areaDic[key] = area;

            this.mapContainer.addChild(area);
        }
    }

    private checkNeighbour(_arr:MapUnit[], _dic:{[key:number]:boolean}, _unit:MapUnit):void{

        let x:number = _unit.pos % Main.MAP_WIDTH;

        let y:number = Math.floor(_unit.pos / Main.MAP_WIDTH);

        if(x > 0){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos - 1];

            if(tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

                _dic[tmpUnit.pos] = true;

                _arr.push(tmpUnit);

                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }

        if(x < Main.MAP_WIDTH - 1){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos + 1];

            if(tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

                _dic[tmpUnit.pos] = true;

                _arr.push(tmpUnit);

                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }

        if(y > 0){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos - Main.MAP_WIDTH];

            if(tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

                _dic[tmpUnit.pos] = true;

                _arr.push(tmpUnit);

                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }

        if(y < Main.MAP_HEIGHT - 1){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos + Main.MAP_WIDTH];

            if(tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

                _dic[tmpUnit.pos] = true;

                _arr.push(tmpUnit);

                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }
    }
    
    private getMapArea():MapArea{

        if(this.areaPool.length > 0){

            return this.areaPool.pop();
        }
        else{

            let area:MapArea = new MapArea();

            area.init();

            return area;
        }
    }

    private getMapUnit():MapUnit{

        if(this.unitPool.length > 0){

            return this.unitPool.pop();
        }
        else{

            let unit:MapUnit = new MapUnit();

            return unit;
        }
    }

    public static arrToNumber(_arr:MapUnit[]):number{

        let r:number = 0;

        for(let i:number = 0, m:number = _arr.length ; i < m ; i++){

            r = r | (1 << _arr[i].pos);
        }

        r |= _arr[0].color << (Main.MAP_WIDTH * Main.MAP_HEIGHT);

        return r;
    }
}