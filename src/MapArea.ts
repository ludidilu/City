class GraphicsList{

    public list:egret.Graphics[] = [];

    public moveTo(_x:number, _y:number):void{

        for(let i:number = 0, m:number = this.list.length ; i < m ; i ++){

            this.list[i].moveTo(_x, _y);
        }
    }

    public lineTo(_x:number, _y:number):void{

        for(let i:number = 0, m:number = this.list.length ; i < m ; i ++){

            this.list[i].lineTo(_x, _y);
        }
    }

    public curveTo(_cx:number, _cy:number, _tx:number, _ty:number):void{

        for(let i:number = 0, m:number = this.list.length ; i < m ; i ++){

            this.list[i].curveTo(_cx, _cy, _tx, _ty);
        }
    }
}

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

        for(let i:number = 0, m:number = Main.MAP_COLOR.length ; i < m ; i++){

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

    public setScore(_score:number):void{

        this.score = _score;

        this.tf.text = this.score.toString();
    }

    public showSp(_index:number):void{

        this.spArr[_index].visible = true;
    }

    public reset():void{

        for(let i:number = 0, m:number = Main.MAP_COLOR.length ; i < m ; i++){

            this.spArr[i].visible = false;
        }

        this.x = this.y = 0;
    }
}

class MapArea extends egret.DisplayObjectContainer{

    public static readonly LINE_WIDTH:number = 5;

    private static gridPool:MapGridUnit[] = [];

    private static maskSpPool:egret.Shape[] = [];

    private static graphicsList:GraphicsList = new GraphicsList();

    public unitArr:MapUnit[];

    public id:number;

    private spContainer:egret.DisplayObjectContainer;

    private gridContainer:egret.DisplayObjectContainer;

    private sp:egret.Shape;

    private pointArr:number[][][] = [];

    private gridDic:{[key:number]:MapGridUnit} = {}

    private maskArr:egret.Shape[] = [];

    public init():void{

        this.spContainer = new egret.DisplayObjectContainer();
        
        this.addChild(this.spContainer);

        this.gridContainer = new egret.DisplayObjectContainer();

        this.addChild(this.gridContainer);

        this.sp = new egret.Shape();

        this.spContainer.addChild(this.sp);

        for(let i:number = 0 ; i < 8 ; i++){

            this.pointArr[i] = [];
        }
    }

    public release():void{

        for(let key in this.gridDic){

            let grid:MapGridUnit = this.gridDic[key];

            grid.reset();

            this.gridContainer.removeChild(grid);

            MapArea.gridPool.push(grid);
        }

        this.gridDic = {};

        this.releaseMask();

        this.releaseGraphics();
    }

    private releaseMask():void{

        for(let i:number = 0, m:number = this.maskArr.length ; i < m ; i++){

            let sp:egret.Shape = this.maskArr[i];

            sp.graphics.clear();

            this.spContainer.removeChild(sp);

            MapArea.maskSpPool.push(sp);
        }

        this.maskArr.length = 0;
    }

    private releaseGraphics():void{

        this.sp.graphics.clear();
    }

    private releaseGrid(_grid:MapGridUnit):void{

        _grid.reset();

        this.gridContainer.removeChild(_grid);

        MapArea.gridPool.push(_grid);

        delete this.gridDic[_grid.pos];
    }

    private static getGrid(_container:egret.DisplayObjectContainer, _pos:number):MapGridUnit{

        let grid:MapGridUnit;

        if(this.gridPool.length > 0){

            grid = this.gridPool.pop();
        }
        else{

            grid = new MapGridUnit();

            grid.init();
        }

        grid.pos = _pos;

        _container.addChild(grid);

        return grid;
    }

    private static getMaskSp(_container:egret.DisplayObjectContainer):egret.Shape{

        let sp:egret.Shape;

        if(this.maskSpPool.length > 0){

            sp = this.maskSpPool.pop();
        }
        else{

            sp = new egret.Shape();
        }

        sp.graphics.lineStyle(MapArea.LINE_WIDTH);

        _container.addChild(sp);

        return sp;
    }

