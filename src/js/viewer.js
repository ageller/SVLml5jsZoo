//the text for the budgets
function formatBucketText(){
	d3.select('#spiralText')
		.style('font-size',params.bucketWidth + 'px')
		.style('position', 'absolute')
		.style('color','gray')
		.style('transform','rotate(90deg)')
		.style('margin','20px')
	var w = parseFloat(d3.select('#spiralText').node().getBoundingClientRect().width);
	var h = parseFloat(d3.select('#spiralText').node().getBoundingClientRect().height);

	d3.select('#spiralText')
		.style('left',-w/2. -20+ 'px')  //why is this 20 and I use 10 below
		.style('top',(parseFloat(window.innerHeight) - h)/2. + 'px') //not sure why this isn't working

	d3.select('#smoothText')
		.style('font-size',params.bucketWidth + 'px')
		.style('position', 'absolute')
		.style('color','gray')
		.style('transform','rotate(-90deg)')
		.style('margin','20px')
	var w = parseFloat(d3.select('#smoothText').node().getBoundingClientRect().width);
	var h = parseFloat(d3.select('#smoothText').node().getBoundingClientRect().height);

	d3.select('#smoothText')
		.style('left',parseFloat(window.innerWidth) - 2.*w - 10 + 'px') //don't understand this
		.style('top',(parseFloat(window.innerHeight) - h)/2. + 'px') //not sure why this isn't working
}


//grid for small images
//do I need to check for the bucketWidth?
function populateField(){
	var w = window.innerWidth; 
	var h = window.innerHeight; 
	var field = d3.select('#fieldDiv')
		.style('position','absolute')
		.style('width', w+'px')
		.style('height', h+'px')

	//calculate how many can fit in this grid
	params.imageSize = (h - 2.*params.imageBorderWidth)/params.nImageHeight; //including border
	var nImageWidth = Math.min(Math.floor(w/params.imageSize), params.objData.length/params.nImageHeight);  //here should account for bucketWidth
	var xOffset = (w - 2.*params.imageBorderWidth - nImageWidth*params.imageSize)/2. ;
	//check which ones will be shown
	params.objData.forEach(function(d,i){
		var left = Math.floor(i/params.nImageHeight)*params.imageSize + xOffset;
		var top = (i % params.nImageHeight)*params.imageSize;
		if (left < (w-params.imageSize)){
			d.left = left;
			d.top = top;
			d.active = false;
			d.dragImageSamples = [];
			params.objDataShown.push(d);

		}
	})

	console.log('N images available, used', params.objData.length, params.objDataShown.length)
	console.log('image size', params.imageSize)

	field.selectAll('div').data(params.objDataShown).enter()
		.append('div')
		.attr('id',function(d){return getImageID(d)})
		.style('border-style','solid')
		.style('border-width',params.imageBorderWidth + 'px')
		.style('border-color','red')
		.style('width', params.imageSize - params.imageBorderWidth + 'px') //overlap the borders, for a cleaner look
		.style('height',params.imageSize - params.imageBorderWidth + 'px')
		.style('position','absolute')
		.style('left',function(d,i){return d.left + 'px'})
		.style('top',function(d,i){return d.top + 'px'})
		.style('z-index',1)
		.append('img')
			.attr('src',function(d){return 'data/'+d.image})
			.attr('width',params.imageSize - params.imageBorderWidth + 'px')
			.attr('height',params.imageSize - params.imageBorderWidth + 'px')
		.on('mousedown', function(d){
			d.active = true;
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
function getImageID(d){
	return d.image.split('.').join('').split('/').join('');
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
				d.dragImageVx = diffX/dt*params.imageInertia;
				d.dragImageVy = diffY/dt*params.imageInertia;

				var left = parseFloat(d3.select('#'+getImageID(d)).style('left'))
				var top = parseFloat(d3.select('#'+getImageID(d)).style('top'))
				var position = [left + diffX, top + diffY];
				d3.select('#'+getImageID(d))
					.style('z-index',10)
					.style('left', (position[0]) + 'px')
					.style('top', (position[1]) + 'px')
			}


		}
	})
}
function finishImageMoves(){
	params.objDataShown.forEach(function(d){
		if (d.active){
			var left = parseFloat(d3.select('#'+getImageID(d)).style('left'))
			var top = parseFloat(d3.select('#'+getImageID(d)).style('top'))	

			var finalX = left + d.dragImageVx*params.imageInertia;
			var finalY = top + d.dragImageVy*params.imageInertia;

			var bucket = null;
			if (finalX < parseFloat(window.innerWidth)*params.bucketSuction && d.dragImageVx < 0){
				finalX = -params.imageSize-params.imageBorderWidth;
				params.spiralImages.push(d);
				bucket = "spiralText";
			}
			if (finalX > parseFloat(window.innerWidth*(1. - params.bucketSuction)) && d.dragImageVx > 0){
				finalX = parseFloat(window.innerWidth);
				params.smoothImages.push(d);
				bucket = "smoothText"

			}

			d3.select('#'+getImageID(d)).transition().ease(d3.easePolyOut).duration(params.imageInertiaN)
				.style('left', finalX + 'px')
				.style('top', finalY + 'px')
				.on('end', function(){
					if (bucket != null){
						d3.select('#'+bucket).transition().duration(200)
							.style('color','red')
							.on('end',function(){
								d3.select('#'+bucket).transition().duration(200)
									.style('color','gray')
							})
					}
				})



			d.active = false;
			d.dragImageSamples = [];
		}
	})
}

