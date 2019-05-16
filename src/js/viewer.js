//the text for the budgets
function formatBucketText(){
	d3.select('body').append('div')
		.attr('id','spiralText')
		.text('Spiral')
		.style('font-size',params.bucketWidth*0.75 + 'px')
		.style('position', 'absolute')
		.style('color',params.spiralColor)
		.style('transform','rotate(90deg)')
		.style('margin','20px')

	var w = parseFloat(d3.select('#spiralText').node().getBoundingClientRect().width);
	d3.select('#spiralText')
		.style('left',-w/2. -20+ 'px')  //why is this 20 and I use 10 below
		.style('line-height',params.windowHeight + 'px')
		.style('text-align','center')

	d3.select('body').append('div')
		.attr('id','smoothText')
		.text('Smooth')
		.style('font-size',params.bucketWidth*0.75 + 'px')
		.style('position', 'absolute')
		.style('color',params.smoothColor)
		.style('transform','rotate(-90deg)')
		.style('margin','20px')

	var w = parseFloat(d3.select('#smoothText').node().getBoundingClientRect().width);
	d3.select('#smoothText')
		.style('left',params.windowWidth - 2.*w - 10 + 'px') //don't understand this
		.style('line-height',params.windowHeight + 'px')
		.style('text-align','center')
}


//grid for small images
function populateField(){
	d3.selectAll('#fieldDiv').remove();

	var w = params.windowWidth; 
	var h = params.windowHeight; 
	var field = d3.select('body').append('div')
		.attr('id','fieldDiv')
		.style('position','absolute')
		.style('width', w + 'px')
		.style('height', h - params.buttonHeight - 2.*params.buttonMargin + 'px')

	//calculate how many can fit in this grid
	params.imageSize = (h - params.imageSepFac*params.imageBorderWidth - params.buttonHeight - 2.*params.buttonMargin)/params.nImageHeight; //including border
	params.imageGrowSize = Math.min(424, params.imageSize*params.imageGrow)
	var divHeight = params.nImageHeight*params.imageSize;
	var divWidth = Math.min(w - 2.*params.bucketWidth, params.objData.length/params.nImageHeight*params.imageSize);
	var nImageWidth = Math.floor(divWidth/params.imageSize);
	var xOffset = (w - divWidth)/2. ;
	var yOffset = 0;//(h - divHeight)/2. ;

	params.imageGridLeft = xOffset;
	params.imageGridWidth = divWidth;

	//check which ones will be shown
	params.objData.forEach(function(d,i){
		var left = Math.floor(i/params.nImageHeight)*params.imageSize;
		var top = (i % params.nImageHeight)*params.imageSize;
		if (left < divWidth){
			d.left = left + xOffset;
			d.top = top + yOffset;
			d.active = false;
			d.dragImageSamples = [];
			params.objDataShown.push(d);

		}
	})

	console.log('N images available, used', params.objData.length, params.objDataShown.length)
	console.log('image size', params.imageSize)

	field.selectAll('div').data(params.objDataShown).enter()
		.append('div')
		.attr('class','imageField')
		.attr('id',function(d){return getImageID(d)})
		.style('border-style','solid')
		.style('border-width',params.imageBorderWidth + 'px')
		.style('border-color',params.unknownColor)
		.style('width', params.imageSize - params.imageSepFac*params.imageBorderWidth + 'px') 
		.style('height',params.imageSize - params.imageSepFac*params.imageBorderWidth + 'px')
		.style('position','absolute')
		.style('left',function(d,i){return d.left + 'px'})
		.style('top',function(d,i){return d.top + 'px'})
		.style('z-index',1)
		.append('img')
			.attr('src',function(d){return 'data/'+d.image})
			.attr('width',params.imageSize - params.imageSepFac*params.imageBorderWidth + 'px')
			.attr('height',params.imageSize - params.imageSepFac*params.imageBorderWidth + 'px')
		.on('mousedown', function(d){
			d.active = true;
			growImage(d);
			populateStats(d);
			d3.event.preventDefault();
		})
		.on('touchstart', function(d){
			d.active = true;
			growImage(d);
			populateStats(d);
			d3.event.preventDefault();
		})

	// svg.selectAll('circle').data(data).enter()
	// .append('circle')
	// 	.attr('cx', function(d){return 2.5*radius*d + offsetX})
	// 	.attr('cy', radius + offsetY)
	// 	.attr('r', radius)
	// 	.attr('stroke', 'black')
	// 	.attr('stroke-width', strokeWidth)
	// 	.attr('fill', function(d){return params.colorMap(d/10.)});
}