    public setData(_unitArr:MapUnit[], _id, _checkCircle:boolean):boolean{

        this.unitArr = _unitArr;

        this.id = _id;

        let command:egret.Graphics = this.sp.graphics;

        let pointArr:number[][][] = this.pointArr;

        command.beginFill(Main.MAP_COLOR[this.unitArr[0].color % Main.MAP_COLOR.length]);

        command.lineStyle(MapArea.LINE_WIDTH);

        for(let i:number = 0, m:number = this.unitArr.length; i < m ; i++){

            let unit:MapUnit = this.unitArr[i];

            unit.area = this;

            let pos:number = unit.pos;

            let x:number = pos % Main.MAP_WIDTH;

            let y:number = Math.floor(pos / Main.MAP_WIDTH);

            let grid:MapGridUnit = MapArea.getGrid(this.gridContainer, pos);

            this.gridDic[pos] = grid;

            grid.x = x * Main.GUID_WIDTH;

            grid.y = y * Main.GUID_HEIGHT;

            grid.setScore(unit.score);

            if(x == 0 || !(this.id & (1 << (pos - 1)))){

                let sx:number = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH;

                let sy:number = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT;

                pointArr[0].push([sx, sy]);

                let tx:number = sx;

                let ty:number = sy + (Main.GUID_HEIGHT - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2);

                pointArr[1].push([tx, ty]);
            }

            if(x == Main.MAP_WIDTH - 1 || !(this.id & (1 << pos + 1))){

                let sx:number = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2);

                let sy:number = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT;

                pointArr[2].push([sx, sy]);

                let tx:number = sx;

                let ty:number = sy + (Main.GUID_HEIGHT - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2);

                pointArr[3].push([tx, ty]);
            }

            if(y == 0 || (!(this.id & (1 << (pos - Main.MAP_WIDTH))))){

                let sx:number = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH;

                let sy:number = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT;

                pointArr[4].push([sx, sy]);

                let tx:number = sx + (Main.GUID_WIDTH - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2);

                let ty:number = sy;

                pointArr[5].push([tx, ty]);
            }

            if(y == Main.MAP_HEIGHT - 1 || !(this.id & (1 << (pos + Main.MAP_WIDTH)))){

                let sx:number = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH;

                let sy:number = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT + (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2);

                pointArr[6].push([sx, sy]);

                let tx:number = sx + (Main.GUID_WIDTH - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2);

                let ty:number = sy;

                pointArr[7].push([tx, ty]);
            }
        }

        let sx:number = pointArr[0][0][0];

        let sy:number = pointArr[0][0][1];

        MapArea.graphicsList.list.push(command);

        this.drawLine(sx, sy, 0, sx, sy, MapArea.graphicsList, pointArr, true);

        MapArea.graphicsList.list.length = 0;

        if(!_checkCircle){

            return false;
        }

        let needSort:boolean = false;

        while(true){

            let drawMask:boolean = false;

            for(let i:number = 0 ; i < 8 ; i++){

                let arr:number[][] = this.pointArr[i];

                if(arr.length > 0){

                    drawMask = true;

                    needSort = true;

                    sx = arr[0][0];

                    sy = arr[0][1]; 

                    let sp:egret.Shape = MapArea.getMaskSp(this.spContainer);

                    this.maskArr.push(sp);

                    sp.blendMode = egret.BlendMode.ERASE;

                    sp.graphics.beginFill(0);

                    let sp2:egret.Shape = MapArea.getMaskSp(this.spContainer);

                    this.maskArr.push(sp2);

                    sp2.blendMode = egret.BlendMode.NORMAL;

                    sp2.graphics.beginFill(0, 0);

                    MapArea.graphicsList.list.push(sp.graphics);

                    MapArea.graphicsList.list.push(sp2.graphics);

                    this.drawLine(sx, sy, 0, sx, sy, MapArea.graphicsList, pointArr, true);

                    MapArea.graphicsList.list.length = 0;
                }
            }

            if(!drawMask){

                break;
            }
        }

