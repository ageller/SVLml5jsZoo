let params;
function defineParams(){
	params = new function() {
		this.objData=null;
		this.objDataShown=[];
		this.objIndex = 0;
		this.useIndex = 0;
		this.randomIndices = [];
		this.colorMap;
		this.tTrans = d3.transition().duration(1000);

		this.bucketWidth = 100; //width of the divs for spiral and round
		this.nImageHeight = 10; //number of images to fit in height of window
		this.imageBorderWidth = 4;
		this.imageInertiaN = 1000; //reference time in ms for inertia
		this.imageInertia = 10;//
	}
}
defineParams();