
let viewerParams;
let MLParams;
let socketParams;

function defineViewerParams(){
	viewerParams = new function() {

		//data 
		this.objData=null;
		this.objDataShown=[]; //<--shared with MLParams

		//will contain the users classifications 
		this.spiralImages=[]; //<--shared with MLParams
		this.smoothImages=[]; //<--shared with MLParams

		this.windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		this.windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

		this.fieldDiv;

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
		this.buttonMargin = 2;// pixels (currently only used for top and bottom)

		//for moving images
		this.imageInertiaN = 1000; //reference time in ms for inertia
		this.imageInertia = 10;//

		this.bucketSuction = 0.0; //percent of screen width to suck in a galaxy to either side

		//colors
		this.unknownColor = 'black'//getComputedStyle(document.documentElement).getPropertyValue('--background-color');
		this.smoothColor = d3.rgb(220,20,60);
		this.spiralColor = d3.rgb(51,153,255);

		//check if we're using web sockets
		this.usingSocket = true;

		//check for agreement with Zooniverse volunteers
		this.nSmooth = 0.;
		this.sSpiral = 0.;
		this.nSmoothAgree = 0.;
		this.sSpiralAgree = 0.;

		//check if the mouse is down or if touch is active 
		this.mouseDown = false;

		this.activeImg = [];
	}
}


function defineMLParams(){
	MLParams = new function() {

		//data 
		this.objDataShown=[]; //<--shared with viewerParams

		//will contain the users classifications 
		this.spiralImages=[]; //<--shared with viewerParams
		this.smoothImages=[]; //<--shared with viewerParams


		//ml5
		this.featureExtractor = null;
		this.classifier = null;
		this.modelReady = false;
		this.modelBusy = false;
		this.modelUpdateNeeded = true;
		this.doneTraining = 0;
		this.nClassified = 0;
		this.modelCheckInterval = 1000; //ms between checks of finished model

		//check if we're using web sockets
		this.usingSocket = true;

	}
}



function defineSocketParams(){
	socketParams = new function() {

		//flask + socketio
		// Use a "/test" namespace.
		// An application can open a connection on multiple namespaces, and
		// Socket.IO will multiplex all those connections on a single
		// physical channel. If you don't care about multiple channels, you
		// can set the namespace to an empty string.
		this.namespace = '/test';
		// Connect to the Socket.IO server.
		// The connection URL has the following format:
		//     http[s]://<domain>:<port>[/<namespace>]
		this.socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + this.namespace);

	}
}

