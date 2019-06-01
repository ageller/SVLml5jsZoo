//load the model
function initializeML(numClasses=2, interval=10){
	var check = setInterval(function(){
		if (typeof ml5.featureExtractor != "undefined") {
			clearInterval(check);
			// Extract the already learned features from MobileNet (eventually we want to only use our own training set)
			MLParams.featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
			MLParams.featureExtractor.numClasses = numClasses;
			// Initialize the Image Classifier method with MobileNet and the video as the second argument
			MLParams.classifier = MLParams.featureExtractor.classification();
			MLParams.classifier.numClasses = numClasses;

		}
	}, interval);

}
function modelReady(){
	console.log('Base Model (MobileNet) Loaded!');
	MLParams.modelReady = true;
}

//train
function trainOnImages(imgList, index, id, interval=10){
	var check = setInterval(function(){ //wait until the model is ready
		if (MLParams.modelReady) {
			clearInterval(check);
			var dImage = imgList[index]
			if (dImage != null){
				console.log(dImage, id)
				//https://github.com/ml5js/ml5-examples/issues/59
				var img = new Image(); //NOTE: currently p5 images don't work in classifier
				img.src = '/static/data/'+dImage.image;
				var imgCheck = setInterval(function(){ //wait until the image is loaded
					if (img.complete) {
						clearInterval(imgCheck)
						// the secret is that addImage is async
						MLParams.classifier.addImage(img, id, function(){ //wait until the image is added
							console.log(dImage.image, img, id);
							img = null;
							if (index+1 < imgList.length){
								trainOnImages(imgList, index+1, id)
							} else {
								MLParams.doneTraining += 1;
							}
						});
					}
				}, interval);


			};
		}
	},interval);
}
function trainModel(){
	MLParams.doneTraining = 0;
	console.log('adding images...')
	console.log('spiral images', MLParams.spiralImages)
	console.log('smooth images', MLParams.smoothImages)
	trainOnImages(MLParams.spiralImages, 0, 'spiral')
	var check = setInterval(function(){ //wait until the first images are added is ready
		if (MLParams.doneTraining == 1){
			clearInterval(check);
			trainOnImages(MLParams.smoothImages, 0, 'smooth')
			var check2 = setInterval(function(){ //wait until the first images are added is ready
				if (MLParams.doneTraining == 2){
					clearInterval(check2);
					console.log('all images added.')
					console.log('training...')
					MLParams.classifier.train(whileTraining);
				}
			},10);
		}
	},10);

}
function whileTraining(lossValue) {
	console.log("loss",lossValue)
	if (lossValue) {
		MLParams.loss = lossValue;
	} else {
		MLParams.doneTraining += 1;
		console.log('done training.');
	}
}

//classify
function classify(d) {
	console.log('classifying', d.image)
	var img = new Image(); //NOTE: currently p5 images don't work in classifier
	img.src = '/static/data/'+d.image;
	var imgCheck = setInterval(function(){ //wait until the image is loaded
		if (img.complete) {
			clearInterval(imgCheck)
			MLParams.classifier.classify(img, function(err, results){
				//save the results

				if (results && results[0]) {
					d.results0 = results[0];
				}
				MLParams.nClassified += 1;
			});
		}
	},10);
}

//run everything once
function runModel(){
	MLParams.modelReady = false;
	MLParams.modelBusy = true;
	MLParams.doneTraining = 0;
	MLParams.nClassified = 0;
	initializeML();
	var check = setInterval(function(){ //wait until the model is ready
		if (MLParams.modelReady) {
			clearInterval(check);
			trainModel();
			var check2 = setInterval(function(){ //wait training is finished
				if (MLParams.doneTraining == 3){
					clearInterval(check2);
					MLParams.objDataShown.forEach(function(d, i){
						classify(d);
					})
				}
			},10);
		}
	},10);

	var checkML = setInterval(function(){
		//console.log(MLParams.nClassified, MLParams.objDataShown.length);
		if (MLParams.nClassified >= MLParams.objDataShown.length){
			clearInterval(checkML);
			MLParams.modelBusy = false;
			MLParams.modelUpdateNeeded = false;
			console.log("done.")
			sendToViewer();
		}
	}, 10);
}

///////////////////////////
// socketio
///////////////////////////
function setMLParams(vars){
	var keys = Object.keys(vars);
	//var keys = ['objDataShown', 'spiralImages', 'smoothImages']
	keys.forEach(function(k, i){
		MLParams[k] = vars[k]
		if (i == keys.length-1){
			//run the ML model
			runModel();
		}
	});
	console.log('have params for ML', MLParams)


}

function sendToViewer(){
	var viewer_input = {'objDataShown':MLParams.objDataShown}
	if (MLParams.usingSocket){
		socketParams.socket.emit('viewer_input',viewer_input);
	} else {
		setViewerParams(viewer_input);
	}

}

//https://blog.miguelgrinberg.com/post/easy-websockets-with-flask-and-gevent
//https://github.com/miguelgrinberg/Flask-SocketIO
function connectSocket(){
	//$(document).ready(function() {
	document.addEventListener("DOMContentLoaded", function(event) { 
		// Event handler for new connections.
		// The callback function is invoked when a connection with the
		// server is established.
		socketParams.socket.on('connect', function() {
			socketParams.socket.emit('connection_test', {data: 'I\'m connected!'});
		});
		socketParams.socket.on('connection_response', function(msg) {
			console.log(msg);
		});
		// Event handler for server sent data.
		// The callback function is invoked whenever the server emits data
		// to the client. The data is then displayed in the "Received"
		// section of the page.
		//updates from viewer
		socketParams.socket.on('update_MLParams', function(msg) {
			setMLParams(msg); //this also runs the model
		});

	});
}