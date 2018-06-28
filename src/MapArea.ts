class MapArea extends egret.DisplayObjectContainer{

    private static tfPool:egret.TextField[] = [];

    private static maskSpPool:egret.Shape[] = [];

    public unitArr:MapUnit[];

    public id:number;

    private spContainer:egret.DisplayObjectContainer;

    private tfContainer:egret.DisplayObjectContainer;

    private sp:egret.Shape;

    private pointArr:number[][][] = [];

    private tfArr:egret.TextField[] = [];

    private maskArr:egret.Shape[] = [];

    public init():void{

        this.spContainer = new egret.DisplayObjectContainer();
        
        this.addChild(this.spContainer);

        this.tfContainer = new egret.DisplayObjectContainer();

        this.addChild(this.tfContainer);

        this.sp = new egret.Shape();

        this.spContainer.addChild(this.sp);

        for(let i:number = 0 ; i < 8 ; i++){

            this.pointArr[i] = [];
        }
    }

    public release():void{

        for(let i:number = 0, m:number = this.tfArr.length ; i < m ; i++){

            let tf:egret.TextField = this.tfArr[i];

            this.tfContainer.removeChild(tf);

            MapArea.tfPool.push(tf);
        }

        this.tfArr.length = 0;

        for(let i:number = 0, m:number = this.maskArr.length ; i < m ; i++){

            let sp:egret.Shape = this.maskArr[i];

            sp.graphics.clear();

            this.spContainer.removeChild(sp);

            MapArea.maskSpPool.push(sp);
        }

        this.maskArr.length = 0;

        this.sp.graphics.clear();
    }

    private static getTf(_container:egret.DisplayObjectContainer):egret.TextField{

        let tf:egret.TextField;

        if(this.tfPool.length > 0){

            tf = this.tfPool.pop();
        }
        else{

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
    }

    private static getMaskSp(_container:egret.DisplayObjectContainer):egret.Shape{

        let sp:egret.Shape;

        if(this.maskSpPool.length > 0){

            sp = this.maskSpPool.pop();
        }
        else{

            sp = new egret.Shape();
        }

        sp.graphics.lineStyle(5);

        _container.addChild(sp);

        return sp;
    }

    public setData(_unitArr:MapUnit[], _id, _checkCircle:boolean):boolean{

        this.unitArr = _unitArr;

        this.id = _id;

        let command:egret.Graphics = this.sp.graphics;

        let pointArr:number[][][] = this.pointArr;

        command.beginFill(Main.MAP_COLOR[this.unitArr[0].color % Main.MAP_COLOR.length]);

        command.lineStyle(5);

        for(let i:number = 0, m:number = this.unitArr.length; i < m ; i++){

            let unit:MapUnit = this.unitArr[i];

            unit.area = this;

            let pos:number = unit.pos;

            let x:number = pos % Main.MAP_WIDTH;

            let y:number = Math.floor(pos / Main.MAP_WIDTH);

            let tf:egret.TextField = MapArea.getTf(this.tfContainer);

            this.tfArr.push(tf);

            tf.x = x * Main.GUID_WIDTH;

            tf.y = y * Main.GUID_HEIGHT;

            tf.text = unit.score.toString();

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

        this.drawLine(sx, sy, 0, sx, sy, command, pointArr, true, true);

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

                    let sp:egret.Shape = MapArea.getMaskSp(this.spContainer);

                    this.maskArr.push(sp);

                    sp.blendMode = egret.BlendMode.ERASE;

                    sp.graphics.beginFill(0);

                    sx = arr[0][0];

                    sy = arr[0][1]; 

                    this.drawLine(sx, sy, 0, sx, sy, sp.graphics, pointArr, false, true);

                    sp = MapArea.getMaskSp(this.spContainer);

                    this.maskArr.push(sp);

                    sp.blendMode = egret.BlendMode.NORMAL;

                    sp.graphics.beginFill(0, 0);

                    this.drawLine(sx, sy, 0, sx, sy, sp.graphics, pointArr, true, true);
                }
            }

            if(!drawMask){

                break;
            }
        }

        return needSort;
    }

    private drawLine(_x:number, _y:number, _type:number, _startX:number, _startY:number, _graphics:egret.Graphics, _arr:number[][][], _splice:boolean, _first?:boolean):void{

        if(_first){

            _graphics.moveTo(_x, _y);
        }
        else{

            _graphics.lineTo(_x, _y);

            if(_x == _startX && _y == _startY){

                return;
            }
        }

        this.arrContains(_x, _y, _arr[_type], _splice);

        switch(_type){

            case 0:

            let tx:number = _x;

            let ty:number = _y - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;

            if(this.arrContains(tx, ty, _arr[1], _splice)){

                _graphics.lineTo(tx, ty);

                let nx:number = _x;

                let ny:number = _y - Main.GUID_HEIGHT;

                this.drawLine(nx, ny, 0, _startX, _startY, _graphics, _arr, _splice);
            }
            else{

                tx = _x + Main.GUID_CURVE_WIDTH;

                ty = _y - Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[4], _splice)){

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 5, _startX, _startY, _graphics, _arr, _splice);
                }
                else{

                    tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    if(_splice){

                        this.arrContains(tx, ty, _arr[7], _splice);
                    }

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x - (Main.GUID_WIDTH - Main.GUID_CURVE_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 6, _startX, _startY, _graphics, _arr, _splice);
                }
            }

            break;

            case 1:

            tx = _x;

            ty = _y + (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;

            if(this.arrContains(tx, ty, _arr[0], _splice)){

                _graphics.lineTo(tx, ty);

                let nx:number = _x;

                let ny:number = _y + Main.GUID_HEIGHT;

                this.drawLine(nx, ny, 1, _startX, _startY, _graphics, _arr, _splice);
            }
            else{

                tx = _x + Main.GUID_CURVE_WIDTH;

                ty = _y + Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[6], _splice)){

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 7, _startX, _startY, _graphics, _arr, _splice);
                }
                else{

                    tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    if(_splice){

                        this.arrContains(tx, ty, _arr[5], _splice);
                    }

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x - (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 4, _startX, _startY, _graphics, _arr, _splice);
                }
            }

            break;

            case 2:

            tx = _x;

            ty = _y - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;

            if(this.arrContains(tx, ty, _arr[3], _splice)){

                _graphics.lineTo(tx, ty);

                let nx:number = _x;

                let ny:number = _y - Main.GUID_HEIGHT;

                this.drawLine(nx, ny, 2, _startX, _startY, _graphics, _arr, _splice);
            }
            else{

                tx = _x - Main.GUID_CURVE_WIDTH;

                ty = _y - Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[5], _splice)){

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x - (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 4, _startX, _startY, _graphics, _arr, _splice);
                }
                else{

                    tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    if(_splice){

                        this.arrContains(tx, ty, _arr[6], _splice);
                    }

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 7, _startX, _startY, _graphics, _arr, _splice);
                }
            }

            break;

            case 3:

            tx = _x;

            ty = _y + (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2;

            if(this.arrContains(tx, ty, _arr[2], _splice)){

                _graphics.lineTo(tx, ty);

                let nx:number = _x;

                let ny:number = _y + Main.GUID_HEIGHT;

                this.drawLine(nx, ny, 3, _startX, _startY, _graphics, _arr, _splice);
            }
            else{

                tx = _x - Main.GUID_CURVE_WIDTH;

                ty = _y + Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[7], _splice)){

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x - (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2 - Main.GUID_CURVE_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 6, _startX, _startY, _graphics, _arr, _splice);
                }
                else{

                    tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    if(_splice){

                        this.arrContains(tx, ty, _arr[4], _splice);
                    }

                    let cx:number = _x;

                    let cy:number = ty;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = _x + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH);

                    let ny:number = ty;

                    this.drawLine(nx, ny, 5, _startX, _startY, _graphics, _arr, _splice);
                }
            }

            break;

            case 4:

            tx = _x - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;

            ty = _y;

            if(this.arrContains(tx, ty, _arr[5], _splice)){

                _graphics.lineTo(tx, ty);

                let nx:number = _x - Main.GUID_WIDTH;

                let ny:number = _y;

                this.drawLine(nx, ny, 4, _startX, _startY, _graphics, _arr, _splice);
            }
            else{

                tx = _x - Main.GUID_CURVE_WIDTH;

                ty = _y + Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[0], _splice)){

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y + (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 1, _startX, _startY, _graphics, _arr, _splice);
                }
                else{

                    tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    if(_splice){

                        this.arrContains(tx, ty, _arr[3], _splice)
                    }

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y - (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 2, _startX, _startY, _graphics, _arr, _splice);
                }
            }

            break;

            case 5:

            tx = _x + (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;

            ty = _y;

            if(this.arrContains(tx, ty, _arr[4], _splice)){

                _graphics.lineTo(tx, ty);

                let nx:number = _x + Main.GUID_WIDTH;

                let ny:number = _y;

                this.drawLine(nx, ny, 5, _startX, _startY, _graphics, _arr, _splice);
            }
            else{

                tx = _x + Main.GUID_CURVE_WIDTH;

                ty = _y + Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[2], _splice)){

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y + (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 3, _startX, _startY, _graphics, _arr, _splice);
                }
                else{

                    tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y - (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    if(_splice){

                        this.arrContains(tx, ty, _arr[1], _splice);
                    }

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y - (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 0, _startX, _startY, _graphics, _arr, _splice);
                }
            }

            break;

            case 6:

            tx = _x - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;

            ty = _y;

            if(this.arrContains(tx, ty, _arr[7], _splice)){

                _graphics.lineTo(tx, ty);

                let nx:number = _x - Main.GUID_WIDTH;

                let ny:number = _y;

                this.drawLine(nx, ny, 6, _startX, _startY, _graphics, _arr, _splice);
            }
            else{

                tx = _x - Main.GUID_CURVE_WIDTH;

                ty = _y - Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[1], _splice)){

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y - (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 0, _startX, _startY, _graphics, _arr, _splice);
                }
                else{

                    tx = _x - (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    if(_splice){

                        this.arrContains(tx, ty, _arr[2], _splice);
                    }

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y + (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 3, _startX, _startY, _graphics, _arr, _splice);
                }
            }

            break;

            default:

            tx = _x + (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2;

            ty = _y;

            if(this.arrContains(tx, ty, _arr[6], _splice)){

                _graphics.lineTo(tx, ty);

                let nx:number = _x + Main.GUID_WIDTH;

                let ny:number = _y;

                this.drawLine(nx, ny, 7, _startX, _startY, _graphics, _arr, _splice);
            }
            else{

                tx = _x + Main.GUID_CURVE_WIDTH;

                ty = _y - Main.GUID_CURVE_HEIGHT;

                if(this.arrContains(tx, ty, _arr[3], _splice)){

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y - (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2 - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 2, _startX, _startY, _graphics, _arr, _splice);
                }
                else{

                    tx = _x + (Main.GUID_CUT_WIDTH * 2 + Main.GUID_CURVE_WIDTH);

                    ty = _y + (Main.GUID_CUT_HEIGHT * 2 + Main.GUID_CURVE_HEIGHT);

                    if(_splice){

                        this.arrContains(tx, ty, _arr[0], _splice);
                    }

                    let cx:number = tx;

                    let cy:number = _y;

                    _graphics.curveTo(cx, cy, tx, ty);

                    let nx:number = tx;

                    let ny:number = _y + (Main.GUID_HEIGHT - Main.GUID_CURVE_HEIGHT);

                    this.drawLine(nx, ny, 1, _startX, _startY, _graphics, _arr, _splice);
                }
            }

            break;
        }
    }

    private arrContains(_x:number, _y:number, _arr:number[][], _splice:boolean):boolean{

        for(let i:number = 0, m:number = _arr.length ; i < m ; i++){

            let arr:number[] = _arr[i];

            if(arr[0] == _x && arr[1] == _y){

                if(_splice){

                    _arr.splice(i, 1);
                }

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

        // let scaleX:number = Main.GUID_WIDTH / this.width;

        // let scaleY:number = Main.GUID_HEIGHT / this.height;

        // let fun:(_v:number)=>void = function(_v:number):void{

        //     this.scaleX = 1 + (scaleX - 1) * _v;

        //     this.scaleY = 1 + (scaleY - 1) * _v;
        // };

        await SuperTween.getInstance().to(1, 0, 500, this.scaleChange.bind(this));

        this.anchorOffsetX = this.anchorOffsetY = this.x = this.y = 0;

        this.scaleX = 1;

        this.scaleY = 1;
    }

    private scaleChange(_v:number):void{

        this.scaleX = this.scaleY = _v;
    }
}