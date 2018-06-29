class AlertPanel extends eui.Component implements  eui.UIComponent {

	public msg:eui.Label;

	public oneBt:eui.Group;

	public twoBt:eui.Group;

	public btOne:eui.Button;

	public btYes:eui.Button;

	public btNo:eui.Button;

	private oneCb:()=>void;

	private twoCb:(_b:boolean)=>void;

	public constructor() {
		super();

		this.skinName = "resource/eui_skins/AlertPanel.exml";
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();

		this.btOne.addEventListener(egret.TouchEvent.TOUCH_TAP, this.btOneClick, this);

		this.btYes.addEventListener(egret.TouchEvent.TOUCH_TAP, this.btYesClick, this);

		this.btNo.addEventListener(egret.TouchEvent.TOUCH_TAP, this.btNoClick, this);

		this.visible = false;
	}

	private btOneClick(e:egret.TouchEvent):void{

		this.visible = false;

		this.oneCb();
	}

	private btYesClick(e:egret.TouchEvent):void{

		this.visible = false;

		this.twoCb(true);
	}

	private btNoClick(e:egret.TouchEvent):void{

		this.visible = false;

		this.twoCb(false);
	}
	
	public async showOne(_msg:string){

		let self:AlertPanel = this;

		self.visible = true;

		self.oneBt.visible = true;

		self.twoBt.visible = false;

		self.msg.text = _msg;

		let fun:(resolve:()=>void)=>void = function(resolve:()=>void):void{

			self.oneCb = resolve;
		};

		return new Promise(fun);
	}

	public async showTwo(_msg:string){

		let self:AlertPanel = this;

		self.visible = true;

		self.oneBt.visible = false;

		self.twoBt.visible = true;

		self.msg.text = _msg;

		let fun:(resolve:(_b:boolean)=>void)=>void = function(resolve:(_b:boolean)=>void):void{

			self.twoCb = resolve;
		};

		return new Promise(fun);
	}
}