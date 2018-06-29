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

    public static readonly DEFAULT_DESTROY_TIMES:number = 2;

    private unitArr:MapUnit[] = [];

    private unitPool:MapUnit[] = [];

    private areaDic:{[key:number]:MapArea} = {};

    private areaPool:MapArea[] = [];

    private gameContainer:egret.DisplayObjectContainer;

    private clickContainer:egret.DisplayObjectContainer;

    private mapContainer:egret.DisplayObjectContainer;

    private uiContainer:egret.DisplayObjectContainer;

    private unitDestroyTimes:number;

    private sameColorProbability:number = 0;

    private mainPanel:MainPanel;

    private alertPanel:AlertPanel;

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

        console.log("over:" + this.isOver());
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

        this.initClick();

        this.initUi();

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

        this.gameContainer.y = 50;

        this.gameContainer.x = 20;

        this.uiContainer = new egret.DisplayObjectContainer();

        this.addChild(this.uiContainer);
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

            await this.checkIsOver();
        }
        else{

            if(this.unitDestroyTimes > 0){

                let b:boolean = await this.alertPanel.showTwo("Destroy?");

                if(b){

                    this.unitDestroyTimes--;

                    this.mainPanel.times.text = this.unitDestroyTimes.toString();

                    this.unitDestroy(unit);

                    this.unitSplit();

                    this.refreshMap();

                    await this.unitFallAsync();

                    this.resetAreaPos();

                    this.resetUnitColor();

                    this.refreshMap();

                    await this.checkIsOver();
                }
            }
            else{

                await this.alertPanel.showOne("Can not destroy!");
            }
        }

        this.clickContainer.touchChildren = true;
    }

    private async checkIsOver(){

        if(this.unitDestroyTimes == 0){

            if(this.isOver()){

                await this.alertPanel.showOne("You lose!");

                this.reset();

                this.start();
            }
        }
    }

    private initUi():void{

        this.mainPanel = new MainPanel();

        this.uiContainer.addChild(this.mainPanel);

        this.alertPanel = new AlertPanel();

        this.uiContainer.addChild(this.alertPanel);

        this.test = new Test();

        this.uiContainer.addChild(this.test);

        this.test.bt.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickTest, this);

        this.test.bt1.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickTest1, this);
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

        this.refill(true, this.sameColorProbability);

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

    private refill(_fixColor:boolean, _same:number):void{

        for(let i:number = Main.MAP_WIDTH * Main.MAP_HEIGHT - 1 ; i > -1  ; i--){

            if(!this.unitArr[i]){

                let unit:MapUnit = this.getMapUnit();

                unit.pos = i;

                let color:number;

                if(Math.random() < _same){

                    let arr:number[] = [];

                    let x:number = i % Main.MAP_WIDTH;

                    let y:number = Math.floor(i / Main.MAP_WIDTH);

                    if(x > 0){

                        let pos = i - 1;

                        let tmpUnit:MapUnit = this.unitArr[pos];

                        if(tmpUnit){

                            arr.push(tmpUnit.color % Main.MAP_COLOR.length);
                        }
                    }

                    if(x < Main.MAP_WIDTH - 1){

                        let pos = i + 1;

                        let tmpUnit:MapUnit = this.unitArr[pos];

                        if(tmpUnit){

                            arr.push(tmpUnit.color % Main.MAP_COLOR.length);
                        }
                    }

                    if(y > 0){

                        let pos = i - Main.MAP_WIDTH;

                        let tmpUnit:MapUnit = this.unitArr[pos];

                        if(tmpUnit){

                            arr.push(tmpUnit.color % Main.MAP_COLOR.length);
                        }
                    }

                    if(y < Main.MAP_HEIGHT - 1){

                        let pos = i + Main.MAP_WIDTH;

                        let tmpUnit:MapUnit = this.unitArr[pos];

                        if(tmpUnit){

                            arr.push(tmpUnit.color % Main.MAP_COLOR.length);
                        }
                    }

                    if(arr.length > 0){

                        let index:number = Math.floor(Math.random() * arr.length);

                        color = arr[index];
                    }
                    else{

                        color = Math.floor(Math.random() * Main.MAP_COLOR.length);
                    }
                }
                else{

                    color = Math.floor(Math.random() * Main.MAP_COLOR.length);
                }

                if(_fixColor){

                    unit.color = color + Main.MAP_COLOR.length * ((i % Main.MAP_WIDTH) + 1);
                }
                else{

                    unit.color = color;
                }

                unit.score = 1;

                unit.area = null;

                this.unitArr[i] = unit;
            }
        }
    }

    private start():void{

        this.unitDestroyTimes = Main.DEFAULT_DESTROY_TIMES;

        this.mainPanel.times.text = this.unitDestroyTimes.toString();

        this.refill(false, this.sameColorProbability);

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

        for(let i:number = 0, m:number = arr.length ; i < m ; i++){

            let area:MapArea = arr[i];

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

    private isOver():boolean{

        for(let key in this.areaDic){

            let area:MapArea = this.areaDic[key];

            if(area.unitArr.length > 1){

                return false;
            }
        }

        return true;
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