//will improve look and feel later
//also need to only allow under certain conditions
function createButtons(){
	d3.select('body').append('div')
		.attr('id','trainingButton')
		.attr('class', 'buttonDiv')
		.style('height', params.buttonHeight + 'px')
		.style('font-size', params.buttonHeight*0.75 + 'px')
		.style('line-height', params.buttonHeight + 'px')
		.style('text-align','center')
		.style('position','absolute')
		.style('margin',params.buttonMargin + 'px')
		.text('Train Model')
		.on('mousedown',runModel)
		.on('touchStart',runModel)

	var w = parseFloat(d3.select('#trainingButton').node().getBoundingClientRect().width);
	var h = parseFloat(d3.select('#trainingButton').node().getBoundingClientRect().height);
	d3.select('#trainingButton')
		.style('left',(params.windowWidth)/2. + 2.*params.buttonMargin + 'px')  
		.style('top', params.windowHeight - h - 2.*params.buttonMargin + 'px')


	d3.select('body').append('div')
		.attr('id','resetButton')
		.attr('class', 'buttonDiv')
		.style('height', params.buttonHeight + 'px')
		.style('width', w + 'px')
		.style('font-size', params.buttonHeight*0.75 + 'px')
		.style('line-height', params.buttonHeight + 'px')
		.style('text-align','center')
		.style('position','absolute')
		.style('margin',params.buttonMargin + 'px')
		.style('left',(params.windowWidth)/2. - w - 2.*params.buttonMargin + 'px')  
		.style('top', params.windowHeight - h - 2.*params.buttonMargin + 'px')
		.text('Reset')
		.on('mousedown',reset)
		.on('touchStart',reset)



}

