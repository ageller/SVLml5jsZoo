//load the model
function initializeML(numClasses=2, interval=10){
	var check = setInterval(function(){
		if (typeof ml5.featureExtractor != "undefined") {
			clearInterval(check);
			// Extract the already learned features from MobileNet (eventually we want to only use our own training set)
			params.featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
			params.featureExtractor.numClasses = numClasses;
			// Initialize the Image Classifier method with MobileNet and the video as the second argument
			params.classifier = params.featureExtractor.classification();
			params.classifier.numClasses = numClasses;

		}
	}, interval);

}
function modelReady(){
	console.log('Base Model (MobileNet) Loaded!');
	params.modelReady = true;
}

//train
function trainOnImages(imgList, index, id, interval=10){
	var check = setInterval(function(){ //wait until the model is ready
		if (params.modelReady) {
			clearInterval(check);
			var dImage = imgList[index]
			if (dImage != null){
				console.log(dImage, id)
				//https://github.com/ml5js/ml5-examples/issues/59
				var img = new Image(); //NOTE: currently p5 images don't work in classifier
				img.src = 'data/'+dImage.image;
				var imgCheck = setInterval(function(){ //wait until the image is loaded
					if (img.complete) {
						clearInterval(imgCheck)
						// the secret is that addImage is async
						params.classifier.addImage(img, id, function(){ //wait until the image is added
							console.log(dImage.image, img, id);
							img = null;
							if (index+1 < imgList.length){
								trainOnImages(imgList, index+1, id)
							} else {
								params.doneTraining += 1;
							}
						});
					}
				}, interval);


			};
		}
	},interval);
}
function trainModel(){
	params.doneTraining = 0;
	console.log('adding images...')
	console.log('spiral images', params.spiralImages)
	console.log('smooth images', params.smoothImages)
	trainOnImages(params.spiralImages, 0, 'spiral')
	var check = setInterval(function(){ //wait until the first images are added is ready
		if (params.doneTraining == 1){
			clearInterval(check);
			trainOnImages(params.smoothImages, 0, 'smooth')
			var check2 = setInterval(function(){ //wait until the first images are added is ready
				if (params.doneTraining == 2){
					clearInterval(check2);
					console.log('all images added.')
					console.log('training...')
					params.classifier.train(whileTraining);
				}
			},10);
		}
	},10);

}
function whileTraining(lossValue) {
	console.log("loss",lossValue)
	if (lossValue) {
		params.loss = lossValue;
	} else {
		params.doneTraining += 1;
		console.log('done training.');
	}
}

//classify
function classify(d) {
	console.log('classifying', d.image)
	var img = new Image(); //NOTE: currently p5 images don't work in classifier
	img.src = 'data/'+d.image;
	var imgCheck = setInterval(function(){ //wait until the image is loaded
		if (img.complete) {
			clearInterval(imgCheck)
			console.log('img loaded...')
			params.classifier.classify(img, function(err, results){
				gotResults(d, err, results)
			});
		}
	},10);
}

// Show the results
//will improve this with color map
function gotResults(d, err, results) {
	var spiral = 10*d['t04_spiral_a08_spiral_debiased'];
	var smooth = 10*d['t01_smooth_or_features_a01_smooth_debiased'];
	if (results && results[0]) {
		console.log("img, err, results[0]", d.image, spiral, smooth, err, results[0], results)
		var cColor = params.unknownColor;
		if (results[0].label == "spiral"){
			cColor = params.spiralColorMap(results[0].confidence);
		}
		if (results[0].label == "smooth"){
			cColor = params.smoothColorMap(results[0].confidence);
		}
		d3.select('#'+getImageID(d)).style('border-color',cColor)
	}

}

//run everything once
function runModel(){
	params.modelReady = false;
	params.modelBusy = true;
	params.doneTraining = 0;
	initializeML();
	var check = setInterval(function(){ //wait until the model is ready
		if (params.modelReady) {
			clearInterval(check);
			trainModel();
			var check2 = setInterval(function(){ //wait training is finished
				if (params.doneTraining == 3){
					clearInterval(check2);
					params.objDataShown.forEach(function(d, i){
						classify(d);
						console.log(i, params.objDataShown.length)
						if (i >= params.objDataShown.length){
							params.modelBusy = false;
							params.modelUpdateNeeded = false;
						}
					})
				}
			},10);
		}
	},10);
}