let params;
function defineParams(){
	params = new function() {
		this.objData=null;
		this.objIndex = 0;
		this.useIndex = 0;
		this.randomIndices = [];
		this.colorMap;
		this.tDur = 1000;
	}
}
defineParams();