function createCounters(){
	var spiralCounter = d3.select('body').append('div')
		.attr('id','spiralCounter')
		.attr('class', 'buttonDiv')
		.style('height', params.buttonHeight + 'px')
		.style('position','absolute')
		.style('margin',params.buttonMargin + 'px')
		
	spiralCounter.append('div')
		.style('font-size', params.buttonHeight*0.75 + 'px')
		.style('line-height', params.buttonHeight*0.75 + 'px')
		.style('text-align','center')
		.attr('id','spiralN')
		.text(params.spiralImages.length)
	spiralCounter.append('div')
		.style('font-size', params.buttonHeight*0.25 + 'px')
		.style('line-height', params.buttonHeight*0.25 + 'px')
		.style('text-align','center')
		.text('# spiral images in model')

	var w = parseFloat(d3.select('#spiralCounter').node().getBoundingClientRect().width);
	var h = parseFloat(d3.select('#spiralCounter').node().getBoundingClientRect().height);
	d3.select('#spiralCounter')
		.style('width',w + 'px')
		.style('left',params.imageGridLeft - params.buttonMargin + 'px')  
		.style('top', params.windowHeight - h - 2.*params.buttonMargin + 'px')

	var smoothCounter = d3.select('body').append('div')
		.attr('id','smoothCounter')
		.attr('class', 'buttonDiv')
		.style('height', params.buttonHeight + 'px')
		.style('width',w + 'px')
		.style('position','absolute')
		.style('margin',params.buttonMargin + 'px')
		.style('left',params.imageGridWidth + params.imageGridLeft - w - 2.*params.buttonMargin -2 + 'px')  //where's the extra 2 coming from? 
		.style('top', params.windowHeight - h - 2.*params.buttonMargin + 'px')

	smoothCounter.append('div')
		.style('font-size', params.buttonHeight*0.75 + 'px')
		.style('line-height', params.buttonHeight*0.75 + 'px')
		.style('text-align','center')
		.attr('id','smoothN')
		.text(params.smoothImages.length)
	smoothCounter.append('div')
		.style('font-size', params.buttonHeight*0.25 + 'px')
		.style('line-height', params.buttonHeight*0.25 + 'px')
		.style('text-align','center')
		.text('# smooth images in model')


}
function getImageID(d){
	return d.image.split('.').join('').split('/').join('');
}
function growImage(d){
	var top = d3.select('#'+getImageID(d)).style('top')
	var left = d3.select('#'+getImageID(d)).style('left')
	d3.select('#'+getImageID(d))
		.style('z-index',10)
	d3.select('#'+getImageID(d)).transition().duration(200)
		.style('height',params.imageGrowSize - params.imageSepFac*params.imageBorderWidth + 'px')
		.style('width',params.imageGrowSize - params.imageSepFac*params.imageBorderWidth + 'px')
		.style('margin-top', (params.imageSize - params.imageGrowSize)/2. + 'px')
		.style('margin-left', (params.imageSize - params.imageGrowSize)/2. + 'px')
		.style('box-shadow', '10px 10px 10px black');

	d3.select('#'+getImageID(d)).select('img').transition().duration(200)
		.attr('height',params.imageGrowSize - params.imageSepFac*params.imageBorderWidth + 'px')
		.attr('width',params.imageGrowSize - params.imageSepFac*params.imageBorderWidth + 'px')
	
}
function shrinkImage(d){
	//for some reason, the transitions don't work for the outer div here?
	d3.select('#'+getImageID(d))//.transition().duration(200)
		.style('height',params.imageSize - params.imageSepFac*params.imageBorderWidth + 'px')
		.style('width',params.imageSize - params.imageSepFac*params.imageBorderWidth + 'px')
		.style('margin-top', '0px')
		.style('margin-left', '0px')
		.style('box-shadow', 'none');
	d3.select('#'+getImageID(d)).select('img')//.transition().duration(200)
		.attr('height',params.imageSize - params.imageSepFac*params.imageBorderWidth + 'px')
		.attr('width',params.imageSize - params.imageSepFac*params.imageBorderWidth + 'px')
	d3.select('#'+getImageID(d)).selectAll('svg').remove()
}
function handleImageMoves(){
	params.objDataShown.forEach(function(d){
		if (d.active){
			if (d3.event != null){
				d.dragImageSamples.push(d3.event)
			}
			if (d.dragImageSamples.length >2){ //get velocity so that we can give some intertia?
				d.dragImageSamples.shift();
				//for MouseEvent
				var x1 = d.dragImageSamples[0].clientX;
				var x2 = d.dragImageSamples[1].clientX;
				var y1 = d.dragImageSamples[0].clientY;
				var y2 = d.dragImageSamples[1].clientY;
				if (d.dragImageSamples[0].touches){ //for TouchEvent
					x1 = d.dragImageSamples[0].touches[0].clientX;
					x2 = d.dragImageSamples[1].touches[0].clientX;
					y1 = d.dragImageSamples[0].touches[0].clientY;
					y2 = d.dragImageSamples[1].touches[0].clientY;
				}

				var dt = d.dragImageSamples[1].timeStamp - d.dragImageSamples[0].timeStamp;
				var diffX = x2-x1;
				var diffY = y2-y1;
				d.dragImageVx = diffX/dt;
				d.dragImageVy = diffY/dt;

				var left = parseFloat(d3.select('#'+getImageID(d)).style('left'))
				var top = parseFloat(d3.select('#'+getImageID(d)).style('top'))
				var position = [left + diffX, Math.min(Math.max(top + diffY, 0), params.windowHeight - params.imageSize)];
				d3.select('#'+getImageID(d))
					.style('left', (position[0]) + 'px')
					.style('top', (position[1]) + 'px')
			}


		}
	})
}
//need to avoid having images running off edge of table and getting lost (without going into bucket)
function finalMove(d, x0, y0, finalX, finalY, duration){

	//get equation of line so that we can find the intercept if needed
	var m = (finalY - y0)/(finalX - x0);
	var b = y0 - m*x0;
	var distance = Math.sqrt((finalY - y0)*(finalY - y0) + (finalX - x0)*(finalX - x0));

	//check if we end up off screen in y (bounce)
	var bounce = false;
	var finalX2 = finalX;
	var finalY2 = finalY;
	if (finalY < 0){
		finalY2 = -1.*finalY;
		finalY = 0;
		bounce = true
	}
	if (finalY > params.windowHeight - params.imageSize){
		finalY2 = finalY - (params.windowHeight - params.imageSize);
		finalY = params.windowHeight - params.imageSize;
		bounce = true
	}

	//check if we end up in a bucket
	var bucket = null;
	if (finalX < params.windowWidth*params.bucketSuction && d.dragImageVx < 0){
		finalX = Math.min(finalX, -params.imageSize-params.imageBorderWidth);
		params.spiralImages.push(d);
		bucket = "spiralText";
	}
	if (finalX > params.windowWidth*(1. - params.bucketSuction) && d.dragImageVx > 0){
		finalX = Math.max(finalX, params.windowWidth);
		params.smoothImages.push(d);
		bucket = "smoothText"
	}
	if (bucket){
		bounce = false;
		params.modelUpdateNeeded = true;
	}

	var easeFunc = d3.easePolyOut.exponent(1.5);
	var durationUse = duration;
	if (bounce){
		easeFunc = d3.easeLinear;
		finalX = (finalY - b)/m;
		distance2 = Math.sqrt((finalY - y0)*(finalY - y0) + (finalX - x0)*(finalX - x0));
		durationUse *= distance2/distance;
	}

	d3.select('#'+getImageID(d)).transition().ease(easeFunc).duration(durationUse)
		.style('left', finalX + 'px')
		.style('top', finalY + 'px')
		.on('end', function(){
			if (bounce){
				finalMove(d, finalX, finalY, finalX2, finalY2, duration - durationUse)
			}
			if (bucket != null){
				// /////////////////////////////////
				// if (params.spiralImages.length > 2 && params.smoothImages.length > 2 ){	
				// 	runModel();
				// }	
				// /////////////////////////////////
				var growFac = 1.2;
				tSize = parseFloat(d3.select('#'+bucket).style('font-size'));
				left = parseFloat(d3.select('#'+bucket).style('left'));
				if (bucket == "spiralText"){
					leftOffset = left - tSize/3.; //don't understand this offset
				} else {
					leftOffset = left - tSize/3.;
				}
				d3.select('#'+bucket).transition().duration(200)
					.style('font-size',tSize*growFac + 'px')
					.style('left',leftOffset + 'px')
					.on('end',function(){					
						d3.select('#'+bucket).transition().duration(200)
							.style('font-size',tSize + 'px')
							.style('left',left + 'px')
						if (bucket == "spiralText"){
							d3.select('#spiralN').text(params.spiralImages.length)
						} else {
							d3.select('#smoothN').text(params.smoothImages.length)
						}

					})
			} else {
				d3.select('#'+getImageID(d)).style('z-index',2)
			}
		})
}
function finishImageMoves(){
	params.objDataShown.forEach(function(d){
		if (d.active){
			if (parseFloat(d3.select('#'+getImageID(d)).style('height')) > params.imageSize){
				shrinkImage(d);
			}

			var left = parseFloat(d3.select('#'+getImageID(d)).style('left'))
			var top = parseFloat(d3.select('#'+getImageID(d)).style('top'))	

			var finalX = left + d.dragImageVx*params.imageInertiaN;
			var finalY = top + d.dragImageVy*params.imageInertiaN;

			finalMove(d, left, top, finalX, finalY, params.imageInertiaN)



			d.active = false;
			d.dragImageSamples = [];
		}
	})
}

