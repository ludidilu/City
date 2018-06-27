class MapArea extends egret.DisplayObjectContainer{

    public v:number;

    public color:number;

    private sp:egret.Shape = new egret.Shape();

    private pointArr:number[][][] = [];

    public init():void{

        this.addChild(this.sp);

        for(let i:number = 0 ; i < 8 ; i++){

            this.pointArr[i] = [];
        }
    }

    public setData(_v:number, _color:number):void{

        this.v = _v;

        this.color = _color;

        for(let i:number = 0 ; i < 8 ; i++){

            this.pointArr[i].length = 0;
        }

        let command:egret.Graphics = this.sp.graphics;

        let pointArr:number[][][] = this.pointArr;

        command.clear();

        command.beginFill(this.color);

        command.lineStyle(5);

        for(let i:number = 0, m:number = Main.MAP_WIDTH * Main.MAP_HEIGHT; i < m ; i++){

            let b:number = this.v & (1 << i);
            
            if(b){

                let x:number = i % Main.MAP_WIDTH;

                let y:number = Math.floor(i / Main.MAP_WIDTH);

                if(x == 0 || !(this.v & (1 << (i - 1)))){

                    let sx:number = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH;

                    let sy:number = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT;

                    command.moveTo(sx, sy);

                    pointArr[0].push([sx, sy]);

                    let tx:number = sx;

                    let ty:number = sy + (Main.GUID_HEIGHT - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2);

                    pointArr[1].push([tx, ty]);
                }

                if(x == Main.MAP_WIDTH - 1 || !(this.v & (1 << i + 1))){

                    let sx:number = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH + (Main.GUID_WIDTH - Main.GUID_CUT_WIDTH * 2);

                    let sy:number = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT;

                    command.moveTo(sx, sy);

                    pointArr[2].push([sx, sy]);

                    let tx:number = sx;

                    let ty:number = sy + (Main.GUID_HEIGHT - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2);

                    pointArr[3].push([tx, ty]);
                }

                if(y == 0 || (!(this.v & (1 << (i - Main.MAP_WIDTH))))){

                    let sx:number = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH;

                    let sy:number = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT;

                    command.moveTo(sx, sy);

                    pointArr[4].push([sx, sy]);

                    let tx:number = sx + (Main.GUID_WIDTH - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2);

                    let ty:number = sy;

                    pointArr[5].push([tx, ty]);
                }

                if(y == Main.MAP_HEIGHT - 1 || !(this.v & (1 << (i + Main.MAP_WIDTH)))){

                    let sx:number = x * Main.GUID_WIDTH + Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH;

                    let sy:number = y * Main.GUID_HEIGHT + Main.GUID_CUT_HEIGHT + (Main.GUID_HEIGHT - Main.GUID_CUT_HEIGHT * 2);

                    command.moveTo(sx, sy);

                    pointArr[6].push([sx, sy]);

                    let tx:number = sx + (Main.GUID_WIDTH - (Main.GUID_CUT_WIDTH + Main.GUID_CURVE_WIDTH) * 2);

                    let ty:number = sy;

                    pointArr[7].push([tx, ty]);
                }
            }
        }

        let sx:number = pointArr[0][0][0];

        let sy:number = pointArr[0][0][1];

        let lx:number = sx;

        let ly:number = sy + (Main.GUID_HEIGHT - (Main.GUID_CUT_HEIGHT + Main.GUID_CURVE_HEIGHT) * 2);

        command.moveTo(lx, ly);

        this.drawLine(sx, sy, 0, sx, sy, command, pointArr, true);
    }

    private drawLine(_x:number, _y:number, _type:number, _startX:number, _startY:number, _graphics:egret.Graphics, _arr:number[][][], _first?:boolean):void{

        _graphics.lineTo(_x, _y);

        if(!_first && _x == _startX && _y == _startY){

            return;
        }

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

                return true;
            }
        }

        return false;
    }
}