/////////////////////
//for the big image
function showImage(i, offsetX=0){

	var div = d3.select('#mainImageDiv')
	var w = parseFloat(div.style('width'))
	var h = parseFloat(div.style('height'))
	div.append('img')
		.attr('id','imgNow')
		.attr('src','data/'+params.objData[i].image)
		.style('position','absolute') 
		.style('left',offsetX)

}
function populateStats(i){


	function makeStatsPlot(id, value, radius, strokeWidth, offsetX, offsetY){
		var div = d3.select('#'+id);
		var height = parseFloat(div.style('height'));
		var width = parseFloat(div.style('width'));
		var left = parseFloat(div.style('left'));
		var top = parseFloat(div.style('top'));

		var svg = div.append("svg")
			.style('height', height)
			.style('width', width)
			.style('position', 'absolute')
			.style('top',0)
			.style('left',0)

		data = []
		for(var i=0; i<=value; i++){
			data.push(i)
		}
		data.push(i)
		//console.log(data)
		svg.selectAll('circle').data(data).enter()
			.append('circle')
				.attr('cx', function(d){return 2.5*radius*d + offsetX})
				.attr('cy', radius + offsetY)
				.attr('r', radius)
				.attr('stroke', 'black')
				.attr('stroke-width', strokeWidth)
				.attr('fill', function(d){return params.colorMap(d/10.)});

		var clipPath = svg.append('defs').append("clipPath")
			.attr("id",id+'Clip')
			.append('rect')
				.attr("width", 0)
				.attr("height", 50)
				.attr("x", offsetX - radius - strokeWidth)
				.attr("y", 0)
		d3.select('#'+id+'Clip').selectAll('rect').transition(params.tTrans)
			.attr("width", 2.5*radius*value)

		svg.attr('clip-path', 'url(#'+id+'Clip)');
	}




	var spiral = 10*params.objData[i]['t04_spiral_a08_spiral_debiased'];
	var smooth = 10*params.objData[i]['t01_smooth_or_features_a01_smooth_debiased'];
	console.log("ID, spiral, smooth", params.useIndex, spiral, smooth)

	makeStatsPlot('spiralStats', spiral, 10, 1, 150, 10)
	makeStatsPlot('smoothStats', smooth, 10, 1, 150, 10)


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

function advanceIndex(val, random=true){

	params.objIndex += val;
	if (params.objIndex < 0){
		params.objIndex = params.objData.length-1;
	}
	if (random){
		params.useIndex = params.randomIndices[params.objIndex];
	} else {
		params.useIndex = params.objIndex;
	}
	
}
//create a new index list that is random
function randomizeObjects(){
	for(var i=0; i<params.objData.length; i++){
		params.randomIndices.push(parseInt(Math.random()*params.objData.length));
	}
}
function slideImage(val){
	var w = parseFloat(d3.select('#mainImageDiv').style('width'))
	var h = parseFloat(d3.select('#mainImageDiv').style('height'))
	d3.select('#imgNow') //animation in css
		.attr('id','imgPrev')

	showImage(params.useIndex,-val*w);

	var offsetX = val*w
	d3.select('#imgNow')
		.on('load',function(){
			d3.select('#imgNow').style('left',0)
			d3.select('#imgPrev').style('left',val*w+'px');
		})
		.on('transitionend',function(){
			d3.selectAll('#imgPrev').remove()
		})

}
///////////////////////////
// runs on load
///////////////////////////
// attach some functions to buttons
d3.select('#nextButton').on('click',function(e){
	advanceIndex(1);
	slideImage(1);
	populateStats(params.useIndex);
})
d3.select('#prevButton').on('click',function(e){
	advanceIndex(-1);
	slideImage(-1);
	populateStats(params.useIndex);
})
//read in the data
d3.json('data/GZ2data.json')
	.then(function(data) {
		params.objData = data;
		setColorMap();
		randomizeObjects();
		formatBucketText();
		populateField();
		//showImage(params.useIndex);
		//populateStats(params.useIndex);
	});

d3.select('body')
	.on('mousemove', handleImageMoves)
	.on('mouseup', finishImageMoves)