/////////////////////
//for the Zooniverse stats
function makeStatsPlot(id, clipID, value, radius, strokeWidth, offsetX, colorMap){
	var div = d3.select('#'+id);
	var height = parseFloat(div.style('height'));
	var width = parseFloat(div.style('width'));
	var left = parseFloat(div.style('left'));
	var top = parseFloat(div.style('top'));

	var svg = div.append("svg")
		.style('width', 2*radius + 'px')
		.style('height', params.imageGrowSize + 'px')
		.style('position', 'absolute')
		.style('top',0 + 'px')
		.style('left',offsetX + 'px')

	data = []
	for(var i=0; i<value; i++){
		data.push(i)
	}
	data.push(i)
	//console.log(data)
	svg.selectAll('circle').data(data).enter()
		.append('circle')
			.attr('cx', radius)
			.attr('cy', function(d){return params.imageGrowSize - (2.5*radius*d) - 2.5/2.*radius})
			.attr('r', radius)
			.attr('stroke', 'black')
			.attr('stroke-width', strokeWidth)
			.attr('fill', function(d){return colorMap(d/10.)});

	var clipPath = svg.append('defs').append("clipPath")
		.attr("id",clipID)
		.append('rect')
			.attr("width", 10*radius+'px')
			.attr("height", 2.5*radius*value)
			.attr("x", 0)
			.attr("y", params.imageGrowSize )
	d3.select('#'+clipID).selectAll('rect').transition().duration(1000)
		.attr("y", params.imageGrowSize*(1.-value/10.))

	svg.attr('clip-path', 'url(#'+clipID+')');
}
function populateStats(img){

	var radius = (params.imageGrowSize/10.)/2.5;

	var spiral = 10*img['t04_spiral_a08_spiral_debiased'];
	var smooth = 10*img['t01_smooth_or_features_a01_smooth_debiased'];
	console.log("spiral, smooth", spiral, smooth)

	makeStatsPlot(getImageID(img), getImageID(img)+'SpiralClip', spiral, radius, 1, -2.*radius - params.imageBorderWidth, params.spiralColorMap)
	makeStatsPlot(getImageID(img), getImageID(img)+'SmoothClip', smooth, radius, 1, params.imageGrowSize, params.smoothColorMap)

	d3.select('#'+getImageID(img)).on('mouseup',function(){shrinkImage(img)});

}

