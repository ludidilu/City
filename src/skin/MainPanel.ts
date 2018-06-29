class MainPanel extends eui.Component implements  eui.UIComponent {

	public score:eui.Label;

	public times:eui.Label;

	public constructor() {
		
		super();

		this.skinName = "resource/eui_skins/MainPanel.exml";
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
	}
	
}