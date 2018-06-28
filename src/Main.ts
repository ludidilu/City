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

    private gameContainer:egret.DisplayObjectContainer;

    private clickContainer:egret.DisplayObjectContainer;

    private mapContainer:egret.DisplayObjectContainer;

    private test:Test;

    public constructor() {

        super();

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event):void{
        
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

        egret.registerImplementation("eui.IAssetAdapter", new AssetAdapter());
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

        //初始化Resource资源加载库
        // RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        // RES.loadConfig("resource/default.res.json", "resource/");

        this.loadResources();
    }

    private async loadResources():Promise<void>{

        await RES.loadConfig("resource/default.res.json", "resource/");
        await this.loadTheme();
        await RES.loadGroup("preload");

        this.init();
    }

    private loadTheme():Promise<{}> {
        return new Promise((resolve, reject) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme("resource/default.thm.json", this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this);

        })
    }

    private clickTest(e:egret.TouchEvent):void{

        // this.testReal();

        // let arr:{data:{pos:number, color:number}[]} = {};

        let arr:{pos:number, color:number}[] = [];

        for(let unit of this.unitArr){

            let obj = {pos:unit.pos, color:unit.color};

            arr.push(obj);
        }

        let bbb = {data:arr};

        console.log("str:" + JSON.stringify(bbb));
    }

    private clickTest1(e:egret.TouchEvent):void{

        let arr:{data:{pos:number, color:number}[]} = RES.getRes("aaa_json");

        this.reset();

        for(let data of arr.data){

            let unit:MapUnit = this.getMapUnit();

            unit.pos = data.pos;

            unit.color = data.color;

            unit.score = 1;

            this.unitArr[unit.pos] = unit;
        }

        this.refreshMap();
    }

    private async testReal(){

    }

    private init():void{

        this.initContainer();

        this.test = new Test();

        this.addChild(this.test);

        this.test.bt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickTest, this);

        this.test.bt1.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickTest1, this);

        this.initClick();

        this.start();
    }


    private initContainer():void{

        this.gameContainer = new egret.DisplayObjectContainer();
        
        this.addChild(this.gameContainer);

        this.clickContainer = new egret.DisplayObjectContainer();

        this.gameContainer.addChild(this.clickContainer);

        this.mapContainer = new egret.DisplayObjectContainer();

        this.mapContainer.touchChildren = false;

        let mask:egret.Rectangle = new egret.Rectangle(0,0,Main.MAP_WIDTH * Main.GUID_WIDTH,Main.MAP_HEIGHT * Main.GUID_HEIGHT);

        this.mapContainer.mask = mask;

        this.gameContainer.addChild(this.mapContainer);

        this.gameContainer.y = 300;

        this.gameContainer.x = 20;
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

    private async click(_pos:number){

        this.clickContainer.touchChildren = false;

        let unit:MapUnit = this.unitArr[_pos];

        let area:MapArea = unit.area;

        if(area.unitArr.length > 1){

            this.unitCombine(unit);

            await this.unitFade(unit);

            this.unitSplit();

            this.refreshMap();

            await this.unitFallAsync();

            this.resetAreaPos();

            this.resetUnitColor();

            this.refreshMap();
        }
        else{

            this.unitDestroy(unit);

            this.unitSplit();

            this.refreshMap();

            await this.unitFallAsync();

            this.resetAreaPos();

            this.resetUnitColor();

            this.refreshMap();
        }

        this.clickContainer.touchChildren = true;
    }

    private unitDestroy(_unit:MapUnit):void{

        this.unitPool.push(_unit);

        this.unitArr[_unit.pos] = null;

        _unit.area.release();

        this.mapContainer.removeChild(_unit.area);

        delete this.areaDic[_unit.area.id];
    }

    private unitCombine(_unit:MapUnit):void{

        let area:MapArea = _unit.area;

        for(let i:number = 0, m:number = area.unitArr.length ; i < m ; i++){

            let tmpUnit:MapUnit = area.unitArr[i];

            if(tmpUnit != _unit){

                _unit.score += tmpUnit.score;

                this.unitPool.push(tmpUnit);

                this.unitArr[tmpUnit.pos] = null;
            }
        }
    }

    private async unitFade(_unit:MapUnit){

        await _unit.area.fade(_unit);
    }

    private unitSplit():void{

        for(let i:number = Main.MAP_WIDTH * Main.MAP_HEIGHT - 1 ; i > -1  ; i--){

            let unit:MapUnit = this.unitArr[i];

            if(unit && unit.color < Main.MAP_COLOR.length && unit.pos < Main.MAP_WIDTH * (Main.MAP_HEIGHT - 1) && !this.unitArr[unit.pos + Main.MAP_WIDTH]){

                unit.color += Main.MAP_COLOR.length * ((unit.pos % Main.MAP_WIDTH) + 1);

                let pos:number = unit.pos - Main.MAP_WIDTH;

                while(pos > -1){

                    let tmpUnit:MapUnit = this.unitArr[pos];

                    if(tmpUnit && tmpUnit.color < Main.MAP_COLOR.length){

                        tmpUnit.color += Main.MAP_COLOR.length * ((tmpUnit.pos % Main.MAP_WIDTH) + 1);
                    }

                    pos -= Main.MAP_WIDTH;
                }
            }
        }
    }

    private async unitFallAsync(){

        let oldDic:{[key:number]:number} = {};

        for(let i:number = Main.MAP_WIDTH * Main.MAP_HEIGHT - 1 ; i > -1  ; i--){

            let unit:MapUnit = this.unitArr[i];

            if(unit){

                let addValue:boolean = false;

                while(unit.pos < Main.MAP_WIDTH * (Main.MAP_HEIGHT - 1)){

                    if(!this.unitArr[unit.pos + Main.MAP_WIDTH]){

                        this.unitArr[unit.pos] = null;

                        unit.pos += Main.MAP_WIDTH;

                        this.unitArr[unit.pos] = unit;

                        if(!oldDic[unit.area.id]){

                            addValue = true;

                            oldDic[unit.area.id] = -Main.GUID_HEIGHT;
                        }
                        else if(addValue){

                            oldDic[unit.area.id] -= Main.GUID_HEIGHT;
                        }
                    }
                    else{

                        break;
                    }
                }
            }
        }

        let dic:{[key:number]:number} = {};

        let tmpArr:MapArea[] = []

        for(let key in oldDic){

            let area:MapArea = this.areaDic[key];

            let newKey:number = Main.arrToNumber(area.unitArr);

            delete this.areaDic[key];

            area.release();

            area.setData(area.unitArr, newKey, false);

            tmpArr.push(area);

            dic[newKey] = oldDic[key];

            area.y = oldDic[key];
        }

        for(let i:number = 0, m:number = tmpArr.length ; i < m ; i++){

            let area:MapArea = tmpArr[i];

            if(this.areaDic[area.id]){

                console.log("error!!!!!!!!!!!!!!!!");
            }

            this.areaDic[area.id] = area;
        }

        this.refill(true);

        for(let i:number = 0 ; i < Main.MAP_WIDTH * Main.MAP_HEIGHT; i++){

            let unit:MapUnit = this.unitArr[i];

            if(unit && !unit.area){

                let arr:MapUnit[] = [unit];

                let area:MapArea = this.getMapArea();

                let id:number = Main.arrToNumber(arr);

                area.setData(arr, id, false);

                this.mapContainer.addChild(area);

                if(this.areaDic[id]){

                    console.log("error!!!!!!!!!!!!!!!!");
                }

                this.areaDic[id] = area;

                let pos:number = unit.pos + Main.MAP_WIDTH;

                let num = -Main.GUID_HEIGHT * (1 + Math.floor(unit.pos / Main.MAP_WIDTH));

                while(pos < Main.MAP_WIDTH * Main.MAP_HEIGHT){

                    let tmpUnit:MapUnit = this.unitArr[pos];

                    if(!tmpUnit.area){

                        num -= Main.GUID_HEIGHT;
                    }

                    pos += Main.MAP_WIDTH;
                }

                dic[id] = num;

                area.y = num;
            }
        }

        let fun:(_v:number)=>void = function(_v:number):void{

            for(let key in dic){

                let area:MapArea = this.areaDic[key];

                area.y = _v * dic[key];
            }
        };

        await SuperTween.getInstance().to(1,0,1000,fun.bind(this));
    }

    private resetAreaPos():void{

        for(let key in this.areaDic){

            let area:MapArea = this.areaDic[key];

            area.x = area.y = 0;
        }
    }

    private resetUnitColor():void{

        for(let i:number = 0 ; i < Main.MAP_WIDTH * Main.MAP_HEIGHT ; i++){

            let unit:MapUnit = this.unitArr[i];

            if(unit.color >= Main.MAP_COLOR.length){

                unit.color = unit.color % Main.MAP_COLOR.length;
            }
        }
    }

    private unitFall():void{

        for(let i:number = Main.MAP_WIDTH * Main.MAP_HEIGHT - 1 ; i > -1  ; i--){

            let unit:MapUnit = this.unitArr[i];

            if(unit){

                while(unit.pos < Main.MAP_WIDTH * (Main.MAP_HEIGHT - 1)){

                    if(!this.unitArr[unit.pos + Main.MAP_WIDTH]){

                        this.unitArr[unit.pos] = null;

                        unit.pos += Main.MAP_WIDTH;

                        this.unitArr[unit.pos] = unit;
                    }
                    else{

                        break;
                    }
                }
            }
        }
    }

    private refill(_fixColor:boolean):void{

        for(let i:number = Main.MAP_WIDTH * Main.MAP_HEIGHT - 1 ; i > -1  ; i--){

            if(!this.unitArr[i]){

                let unit:MapUnit = this.getMapUnit();

                unit.pos = i;

                if(_fixColor){

                    unit.color = Math.floor(Math.random() * Main.MAP_COLOR.length) + Main.MAP_COLOR.length * (i % Main.MAP_WIDTH);
                }
                else{

                    unit.color = Math.floor(Math.random() * Main.MAP_COLOR.length);
                }

                unit.score = 1;

                unit.area = null;

                this.unitArr[i] = unit;
            }
        }
    }

    private start():void{

        this.refill(false);

        this.refreshMap();
    }

    private refreshMap():void{

        let dic:{[key:number]:boolean} = {};

        let arr:MapUnit[][] = [];

        for(let i:number = 0, m:number = Main.MAP_WIDTH * Main.MAP_HEIGHT ; i < m; i++){

            if(!dic[i]){

                let unit:MapUnit = this.unitArr[i];

                if(unit){

                    let tmpArr:MapUnit[] = [unit];

                    arr.push(tmpArr);

                    dic[i] = true;

                    this.checkNeighbour(tmpArr, dic, unit);
                }
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

                delete this.areaDic[key];
            }
            else{

                delete areaDic[key];
            }
        }

        let needSort:boolean = false;

        for(let key in areaDic){

            let tmpArr:MapUnit[] = areaDic[key];

            let area:MapArea = this.getMapArea();

            if(area.setData(tmpArr, key, true) && !needSort){

                needSort = true;
            }

            this.areaDic[key] = area;

            this.mapContainer.addChild(area);
        }

        if(needSort){

            this.sortArea();
        }
    }

    private sortArea():void{

        let arr:MapArea[] = [];

        for(let key in this.areaDic){

            arr.push(this.areaDic[key]);
        }

        arr = arr.sort(this.compareArea);

        for(let area of arr){

            this.mapContainer.setChildIndex(area, 0);
        }
    }

    private compareArea(_a:MapArea, _b:MapArea):number{

        if(_a.unitArr.length > _b.unitArr.length){

            return 1;
        }
        else if(_a.unitArr.length < _b.unitArr.length){

            return -1;
        }
        else{

            return 0;
        }
    }

    private checkNeighbour(_arr:MapUnit[], _dic:{[key:number]:boolean}, _unit:MapUnit):void{

        let x:number = _unit.pos % Main.MAP_WIDTH;

        let y:number = Math.floor(_unit.pos / Main.MAP_WIDTH);

        if(x > 0){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos - 1];

            if(tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

                _dic[tmpUnit.pos] = true;

                _arr.push(tmpUnit);

                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }

        if(x < Main.MAP_WIDTH - 1){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos + 1];

            if(tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

                _dic[tmpUnit.pos] = true;

                _arr.push(tmpUnit);

                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }

        if(y > 0){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos - Main.MAP_WIDTH];

            if(tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

                _dic[tmpUnit.pos] = true;

                _arr.push(tmpUnit);

                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }

        if(y < Main.MAP_HEIGHT - 1){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos + Main.MAP_WIDTH];

            if(tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

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

    private reset():void{

        for(let i:number = 0 ; i < Main.MAP_WIDTH * Main.MAP_HEIGHT ; i++){

            let unit:MapUnit = this.unitArr[i];

            if(unit){

                this.unitPool.push(unit);

                this.unitArr[i] = null;
            }
        }

        for(let key in this.areaDic){

            let area:MapArea = this.areaDic[key];

            area.release();

            this.mapContainer.removeChild(area);

            this.areaPool.push(area);
        }

        this.areaDic = {};
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