        return needSort;
    }

    private drawLine(_x:number, _y:number, _type:number, _startX:number, _startY:number, _graphics:GraphicsList, _arr:number[][][], _first?:boolean):void{

        if(_first){

            _graphics.moveTo(_x, _y);
        }
        else{

            _graphics.lineTo(_x, _y);

            if(_x == _startX && _y == _startY){

                return;
            }
        }

        this.arrContains(_x, _y, _arr[_type]);

        switch(_type){

            case 0:

            let tx:number = _x;

            let ty:number = _y - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;

            if(this.arrContains(tx, ty, _arr[1])){

                _graphics.lineTo(tx, ty);

                let nx:number = _x;

                let ny:number = _y - Main.GUID_HEIGHT;

                this.drawLine(nx, ny, 0, _startX, _startY, _graphics, _arr);
            }
            else{

                tx = _x + Main.GUID_CURVE_WIDTH;

                ty = _y - Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[4])){

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 5, _startX, _startY, _graphics, _arr);
                }
                else{

                    tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    this.arrContains(tx, ty, _arr[7]);

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x - (Main.GUID_WIDTH - Main.GUID_CURVE_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 6, _startX, _startY, _graphics, _arr);
                }
            }

            break;

            case 1:

            tx = _x;

            ty = _y + (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;

            if(this.arrContains(tx, ty, _arr[0])){

                _graphics.lineTo(tx, ty);

                let nx:number = _x;

                let ny:number = _y + Main.GUID_HEIGHT;

                this.drawLine(nx, ny, 1, _startX, _startY, _graphics, _arr);
            }
            else{

                tx = _x + Main.GUID_CURVE_WIDTH;

                ty = _y + Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[6])){

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 7, _startX, _startY, _graphics, _arr);
                }
                else{

                    tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    this.arrContains(tx, ty, _arr[5]);

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x - (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 4, _startX, _startY, _graphics, _arr);
                }
            }

            break;

            case 2:

            tx = _x;

            ty = _y - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;

            if(this.arrContains(tx, ty, _arr[3])){

                _graphics.lineTo(tx, ty);

                let nx:number = _x;

                let ny:number = _y - Main.GUID_HEIGHT;

                this.drawLine(nx, ny, 2, _startX, _startY, _graphics, _arr);
            }
            else{

                tx = _x - Main.GUID_CURVE_WIDTH;

                ty = _y - Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[5])){

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x - (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 4, _startX, _startY, _graphics, _arr);
                }
                else{

                    tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    this.arrContains(tx, ty, _arr[6]);

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 7, _startX, _startY, _graphics, _arr);
                }
            }

            break;

            case 3:

            tx = _x;

            ty = _y + (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;

            if(this.arrContains(tx, ty, _arr[2])){

                _graphics.lineTo(tx, ty);

                let nx:number = _x;

                let ny:number = _y + Main.GUID_HEIGHT;

                this.drawLine(nx, ny, 3, _startX, _startY, _graphics, _arr);
            }
            else{

                tx = _x - Main.GUID_CURVE_WIDTH;

                ty = _y + Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[7])){

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x - (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 6, _startX, _startY, _graphics, _arr);
                }
                else{

                    tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    this.arrContains(tx, ty, _arr[4]);

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 5, _startX, _startY, _graphics, _arr);
                }
            }

            break;

            case 4:

            tx = _x - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;

            ty = _y;

            if(this.arrContains(tx, ty, _arr[5])){

                _graphics.lineTo(tx, ty);

                let nx:number = _x - Main.GUID_WIDTH;

                let ny:number = _y;

                this.drawLine(nx, ny, 4, _startX, _startY, _graphics, _arr);
            }
            else{

                tx = _x - Main.GUID_CURVE_WIDTH;

                ty = _y + Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[0])){

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y + (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 1, _startX, _startY, _graphics, _arr);
                }
                else{

                    tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    this.arrContains(tx, ty, _arr[3])

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y - (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 2, _startX, _startY, _graphics, _arr);
                }
            }

            break;

            case 5:

            tx = _x + (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;

            ty = _y;

            if(this.arrContains(tx, ty, _arr[4])){

                _graphics.lineTo(tx, ty);

                let nx:number = _x + Main.GUID_WIDTH;

                let ny:number = _y;

                this.drawLine(nx, ny, 5, _startX, _startY, _graphics, _arr);
            }
            else{

                tx = _x + Main.GUID_CURVE_WIDTH;

                ty = _y + Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[2])){

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y + (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 3, _startX, _startY, _graphics, _arr);
                }
                else{

                    tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    this.arrContains(tx, ty, _arr[1]);

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y - (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 0, _startX, _startY, _graphics, _arr);
                }
            }

            break;

            case 6:

            tx = _x - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;

            ty = _y;

            if(this.arrContains(tx, ty, _arr[7])){

                _graphics.lineTo(tx, ty);

                let nx:number = _x - Main.GUID_WIDTH;

                let ny:number = _y;

                this.drawLine(nx, ny, 6, _startX, _startY, _graphics, _arr);
            }
            else{

                tx = _x - Main.GUID_CURVE_WIDTH;

                ty = _y - Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[1])){

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y - (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 0, _startX, _startY, _graphics, _arr);
                }
                else{

                    tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    this.arrContains(tx, ty, _arr[2]);

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y + (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 3, _startX, _startY, _graphics, _arr);
                }
            }

            break;

            default:

            tx = _x + (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;

            ty = _y;

            if(this.arrContains(tx, ty, _arr[6])){

                _graphics.lineTo(tx, ty);

                let nx:number = _x + Main.GUID_WIDTH;

                let ny:number = _y;

                this.drawLine(nx, ny, 7, _startX, _startY, _graphics, _arr);
            }
            else{

                tx = _x + Main.GUID_CURVE_WIDTH;

                ty = _y - Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[3])){

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y - (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 2, _startX, _startY, _graphics, _arr);
                }
                else{

                    tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    this.arrContains(tx, ty, _arr[0]);

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y + (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 1, _startX, _startY, _graphics, _arr);
                }
            }

            break;
        }
    }

    private arrContains(_x:number, _y:number, _arr:number[][]):boolean{

        for(let i:number = 0, m:number = _arr.length ; i < m ; i++){

            let arr:number[] = _arr[i];

            if(arr[0] == _x && arr[1] == _y){

                _arr.splice(i, 1);

                return true;
            }
        }

        return false;
    }

    public async fade(_unit:MapUnit){

        let x:number = _unit.pos % Main.MAP_WIDTH;

        let y:number = Math.floor(_unit.pos / Main.MAP_WIDTH);

        this.anchorOffsetX = (x + 0.5) * Main.GUID_WIDTH;

        this.anchorOffsetY = (y + 0.5) * Main.GUID_HEIGHT;

        this.x = this.anchorOffsetX;

        this.y = this.anchorOffsetY;

        await SuperTween.getInstance().to(1, 0, 500, this.scaleChange.bind(this));

        this.anchorOffsetX = this.anchorOffsetY = this.x = this.y = 0;

        this.scaleX = 1;

        this.scaleY = 1;
    }

    private scaleChange(_v:number):void{

        this.scaleX = this.scaleY = _v;
    }

    public async fade2(_unit:MapUnit){

        let self:MapArea = this;

        let path:{[key:number]:number} = {};

        let length:number = self.findPath(_unit.pos, path);

        self.releaseMask();

        self.releaseGraphics();

        let arr:MapGridUnit[] = [];

        let baseGrid:MapGridUnit;

        for(let key in self.gridDic){

            let guid:MapGridUnit = self.gridDic[key];

            let color:number = self.unitArr[0].color;

            color = color % Main.MAP_COLOR.length;

            guid.showSp(color);

            if(guid.pos != _unit.pos){

                arr.push(guid);
            }
            else{

                baseGrid = guid;
            }
        }

        self.gridContainer.setChildIndex(baseGrid, -1);

        let cb:(_v:number)=>void = function(_v:number):void{

            for(let i:number = arr.length - 1 ; i > -1 ; i--){

                let guid:MapGridUnit = arr[i];

                let v:number = _v;

                let tmpPos:number = guid.pos;

                while(true){

                    if(tmpPos == _unit.pos){

                        guid.x = (tmpPos % Main.MAP_WIDTH) * Main.GUID_WIDTH;

                        guid.y = Math.floor(tmpPos / Main.MAP_WIDTH) * Main.GUID_HEIGHT;

                        arr.splice(i, 1);

                        baseGrid.setScore(baseGrid.score + guid.score);

                        self.releaseGrid(guid);

                        break;
                    }

                    let lastX:number = tmpPos % Main.MAP_WIDTH;

                    let lastY:number = Math.floor(tmpPos / Main.MAP_WIDTH);

                    tmpPos = path[tmpPos];

                    if(v <= 1){

                        let nowX:number = tmpPos % Main.MAP_WIDTH;

                        let nowY:number = Math.floor(tmpPos / Main.MAP_WIDTH);

                        guid.x = (lastX + (nowX - lastX) * v) * Main.GUID_WIDTH;

                        guid.y = (lastY + (nowY - lastY) * v) * Main.GUID_HEIGHT;

                        if(guid.x == (_unit.pos % Main.MAP_WIDTH) * Main.GUID_WIDTH && guid.y == Math.floor(_unit.pos / Main.MAP_WIDTH) * Main.GUID_HEIGHT){

                            arr.splice(i, 1);

                            baseGrid.setScore(baseGrid.score + guid.score);

                            self.releaseGrid(guid);
                        }

                        break;
                    }
                    else{

                        v--;
                    }
                }
            }
        };

        await SuperTween.getInstance().to(0, length, length * 300, cb.bind(this));
    }

    private findPath(_pos:number, _path:{[key:number]:number}):number{

        let arr:number[][] = [];

        arr[0] = [_pos];

        let dic:{[key:number]:number} = {};

        dic[_pos] = 0;

        let dicLength:number = 1;

        let searchDis:number = 0;

        while(dicLength < this.unitArr.length){

            let arr2:number[] = arr[searchDis];

            searchDis++;

            let arr3:number[] = [];

            arr[searchDis] = arr3;

            for(let i:number = 0, m:number = arr2.length ; i < m ; i++){

                let nowPos:number = arr2[i];

                let x:number = nowPos % Main.MAP_WIDTH;

                let y:number = Math.floor(nowPos / Main.MAP_WIDTH);

                if(x > 0){

                    let pos:number = nowPos - 1;

                    if(this.id & (1 << pos)){

                        if(dic[pos] === undefined){

                            dic[pos] = searchDis;

                            arr3.push(pos);

                            _path[pos] = nowPos;

                            dicLength++;
                        }
                    }
                }

                if(x < Main.MAP_WIDTH - 1){

                    let pos:number = nowPos + 1;

                    if(this.id & (1 << pos)){

                        if(dic[pos] === undefined){

                            dic[pos] = searchDis;

                            arr3.push(pos);

                            _path[pos] = nowPos;

                            dicLength++;
                        }
                    }
                }

                if(y > 0){

                    let pos:number = nowPos - Main.MAP_WIDTH;

                    if(this.id & (1 << pos)){

                        if(dic[pos] === undefined){

                            dic[pos] = searchDis;

                            arr3.push(pos);

                            _path[pos] = nowPos;

                            dicLength++;
                        }
                    }
                }

                if(y < Main.MAP_HEIGHT - 1){

                    let pos:number = nowPos + Main.MAP_WIDTH;

                    if(this.id & (1 << pos)){

                        if(dic[pos] === undefined){

                            dic[pos] = searchDis;

                            arr3.push(pos);

                            _path[pos] = nowPos;

                            dicLength++;
                        }
                    }
                }
            }
        }

        return searchDis;
    }
}