class SuperTweenUnit{

    public index:number;

    public start:number;

    public end:number;

    public time:number;

    public timeLong:number;

    public cb:(_v:number)=>void;

    public endCb?:()=>void;
}

class SuperTween{

    private static instance:SuperTween;

    public static getInstance():SuperTween{

        if(!SuperTween.instance){

            SuperTween.instance = new SuperTween();

            SuperTween.instance.init();
        }

        return SuperTween.instance;
    }

    private index:number = 0;

    private dic:{[key:number]:SuperTweenUnit} = {};

    private tmpList:SuperTweenUnit[] = [];

    private init():void{

        SuperTicker.getInstance().addEventListener(this.update, this);
    }

    private getIndex():number{

        this.index++;

        return this.index;
    }

    private update(_dt:number):void{

        for(let key in this.dic){

            this.tmpList.push(this.dic[key]);
        }

        for(let i:number = 0, m:number = this.tmpList.length ; i < m ; i++){

            let unit:SuperTweenUnit = this.tmpList[i];

            if(this.dic[unit.index]){

                unit.timeLong -= _dt;

                if(unit.timeLong <= 0){

                    delete this.dic[unit.index];

                    if(unit.cb){

                        unit.cb(unit.end);
                    }

                    if(unit.endCb){

                        unit.endCb();
                    }
                }
                else{

                    if(unit.cb){

                        let v:number = unit.start + (unit.end - unit.start) * (unit.time - unit.timeLong) / unit.time;

                        unit.cb(v);
                    }
                }
            }
        }

        this.tmpList.length = 0;
    }

    public async to(_start:number, _end:number, _time:number, _cb:(_v:number)=>void){

        let index:number = this.getIndex();

        let unit:SuperTweenUnit = {index:index, start:_start, end:_end, time:_time, timeLong:_time, cb:_cb};

        this.dic[index] = unit;

        let fun:(resolve:()=>void)=>void = function(resolve:()=>void):void{

            unit.endCb = resolve;
        };

        return new Promise(fun);
    }

     public to2(_start:number, _end:number, _time:number, _cb:(_v:number)=>void, _endCb:()=>void):number{

        let index:number = this.getIndex();

        let unit:SuperTweenUnit = {index:index, start:_start, end:_end, time:_time, timeLong:_time, cb:_cb, endCb:_endCb};

        this.dic[index] = unit;

        return index;
    }

    public remove(_index:number):void{

        if(this.dic[_index]){

            delete this.dic[_index];
        }
    }
}