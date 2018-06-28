class SuperTweenUnit{

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

    private list:SuperTweenUnit[] = [];    

    private init():void{

        SuperTicker.getInstance().addEventListener(this.update, this);
    }

    private update(_dt:number):void{

        let arr:SuperTweenUnit[] = [];

        for(let i:number = 0, m:number = this.list.length ; i < m ; i++){

            arr.push(this.list[i]);
        }

        for(let i:number = 0, m:number = arr.length ; i < m ; i++){

            let unit:SuperTweenUnit = arr[i];

            unit.timeLong -= _dt;

            if(unit.timeLong <= 0){

                this.list.splice(this.list.indexOf(unit), 1);

                if(unit.cb){

                    unit.cb(unit.end);
                }

                unit.endCb();
            }
            else{

                if(unit.cb){

                    let v:number = unit.start + (unit.end - unit.start) * (unit.time - unit.timeLong) / unit.time;

                    unit.cb(v);
                }
            }
        }
    }

    public async to(_start:number, _end:number, _time:number, _cb:(_v:number)=>void){

        let unit:SuperTweenUnit = {start:_start, end:_end, time:_time, timeLong:_time, cb:_cb};

        this.list.push(unit);

        let fun:(resolve:()=>void)=>void = function(resolve:()=>void):void{

            unit.endCb = resolve;
        };

        return new Promise(fun);
    }
}