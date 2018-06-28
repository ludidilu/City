class Test extends eui.Component implements  eui.UIComponent {
	public constructor() {
		super();

		this.skinName = "resource/eui_skins/Test.exml";
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
}