//https://bl.ocks.org/EfratVil/903d82a7cde553fb6739fe55af6103e2
function setColorMap(){
	var step = d3.scaleLinear()
		.domain([1, 8])
		.range([0, 1]);

	params.colorMap= d3.scaleLinear()
		.domain([0, step(2), step(3), step(4), step(5), step(6), step(7), 1])
		.range(['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'])
		.interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb

}
function setColorMaps(){

	params.smoothColorMap= d3.scaleLinear()
		.domain([0, 1])
		.range([d3.rgb(params.unknownColor), d3.rgb(params.smoothColor)])
		.interpolate(d3.interpolateRgb); //interpolateHsl interpolateHcl interpolateRgb

	params.spiralColorMap= d3.scaleLinear()
		.domain([0, 1])
		.range([d3.rgb(params.unknownColor), d3.rgb(params.spiralColor)])
		.interpolate(d3.interpolateRgb); //interpolateHsl interpolateHcl interpolateRgb

	}


/**
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */
var shuffle = function(array){

	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;

};
function reset(){
	params.spiralImages=[];
	params.smoothImages=[];
	params.objDataShown=[];
	populateField();
}
function init(){
	setColorMaps();
	formatBucketText();
	populateField();
	createButtons();
	initializeML();
	createCounters();
}
///////////////////////////
// runs on load
///////////////////////////

//read in the data
d3.json('data/GZ2data.json')
	.then(function(data) {
		params.objData = shuffle(data);
		init();
	});

d3.select(window)
	.on('mousemove', handleImageMoves)
	.on('mouseup', finishImageMoves)
	.on('touchmove', handleImageMoves)
	.on('touchend', finishImageMoves)

//always be classifying
// var checkClassifier = setInterval(function(){ 
// 	console.log(params.modelBusy, params.spiralImages.length, params.smoothImages.length, params.modelUpdateNeeded)
// 	if (!params.modelBusy && params.spiralImages.length >= 2 && params.smoothImages.length >= 2 && params.modelUpdateNeeded){	
// 		params.modelBusy = true;
// 		runModel();
// 	};
// },params.modelCheckInterval)

