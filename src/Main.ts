class Main extends egret.DisplayObjectContainer {

    public static config:Config;

    private static tmpArr:number[] = [];

    private static tmpArr3:MapArea[] = [];

    private static tmpDic:{[key:number]:MapUnit[]} = {};

    private static tmpDic2:{[key:number]:boolean} = {};

    private static tmpDic3:{[key:number]:number} = {};

    private static mapUnitArrPool:MapUnit[][] = [];

    private unitArr:MapUnit[] = [];

    private unitPool:MapUnit[] = [];

    private areaDic:{[key:number]:MapArea} = {};

    private areaPool:MapArea[] = [];

    private gameContainer:egret.DisplayObjectContainer;

    private clickContainer:egret.DisplayObjectContainer;

    private mapContainer:egret.DisplayObjectContainer;

    private uiContainer:egret.DisplayObjectContainer;

    private unitDestroyTimes:number;

    private year:number;

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
        await this.loadConfig();

        this.init();

        this.start();
    }

    private async loadConfig(){

        Main.config = await RES.getResAsync("config_json");
    }

    private async loadTheme(){
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

        let arr:{data:{pos:number, color:number}[]} = RES.getRes("bbb_json");

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

    private init():void{

        this.initBg();

        this.initContainer();

        this.initClick();

        this.initUi();
    }

    private initBg():void{

        let sp:egret.Shape = new egret.Shape();

        sp.graphics.beginFill(Main.config.BG_COLOR);

        sp.graphics.drawRect(0, 0, this.stage.stageWidth, this.stage.stageHeight);

        this.addChild(sp);
    }

    private initContainer():void{

        this.gameContainer = new egret.DisplayObjectContainer();
        
        this.addChild(this.gameContainer);

        this.clickContainer = new egret.DisplayObjectContainer();

        this.gameContainer.addChild(this.clickContainer);

        this.mapContainer = new egret.DisplayObjectContainer();

        this.mapContainer.touchChildren = false;

        let mask:egret.Rectangle = new egret.Rectangle(0,0,Main.config.MAP_WIDTH * Main.config.GUID_WIDTH,Main.config.MAP_HEIGHT * Main.config.GUID_HEIGHT);

        this.mapContainer.mask = mask;

        this.gameContainer.addChild(this.mapContainer);

        this.gameContainer.y = 50;

        this.gameContainer.x = 20;

        this.uiContainer = new egret.DisplayObjectContainer();

        this.addChild(this.uiContainer);
    }

    private initClick():void{

        for(let i:number = 0 ; i < Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT ; i++){

            let pos:number = i;

            let x:number = pos % Main.config.MAP_WIDTH;

            let y:number = Math.floor(pos / Main.config.MAP_WIDTH);

            let sp:egret.Sprite = new egret.Sprite();

            sp.touchEnabled = true;

            sp.graphics.beginFill(0, 0);

            sp.graphics.drawRect(x * Main.config.GUID_WIDTH, y * Main.config.GUID_HEIGHT, Main.config.GUID_WIDTH, Main.config.GUID_HEIGHT);

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

            this.refreshScore();

            await this.checkIsOver();
        }
        else{

            if(this.unitDestroyTimes > 0){

                let b:boolean = await this.alertPanel.showTwo("Destroy?");

                if(b){

                    this.setUnitDestroyTimes(this.unitDestroyTimes - 1);

                    this.unitDestroy(unit);

                    this.unitSplit();

                    this.refreshMap();

                    await this.unitFallAsync();

                    this.resetAreaPos();

                    this.resetUnitColor();

                    this.refreshMap();

                    this.refreshScore();

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

        if(this.isOver()){

            if(this.unitDestroyTimes == 0){

                await this.alertPanel.showOne("You lose!");

                this.reset();

                this.start();
            }
            else{

                await this.alertPanel.showOne("You have to destroy one!");
            }
        }
    }

    private refreshScore():void{

        let score:number = 0;

        for(let i:number = 0, m:number = Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT; i < m ; i++){

            let unit:MapUnit = this.unitArr[i];

            if(unit){

                let level:number = MapArea.getLevel(unit.score, true);
                
                if(level < Main.config.LEVEL_SCORE_ARR.length){

                    score += Main.config.LEVEL_SCORE_ARR[level - 1];
                }
            }

            this.mainPanel.score.text = score.toString();
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

        let isFinal:boolean = _unit.score == Main.config.LEVEL_ARR[Main.config.LEVEL_ARR.length - 1];

        for(let i:number = 0, m:number = area.unitArr.length ; i < m ; i++){

            let tmpUnit:MapUnit = area.unitArr[i];

            if(tmpUnit != _unit){

                _unit.score += tmpUnit.score;

                this.unitPool.push(tmpUnit);

                this.unitArr[tmpUnit.pos] = null;
            }
        }

        if(isFinal){

            _unit.color = Main.config.MAP_COLOR.length - 1 + Main.config.MAP_COLOR.length * _unit.pos;

            let level:number = MapArea.getLevel(_unit.score, true);

            if(level >= Main.config.LEVEL_ADD_DESTROY_TIMES){

                this.setUnitDestroyTimes(this.unitDestroyTimes + 1);
            }
        }
        else{

            if(_unit.score >= Main.config.LEVEL_ARR[Main.config.LEVEL_ARR.length - 1]){

                _unit.score = Main.config.LEVEL_ARR[Main.config.LEVEL_ARR.length - 1];

                _unit.color = Main.config.MAP_COLOR.length - 2;
            }
        }

        this.setYear(this.year + 1);

        if(this.year % Main.config.COMBINE_ADD_DESTROY_TIMES == 0){

            this.setUnitDestroyTimes(this.unitDestroyTimes + 1);
        }
    }

    private async unitFade(_unit:MapUnit){

        // await _unit.area.fade(_unit);

        await _unit.area.fade2(_unit);
    }

    private unitSplit():void{

        for(let i:number = Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT - 1 ; i > -1  ; i--){

            let unit:MapUnit = this.unitArr[i];

            if(unit && unit.color < Main.config.MAP_COLOR.length - 1 && unit.pos < Main.config.MAP_WIDTH * (Main.config.MAP_HEIGHT - 1) && !this.unitArr[unit.pos + Main.config.MAP_WIDTH]){

                unit.color += Main.config.MAP_COLOR.length * ((unit.pos % Main.config.MAP_WIDTH) + 1);

                let pos:number = unit.pos - Main.config.MAP_WIDTH;

                while(pos > -1){

                    let tmpUnit:MapUnit = this.unitArr[pos];

                    if(tmpUnit && tmpUnit.color < Main.config.MAP_COLOR.length - 1){

                        tmpUnit.color += Main.config.MAP_COLOR.length * ((tmpUnit.pos % Main.config.MAP_WIDTH) + 1);
                    }

                    pos -= Main.config.MAP_WIDTH;
                }
            }
        }
    }

    private async unitFallAsync(){

        let self:Main = this;

        for(let i:number = Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT - 1 ; i > -1  ; i--){

            let unit:MapUnit = self.unitArr[i];

            if(unit){

                let num:number = 0;

                while(unit.pos < Main.config.MAP_WIDTH * (Main.config.MAP_HEIGHT - 1) && !self.unitArr[unit.pos + Main.config.MAP_WIDTH]){

                    for(let i:number = 0, m:number = unit.area.unitArr.length ; i < m ; i++){

                        let tmpUnit:MapUnit = unit.area.unitArr[i];

                        if(self.unitArr[tmpUnit.pos] == tmpUnit){

                            self.unitArr[tmpUnit.pos] = null;
                        }

                        tmpUnit.pos += Main.config.MAP_WIDTH;

                        self.unitArr[tmpUnit.pos] = tmpUnit;
                    }

                    num--;
                }

                if(num < 0){

                    let area:MapArea = unit.area;

                    let newKey:number = Main.arrToNumber(area.unitArr);

                    delete self.areaDic[area.id];

                    self.areaDic[newKey] = area;

                    area.y = Main.tmpDic3[newKey] = num * Main.config.GUID_HEIGHT;

                    let tmpArr:MapUnit[] = Main.getMapUnitArr();

                    for(let i:number = 0, m:number = area.unitArr.length ; i < m ; i++){

                        tmpArr.push(area.unitArr[i]);
                    }

                    area.release();

                    area.setData(tmpArr, newKey, false);

                    tmpArr.length = 0;

                    Main.mapUnitArrPool.push(tmpArr);
                }
            }
        }

        self.refill(true, self.sameColorProbability);

        let minNum:number = 0;

        for(let i:number = 0 ; i < Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT; i++){

            let unit:MapUnit = self.unitArr[i];

            if(unit && !unit.area){

                let arr:MapUnit[] = Main.getMapUnitArr();

                arr.push(unit);

                let area:MapArea = self.getMapArea();

                let id:number = Main.arrToNumber(arr);

                area.setData(arr, id, false);

                arr.length = 0;

                Main.mapUnitArrPool.push(arr);

                self.mapContainer.addChild(area);

                self.areaDic[id] = area;

                let pos:number = unit.pos + Main.config.MAP_WIDTH;

                let num = -Main.config.GUID_HEIGHT * (1 + Math.floor(unit.pos / Main.config.MAP_WIDTH));

                while(pos < Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT){

                    let tmpUnit:MapUnit = self.unitArr[pos];

                    if(!tmpUnit.area){

                        num -= Main.config.GUID_HEIGHT;
                    }

                    pos += Main.config.MAP_WIDTH;
                }

                Main.tmpDic3[id] = num;

                area.y = num;

                if(num < minNum){

                    minNum = num;
                }
            }
        }

        let fun:(_v:number)=>void = function(_v:number):void{

            for(let key in Main.tmpDic3){

                let area:MapArea = self.areaDic[key];

                area.y = Main.tmpDic3[key] - _v * minNum;

                if(area.y >= 0){

                    area.y = 0;

                    delete Main.tmpDic3[key];
                }
            }
        };

        await SuperTween.getInstance().to(0, 1, -minNum * 300 / Main.config.GUID_HEIGHT, fun);
    }

    private resetAreaPos():void{

        for(let key in this.areaDic){

            let area:MapArea = this.areaDic[key];

            area.x = area.y = 0;
        }
    }

    private resetUnitColor():void{

        for(let i:number = 0 ; i < Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT ; i++){

            let unit:MapUnit = this.unitArr[i];

            let tmpColor:number = unit.color % Main.config.MAP_COLOR.length;

            if(tmpColor < Main.config.MAP_COLOR.length - 1){

                unit.color = tmpColor;
            }
        }
    }

    private unitFall():void{

        for(let i:number = Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT - 1 ; i > -1  ; i--){

            let unit:MapUnit = this.unitArr[i];

            if(unit){

                while(unit.pos < Main.config.MAP_WIDTH * (Main.config.MAP_HEIGHT - 1)){

                    if(!this.unitArr[unit.pos + Main.config.MAP_WIDTH]){

                        this.unitArr[unit.pos] = null;

                        unit.pos += Main.config.MAP_WIDTH;

                        this.unitArr[unit.pos] = unit;
                    }
                    else{

                        break;
                    }
                }
            }
        }
    }

    private refill(_fixColor:boolean, _sameProbability:number):void{

        for(let i:number = Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT - 1 ; i > -1  ; i--){

            if(!this.unitArr[i]){

                let unit:MapUnit = this.getMapUnit();

                unit.pos = i;

                let color:number;

                if(Math.random() < _sameProbability){

                    let x:number = i % Main.config.MAP_WIDTH;

                    let y:number = Math.floor(i / Main.config.MAP_WIDTH);

                    if(x > 0){

                        let pos = i - 1;

                        let tmpUnit:MapUnit = this.unitArr[pos];

                        if(tmpUnit){

                            let tmpColor:number = tmpUnit.color % Main.config.MAP_COLOR.length;

                            if(tmpColor < Main.config.MAP_COLOR.length - 2){

                                Main.tmpArr.push(tmpColor);
                            }
                        }
                    }

                    if(x < Main.config.MAP_WIDTH - 1){

                        let pos = i + 1;

                        let tmpUnit:MapUnit = this.unitArr[pos];

                        if(tmpUnit){

                            let tmpColor:number = tmpUnit.color % Main.config.MAP_COLOR.length;

                            if(tmpColor < Main.config.MAP_COLOR.length - 2){

                                Main.tmpArr.push(tmpColor);
                            }
                        }
                    }

                    if(y > 0){

                        let pos = i - Main.config.MAP_WIDTH;

                        let tmpUnit:MapUnit = this.unitArr[pos];

                        if(tmpUnit){

                            let tmpColor:number = tmpUnit.color % Main.config.MAP_COLOR.length;

                            if(tmpColor < Main.config.MAP_COLOR.length - 2){

                                Main.tmpArr.push(tmpColor);
                            }
                        }
                    }

                    if(y < Main.config.MAP_HEIGHT - 1){

                        let pos = i + Main.config.MAP_WIDTH;

                        let tmpUnit:MapUnit = this.unitArr[pos];

                        if(tmpUnit){

                            let tmpColor:number = tmpUnit.color % Main.config.MAP_COLOR.length;

                            if(tmpColor < Main.config.MAP_COLOR.length - 2){

                                Main.tmpArr.push(tmpColor);
                            }
                        }
                    }

                    if(Main.tmpArr.length > 0){

                        let index:number = Math.floor(Math.random() * Main.tmpArr.length);

                        color = Main.tmpArr[index];

                        Main.tmpArr.length = 0;
                    }
                    else{

                        color = Math.floor(Math.random() * (Main.config.MAP_COLOR.length - 2));
                    }
                }
                else{

                    color = Math.floor(Math.random() * (Main.config.MAP_COLOR.length - 2));
                }

                if(_fixColor){

                    unit.color = color + Main.config.MAP_COLOR.length * ((i % Main.config.MAP_WIDTH) + 1);
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

    private setUnitDestroyTimes(_v:number):void{

        this.unitDestroyTimes = _v;

        this.mainPanel.times.text = this.unitDestroyTimes.toString();
    }

    private setYear(_v:number):void{

        this.year = _v;

        this.mainPanel.year.text = this.year.toString();
    }

    private start():void{

        this.setUnitDestroyTimes(Main.config.DEFAULT_DESTROY_TIMES);

        this.setYear(0);

        this.refill(false, this.sameColorProbability);

        this.refreshMap();

        this.refreshScore();
    }

    private refreshMap():void{

        for(let i:number = 0, m:number = Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT ; i < m; i++){

            if(!Main.tmpDic2[i]){

                let unit:MapUnit = this.unitArr[i];

                if(unit){

                    let tmpArr:MapUnit[] = Main.getMapUnitArr();

                    tmpArr.push(unit);

                    Main.tmpDic2[i] = true;

                    this.checkNeighbour(tmpArr, Main.tmpDic2, unit);

                    let id:number = Main.arrToNumber(tmpArr);

                    Main.tmpDic[id] = tmpArr;
                }
            }
        }

        for(let key in Main.tmpDic2){

            delete Main.tmpDic2[key];
        }

        for(let key in this.areaDic){

            if(!Main.tmpDic[key]){

                let area:MapArea = this.areaDic[key];

                area.release();

                this.mapContainer.removeChild(area);

                this.areaPool.push(area);

                delete this.areaDic[key];
            }
            else{

                let tmpArr:MapUnit[] = Main.tmpDic[key];

                tmpArr.length = 0;

                Main.mapUnitArrPool.push(tmpArr);

                delete Main.tmpDic[key];
            }
        }

        let needSort:boolean = false;

        for(let key in Main.tmpDic){

            let tmpArr:MapUnit[] = Main.tmpDic[key];

            let area:MapArea = this.getMapArea();

            if(area.setData(tmpArr, key, true) && !needSort){

                needSort = true;
            }

            this.areaDic[key] = area;

            this.mapContainer.addChild(area);

            tmpArr.length = 0;

            Main.mapUnitArrPool.push(tmpArr);

            delete Main.tmpDic[key];
        }

        if(needSort){

            this.sortArea();
        }
    }

    private sortArea():void{

        for(let key in this.areaDic){

            Main.tmpArr3.push(this.areaDic[key]);
        }

        Main.tmpArr3.sort(this.compareArea);

        for(let i:number = 0, m:number = Main.tmpArr3.length ; i < m ; i++){

            let area:MapArea = Main.tmpArr3[i];

            this.mapContainer.setChildIndex(area, 0);
        }

        Main.tmpArr3.length = 0;
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

        let x:number = _unit.pos % Main.config.MAP_WIDTH;

        let y:number = Math.floor(_unit.pos / Main.config.MAP_WIDTH);

        if(x > 0){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos - 1];

            if(tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

                _dic[tmpUnit.pos] = true;

                _arr.push(tmpUnit);

                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }

        if(x < Main.config.MAP_WIDTH - 1){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos + 1];

            if(tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

                _dic[tmpUnit.pos] = true;

                _arr.push(tmpUnit);

                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }

        if(y > 0){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos - Main.config.MAP_WIDTH];

            if(tmpUnit && tmpUnit.color == _unit.color && !_dic[tmpUnit.pos]){

                _dic[tmpUnit.pos] = true;

                _arr.push(tmpUnit);

                this.checkNeighbour(_arr, _dic, tmpUnit);
            }
        }

        if(y < Main.config.MAP_HEIGHT - 1){

            let tmpUnit:MapUnit = this.unitArr[_unit.pos + Main.config.MAP_WIDTH];

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

    private static getMapUnitArr():MapUnit[]{

        if(this.mapUnitArrPool.length > 0){

            return this.mapUnitArrPool.pop();
        }
        else{

            let unitArr:MapUnit[] = [];

            return unitArr;
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

        for(let i:number = 0 ; i < Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT ; i++){

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

            delete this.areaDic[key];
        }
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

        r |= _arr[0].color << (Main.config.MAP_WIDTH * Main.config.MAP_HEIGHT);

        return r;
    }
}