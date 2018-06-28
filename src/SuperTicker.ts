class SuperTicker{

    private static instance:SuperTicker;

    public static getInstance():SuperTicker{

        if(!SuperTicker.instance){

            SuperTicker.instance = new SuperTicker();

            SuperTicker.instance.init();
        }

        return SuperTicker.instance;
    }

    private eventList:((dt:number)=>void)[] = [];

    private eventTargetList:any[] = [];

    private tmpList:((dt:number)=>void)[] = [];

    private lastTime:number ;

    private isPause:boolean = false;

    private init():void{

        egret.startTick(this.tickUpdate, this);
    }

    public pause():void{

        this.isPause = true;
    }

    public resume():void{

        this.isPause = false;
    }

    public hasEventListener(_fun:(dt:number)=>void,_target:any):boolean{

        let index:number = this.eventList.indexOf(_fun);

        if(index != -1){

            if(this.eventTargetList[index] == _target){

                return true;
            }
        }

        return false;
    }

    public addEventListener(_fun:(dt:number)=>void, _target:any):void{

        this.eventList.push(_fun);

        this.eventTargetList.push(_target);
    }

    public removeEventListener(_fun:(dt:number)=>void, _target:any):void{

        let index:number = this.eventList.indexOf(_fun);

        if(index != -1){

            if(this.eventTargetList[index] == _target){

                this.eventList.splice(index, 1);

                this.eventTargetList.splice(index, 1);
            }
        }
    }

    private tickUpdate(_time:number):boolean{

        if(this.lastTime && !this.isPause && this.eventList.length > 0){

            let dt:number = _time - this.lastTime;

            for(let i:number = 0, m:number = this.eventList.length ; i < m ; i++){

                this.tmpList.push(this.eventList[i]);
            }

            for(let i:number = 0, m:number = this.tmpList.length ; i < m ; i++){

                let fun:(dt:number)=>void = this.tmpList[i];

                let index:number = this.eventList.indexOf(fun);

                if(index != -1){

                    fun.bind(this.eventTargetList[index])(dt);
                }
            }

            this.tmpList.length = 0;
        }

        this.lastTime = _time;

        return false;
    }
}