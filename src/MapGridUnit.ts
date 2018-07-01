class MapGridUnit extends egret.DisplayObjectContainer{

    private tf:egret.TextField;

    private spArr:egret.Shape[] = [];

    public pos:number;

    public score:number;

    public init():void{

        this.initSp();

        this.initTf();

        this.touchChildren = false;
    }

    private initSp():void{

        for(let i:number = 0, m:number = Main.MAP_COLOR.length - 1 ; i < m ; i++){

            let sp:egret.Shape = new egret.Shape();

            this.addChild(sp);

            this.spArr.push(sp);

            sp.graphics.beginFill(Main.MAP_COLOR[i]);

            sp.graphics.lineStyle(MapArea.LINE_WIDTH);

            sp.graphics.moveTo(Main.GUID_CUT_WIDTH, Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT);

            sp.graphics.lineTo(Main.GUID_CUT_WIDTH, Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT - Main.GUID_CURVE_HEIGHT);

            sp.graphics.curveTo(Main.GUID_CUT_WIDTH, Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT, Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH, Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT);

            sp.graphics.lineTo(Main.GUID_WIDTH - Main.GUID_CUT_WIDTH - Main.GUID_CURVE_WIDTH, Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT);

            sp.graphics.curveTo(Main.GUID_WIDTH - Main.GUID_CUT_WIDTH, Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT, Main.GUID_WIDTH - Main.GUID_CUT_WIDTH, Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT - Main.GUID_CURVE_HEIGHT);

            sp.graphics.lineTo(Main.GUID_WIDTH - Main.GUID_CUT_WIDTH, Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT);

            sp.graphics.curveTo(Main.GUID_WIDTH - Main.GUID_CUT_WIDTH, Main.GUID_CUT_HEIGHT, Main.GUID_WIDTH - Main.GUID_CUT_WIDTH - Main.GUID_CURVE_WIDTH, Main.GUID_CUT_HEIGHT);

            sp.graphics.lineTo(Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH, Main.GUID_CUT_HEIGHT);

            sp.graphics.curveTo(Main.GUID_CUT_WIDTH, Main.GUID_CUT_HEIGHT, Main.GUID_CUT_WIDTH, Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT);

            sp.visible = false;
        }
    }

    private initTf():void{

        this.tf = new egret.TextField();
            
        this.tf.width = Main.GUID_WIDTH;

        this.tf.height = Main.GUID_HEIGHT;

        this.tf.verticalAlign = egret.VerticalAlign.MIDDLE;

        this.tf.textAlign = egret.HorizontalAlign.CENTER;

        this.tf.bold = true;

        this.tf.textColor = 0x000000;

        this.addChild(this.tf);
    }

    public setScore(_score:number, _canOverMaxLevel:boolean):void{

        this.score = _score;

        let level:number = MapArea.getLevel(this.score, _canOverMaxLevel);

        this.tf.text = level.toString();
    }

    public showSp(_index:number):void{

        this.spArr[_index].visible = true;
    }

    public reset():void{

        for(let i:number = 0, m:number = Main.MAP_COLOR.length - 1 ; i < m ; i++){

            this.spArr[i].visible = false;
        }

        this.x = this.y = 0;
    }
}