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

    public static readonly GUID_COLOR_NUM:number = 4;

    public static readonly MAP_WIDTH:number = 5;

    public static readonly MAP_HEIGHT:number = 5;

    private map:number[] = [];

    public constructor() {

        super();

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event):void{
        
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

        for(let i:number = 0, m:number = Main.MAP_WIDTH * Main.MAP_HEIGHT; i < m ; i++){

            this.map[i] = 0;
        }
        
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.test, this);
    }

    private test():void{

        let mm:MapArea = new MapArea();

        mm.init();

        let arr:number[] = [0,1,5,6,7,12,13,14,9,16,17];

        mm.setData(this.arrToNumber(arr), 0xff0000);

        this.addChild(mm);

        mm.x = 20;

        mm.y = 20;

        mm = new MapArea();

        mm.init();

        arr = [2,3,4,8];

        mm.setData(this.arrToNumber(arr), 0x00ff00);

        this.addChild(mm);

        mm.x = 20;

        mm.y = 20;
    }

    private arrToNumber(_arr:number[]):number{

        let r:number = 0;

        for(let i:number = 0, m:number = _arr.length ; i < m ; i++){

            r = r | (1 << _arr[i]);
        }

        return r;
    }

    private draw():void{

        
    }
}