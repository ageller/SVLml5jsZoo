let params;
function defineParams(){
	params = new function() {
		this.objData=null;
		this.objDataShown=[];

		this.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		this.windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

		//will contain the users classifications
		this.spiralImages=[];
		this.smoothImages=[];

		this.objIndex = 0;
		this.useIndex = 0;
		this.colorMap;

		this.bucketWidth = 150; //width of the divs for spiral and round
		this.nImageHeight = 10; //number of images to fit in height of window
		this.imageBorderWidth = 4;
		this.imageSepFac = 2.5 ;//2 would be right next to eachother
		this.imageSize; //will be set in code
		this.imageGrow = 5.5;
		this.imageGrowSize;
		this.imageGridLeft;
		this.imageGridWidth;
		
		this.buttonHeight = 50;// pixels
		this.buttonMargin = 2;// pixels

		//for moving images
		this.imageInertiaN = 1000; //reference time in ms for inertia
		this.imageInertia = 10;//

		this.bucketSuction = 0.0; //percent of screen width to suck in a galaxy to either side

		//ml5
		this.featureExtractor = null;
		this.classifier = null;
		this.modelReady = false;
		this.modelBusy = false;
		this.modelUpdateNeeded = true;
		this.doneTraining = 0;
		this.modelCheckInterval = 1000; //ms between checks of finished model
		//improve this
		this.unknownColor = 'black'//getComputedStyle(document.documentElement).getPropertyValue('--background-color');
		this.smoothColor = d3.rgb(220,20,60);
		this.spiralColor = d3.rgb(51,153,255);
	}
}
defineParams();