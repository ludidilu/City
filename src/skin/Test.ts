class Test extends eui.Component implements  eui.UIComponent {

	public constructor() {
		
		super();

		this.skinName = "resource/eui_skins/Test.exml";

		this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
	}

	private onAddToStage(event: egret.Event):void{

		this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

		this.width = this.stage.stageWidth;

		this.height = this.stage.stageHeight;

		this.touchEnabled = false;
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
	}
	
	public bt:eui.Button;

	public bt1:eui.Button;
}