//the text for the budgets
function formatBucketText(){
	d3.select('body').append('div')
		.attr('id','spiralText')
		.text('Spiral')
		.style('font-size',viewerParams.bucketWidth*0.75 + 'px')
		.style('position', 'absolute')
		.style('color',viewerParams.spiralColor)
		.style('transform','rotate(90deg)')
		.style('margin','20px')

	var w = parseFloat(d3.select('#spiralText').node().getBoundingClientRect().width);
	d3.select('#spiralText')
		.style('left',-w/2. -20+ 'px')  //why is this 20 and I use 10 below
		.style('line-height',viewerParams.windowHeight + 'px')
		.style('text-align','center')

	d3.select('body').append('div')
		.attr('id','smoothText')
		.text('Smooth')
		.style('font-size',viewerParams.bucketWidth*0.75 + 'px')
		.style('position', 'absolute')
		.style('color',viewerParams.smoothColor)
		.style('transform','rotate(-90deg)')
		.style('margin','20px')

	var w = parseFloat(d3.select('#smoothText').node().getBoundingClientRect().width);
	d3.select('#smoothText')
		.style('left',viewerParams.windowWidth - 2.*w - 10 + 'px') //don't understand this
		.style('line-height',viewerParams.windowHeight + 'px')
		.style('text-align','center')
}


//grid for small images
function populateField(){
	d3.selectAll('#fieldDiv').remove();

	var w = viewerParams.windowWidth; 
	var h = viewerParams.windowHeight; 
	viewerParams.fieldDiv = d3.select('body').append('div')
		.attr('id','fieldDiv')
		.style('position','absolute')
		.style('width', w + 'px')
		.style('height', h - viewerParams.buttonHeight - 2.*viewerParams.buttonMargin + 'px')
		.style('top','0px')
		.style('left','0px')

	//calculate how many can fit in this grid
	viewerParams.imageSize = (h - viewerParams.imageSepFac*viewerParams.imageBorderWidth - viewerParams.buttonHeight - 2.*viewerParams.buttonMargin)/viewerParams.nImageHeight; //including border
	viewerParams.imageGrowSize = Math.min(424, viewerParams.imageSize*viewerParams.imageGrow)
	var divHeight = viewerParams.nImageHeight*viewerParams.imageSize;
	var divWidth = Math.min(w - 2.*viewerParams.bucketWidth, viewerParams.objData.length/viewerParams.nImageHeight*viewerParams.imageSize);
	var nImageWidth = Math.floor(divWidth/viewerParams.imageSize);
	var xOffset = (w - divWidth)/2. ;
	var yOffset = 0;//(h - divHeight)/2. ;

	viewerParams.imageGridLeft = xOffset;
	viewerParams.imageGridWidth = divWidth;

	//check which ones will be shown
	viewerParams.objData.forEach(function(d,i){
		var left = Math.floor(i/viewerParams.nImageHeight)*viewerParams.imageSize;
		var top = (i % viewerParams.nImageHeight)*viewerParams.imageSize;
		if (left < divWidth){
			d.left = left + xOffset;
			d.top = top + yOffset;
			d.active = false;
			d.dragImageSamples = [];
			viewerParams.objDataShown.push(d);

		}
	})

	viewerParams.nSpiral = 0.;
	viewerParams.nSmooth = 0.;
	viewerParams.objDataShown.forEach(function(d,i){
		var spiral = 10*d['t04_spiral_a08_spiral_debiased'];
		var smooth = 10*d['t01_smooth_or_features_a01_smooth_debiased'];
		if (spiral > smooth){
			viewerParams.nSpiral += 1.;
		} else {
			viewerParams.nSmooth += 1.;
		}
	});

	console.log('N images available, used', viewerParams.objData.length, viewerParams.objDataShown.length)
	console.log('N spiral, N smooth', viewerParams.nSpiral, viewerParams.nSmooth)
	console.log('image size', viewerParams.imageSize)

	viewerParams.objDataShown.forEach(function(d){
		addImageToField(d)
	})
}

function addImageToField(d){
	var div = viewerParams.fieldDiv
		.append('div')
		.attr('class','imageField')
		.attr('id',getImageID(d))
		.style('border-style','solid')
		.style('border-width',viewerParams.imageBorderWidth + 'px')
		.style('border-color',viewerParams.unknownColor)
		.style('width', viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px') 
		.style('height',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('position','absolute')
		.style('left',d.left + 'px')
		.style('top',d.top + 'px')
		.style('z-index',1)
		.on('mousedown', function(){
			d.active = true;
			growImage(d);
			d3.event.preventDefault();
		})
		.on('touchstart', function(){
			d.active = true;
			growImage(d);
			d3.event.preventDefault();
		})

	div.append('img')
		.attr('src','/static/data/'+d.image)
		.attr('width',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.attr('height',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')


	div.append('div')
		.attr('id', 'textBox')
		.style('width', viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px') 
		.style('height',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('position','absolute')
		.style('left',0)
		.style('top',0)
		.style('line-height', viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('font-size', viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('text-align','center')
		.style('color',getComputedStyle(document.documentElement).getPropertyValue('--background-color'))
	// svg.selectAll('circle').data(data).enter()
	// .append('circle')
	// 	.attr('cx', function(d){return 2.5*radius*d + offsetX})
	// 	.attr('cy', radius + offsetY)
	// 	.attr('r', radius)
	// 	.attr('stroke', 'black')
	// 	.attr('stroke-width', strokeWidth)
	// 	.attr('fill', function(d){return viewerParams.colorMap(d/10.)});
}

//will improve look and feel later
//also need to only allow under certain conditions
function createButtons(){
	var hb = viewerParams.buttonHeight;
	d3.select('body').append('div')
		.attr('id','trainingButton')
		.attr('class', 'buttonDiv')
		.style('height', hb + 'px') 
		.style('font-size', hb*0.75 + 'px')
		.style('line-height', hb + 'px')
		.style('text-align','center')
		.style('position','absolute')
		.style('margin',viewerParams.buttonMargin + 'px')
		.text('Train Model')
		.on('mousedown',sendToML)
		.on('touchStart',sendToML)

	var w = parseFloat(d3.select('#trainingButton').node().getBoundingClientRect().width) - 35; //25 for padding under button, 10 for box shadow
	var h = parseFloat(d3.select('#trainingButton').node().getBoundingClientRect().height);
	d3.select('#trainingButton')
		.style('left',(viewerParams.windowWidth)/2. + 2.*viewerParams.buttonMargin + 2 + 'px')  
		.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
		.style('width', w - 35 +'px')//25 for padding under button, 10 for box shadow
		.style('border-radius', h/2 + 'px')

	d3.select('body').append('div')
		.attr('id','resetButton')
		.attr('class', 'buttonDiv')
		.style('height', hb + 'px') 
		.style('width', w - 35 +'px')//25 for padding under button, 10 for box shadow
		.style('font-size', hb*0.75 + 'px')
		.style('line-height', hb + 'px')
		.style('text-align','center')
		.style('position','absolute')
		.style('margin',viewerParams.buttonMargin + 'px')
		.style('left',(viewerParams.windowWidth)/2. - w - 2.*viewerParams.buttonMargin - 2 +'px')  
		.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
		.style('border-radius', h/2 + 'px')
		.text('Reset')
		.on('mousedown',reset)
		.on('touchStart',reset)



}

function createCounters(){
	var spiralCounter = d3.select('body').append('div')
		.attr('id','spiralCounter')
		.attr('class', 'counterDiv')
		.style('height', viewerParams.buttonHeight + 'px')
		.style('position','absolute')
		.style('margin',viewerParams.buttonMargin + 'px')
		.style('border-width','4px 4px 4px 0px')
	spiralCounter.append('div')
		.attr('id','spiralN')
		.style('font-size', viewerParams.buttonHeight*0.75 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.75 + 'px')
		.style('text-align','center')
		.text(viewerParams.spiralImages.length)
	spiralCounter.append('div')
		.style('font-size', viewerParams.buttonHeight*0.25 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.25 + 'px')
		.style('text-align','center')
		.style('padding-right', '10px')
		.text('# spiral images in model')

	var spiralPercent = d3.select('body').append('div')
		.attr('id','spiralPercent')
		.attr('class', 'counterDiv')
		.style('height', viewerParams.buttonHeight + 'px')
		.style('position','absolute')
		.style('margin',viewerParams.buttonMargin + 'px')
		.style('border-width','4px 0px 4px 4px')
	spiralPercent.append('div')
		.attr('id','spiralP')
		.style('font-size', viewerParams.buttonHeight*0.75 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.75 + 'px')
		.style('text-align','center')
		.html('&mdash;')
	spiralPercent.append('div')
		.style('font-size', viewerParams.buttonHeight*0.25 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.25 + 'px')
		.style('text-align','center')
		.text('% spiral agreement')


	var smoothCounter = d3.select('body').append('div')
		.attr('id','smoothCounter')
		.attr('class', 'counterDiv')
		.style('height', viewerParams.buttonHeight + 'px')
		.style('position','absolute')
		.style('margin',viewerParams.buttonMargin + 'px')
		.style('border-width','4px 0px 4px 4px')
	smoothCounter.append('div')
		.attr('id','smoothN')
		.style('font-size', viewerParams.buttonHeight*0.75 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.75 + 'px')
		.style('text-align','center')
		.text(viewerParams.smoothImages.length)
	smoothCounter.append('div')
		.style('font-size', viewerParams.buttonHeight*0.25 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.25 + 'px')
		.style('text-align','center')
		.style('padding-left', '10px')
		.text('# smooth images in model')

	var smoothPercent = d3.select('body').append('div')
		.attr('id','smoothPercent')
		.attr('class', 'counterDiv')
		.style('height', viewerParams.buttonHeight + 'px')
		.style('position','absolute')
		.style('margin',viewerParams.buttonMargin + 'px')
		.style('border-width','4px 4px 4px 0px')
	smoothPercent.append('div')
		.attr('id','smoothP')
		.style('font-size', viewerParams.buttonHeight*0.75 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.75 + 'px')
		.style('text-align','center')
		.html('&mdash;')
	smoothPercent.append('div')
		.style('font-size', viewerParams.buttonHeight*0.25 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.25 + 'px')
		.style('text-align','center')
		.text('% smooth agreement')

	//sizes and positions for the counters
	var w1 = parseFloat(d3.select('#spiralCounter').node().getBoundingClientRect().width);
	var w2 = parseFloat(d3.select('#smoothCounter').node().getBoundingClientRect().width);
	var w = Math.max(w1, w2);
	var h = parseFloat(d3.select('#spiralCounter').node().getBoundingClientRect().height);
	leftReset = parseFloat(d3.select('#resetButton').style('left'));
	d3.select('#spiralCounter')
		.style('width',w + 'px')
		.style('left', leftReset - w - 8 + 'px')//4 for border, 2x2 for padding
		//.style('left',viewerParams.imageGridLeft - viewerParams.buttonMargin + 'px')  
		.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
		.style('border-radius', '0px ' + h/2 + 'px ' +h/2 + 'px 0px')

	leftTraining = parseFloat(d3.select('#trainingButton').style('left'));
	widthTraining = parseFloat(d3.select('#trainingButton').style('width'))+ 35 + 4;//for the box shadow and padding
	d3.select('#smoothCounter')
		.style('width',w + 'px')
		.style('left',leftTraining + widthTraining  + 8 + 'px')//4 for border, 2x2 for padding
		//.style('left',maxLeft+viewerParams.imageSize - w - viewerParams.buttonMargin -12 + 'px')  //2x4 for border, 2x2 for padding
		.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
		.style('border-radius', h/2 + 'px 0px 0px ' + h/2 + 'px')

	//sizes and positions for the fraction correct
	var maxLeft = 0.;
	var minLeft = viewerParams.windowWidth;
	viewerParams.objDataShown.forEach(function(d){
		maxLeft = Math.max(maxLeft, d.left + viewerParams.imageSize);
		minLeft = Math.min(minLeft, d.left);
	})

	var w1 = parseFloat(d3.select('#spiralCounter').style('left')) - minLeft -6;//4 for border, 2 for padding;
	d3.select('#spiralPercent')
		.style('width',w1 + 'px')
		.style('left',minLeft -2 + 'px')//4 for border, 2x2 for padding
		.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
		.style('border-radius', h/2 + 'px 0px 0px ' + h/2 + 'px')

	var x = d3.select('#smoothCounter')
	var w2 = maxLeft - (parseFloat(x.style('left')) + parseFloat(x.style('width')) ) -12 - 12 +2;//2x4 for border, 2x2 for padding (for both), and overlap borders;
	d3.select('#smoothPercent')
		.style('width',w2 + 'px')
		.style('left',maxLeft - w2 -14 + 'px')//4 for border, 2x2 for padding
		.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
		.style('border-radius', '0px ' + h/2 + 'px ' +h/2 + 'px 0px')


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
		.style('height',viewerParams.imageGrowSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('width',viewerParams.imageGrowSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('margin-top', (viewerParams.imageSize - viewerParams.imageGrowSize) + 'px')
		.style('margin-left', (viewerParams.imageSize - viewerParams.imageGrowSize) + 'px')
		.style('box-shadow', '10px 10px 10px rgb(20,20,20)')
		.on('end', function(){
			populateStats(d);
		})

	d3.select('#'+getImageID(d)).select('img').transition().duration(200)
		.attr('height',viewerParams.imageGrowSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.attr('width',viewerParams.imageGrowSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
	
}
function shrinkImage(d){
	//for some reason, the transitions don't work for the outer div here?
	d3.select('#'+getImageID(d))//.transition().duration(200)
		.style('height',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('width',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('margin-top', '0px')
		.style('margin-left', '0px')
		.style('box-shadow', 'none');
	d3.select('#'+getImageID(d)).select('img')//.transition().duration(200)
		.attr('height',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.attr('width',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
	d3.select('#'+getImageID(d)).selectAll('svg').remove()
}
function handleImageMoves(){
	viewerParams.objDataShown.forEach(function(d){
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
				var position = [left + diffX, Math.min(Math.max(top + diffY, 0), viewerParams.windowHeight - viewerParams.imageSize)];
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
	if (finalY > viewerParams.windowHeight - viewerParams.imageSize){
		finalY2 = finalY - (viewerParams.windowHeight - viewerParams.imageSize);
		finalY = viewerParams.windowHeight - viewerParams.imageSize;
		bounce = true
	}

	//check if we end up in a bucket
	var bucket = null;
	if (finalX < viewerParams.windowWidth*viewerParams.bucketSuction && d.dragImageVx < 0){
		finalX = Math.min(finalX, -viewerParams.imageSize-viewerParams.imageBorderWidth);
		viewerParams.spiralImages.push(d);
		bucket = "spiralText";
	}
	if (finalX > viewerParams.windowWidth*(1. - viewerParams.bucketSuction) && d.dragImageVx > 0){
		finalX = Math.max(finalX, viewerParams.windowWidth);
		viewerParams.smoothImages.push(d);
		bucket = "smoothText"
	}
	if (bucket){
		bounce = false;
		viewerParams.modelUpdateNeeded = true;
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
							d3.select('#spiralN').text(viewerParams.spiralImages.length)
						} else {
							d3.select('#smoothN').text(viewerParams.smoothImages.length)
						}

					});
					replaceImageInField(d);
			} else {
				d3.select('#'+getImageID(d)).style('z-index',2)
			}

		})
}
function replaceImageInField(d){
	//add another image to the group
	//select images with same left value and top < image
	var sameRow = [];
	var minTop = 0.;
	if (d.top > 0){
		minTop = viewerParams.windowHeight;
		viewerParams.objDataShown.forEach(function(dd, i){
			if (dd.left == d.left && dd.top < d.top){
				dd.top += viewerParams.imageSize; //reset this here so that it is consistent with style later
				sameRow.push(dd)
				var x = d3.select('#'+getImageID(dd))
				minTop = Math.min(minTop,  parseFloat(x.style('top')))
			}
		});
	}

	//add an image
	var dd = viewerParams.objData[viewerParams.objDataShown.length]; //I think this is the next one (or else length+1?)
	dd.left = d.left;
	dd.top = minTop - viewerParams.imageSize;
	dd.active = false;
	dd.dragImageSamples = [];
	viewerParams.objDataShown.push(dd);
	sameRow.push(dd);
	addImageToField(dd);

	//move the images in that row
	sameRow.forEach(function(dd,i){
		var x = d3.select('#'+getImageID(dd))
		var top = parseFloat(x.style('top'));
		x.transition().ease(d3.easeBounceOut).duration(400)
			.style('top',top+viewerParams.imageSize + 'px')
			.on('end', function(){

			})
	});
}
function finishImageMoves(){
	viewerParams.objDataShown.forEach(function(d){
		if (d.active){
			if (parseFloat(d3.select('#'+getImageID(d)).style('height')) > viewerParams.imageSize){
				shrinkImage(d);
			}

			var left = parseFloat(d3.select('#'+getImageID(d)).style('left'))
			var top = parseFloat(d3.select('#'+getImageID(d)).style('top'))	

			var finalX = left + d.dragImageVx*viewerParams.imageInertiaN;
			var finalY = top + d.dragImageVy*viewerParams.imageInertiaN;

			finalMove(d, left, top, finalX, finalY, viewerParams.imageInertiaN)



			d.active = false;
			d.dragImageSamples = [];
		}
	})
}

/////////////////////
//for the Zooniverse stats
function makeStatsPlot(id, clipID, value, radius, strokeWidth, offsetX, colorMap){
	var div = d3.select('#'+id);
	var height = parseFloat(div.style('height')) + viewerParams.imageBorderWidth*2.;
	var width = parseFloat(div.style('width'));
	var left = parseFloat(div.style('left'));
	var top = parseFloat(div.style('top'));

	var sWidth = 0;//viewerParams.imageBorderWidth;

	var svg = div.append("svg")
		.style('width', 2*radius + 2*sWidth + 'px')
		.style('height', height + 'px')
		.style('position', 'absolute')
		.style('top',-viewerParams.imageBorderWidth + 'px') 
		.style('left',offsetX + 'px')
		.style('transform','scaleY(-1)')

	var hRect = Math.max(height*value/10. - sWidth, 0)//shouldn't this be -2*sWidth?
	svg.append('rect')
		.attr("width", 2*radius +'px')
		.attr("height", '0px') 
		.attr("x", sWidth+'px')
		.attr("y", sWidth*0.5+'px')  //don't get it!
		.attr('fill',colorMap(value/10.))
		.attr('stroke',viewerParams.unknownColor)
		.attr('stroke-width',sWidth+'px')
		.transition().duration(500)
			.attr("height", hRect + 'px') 

	//for circles
	// data = []
	// for(var i=0; i<value; i++){
	// 	data.push(i)
	// }
	// data.push(i)
	// //console.log(data)
	// svg.selectAll('circle').data(data).enter()
	// 	.append('circle')
	// 		.attr('cx', radius)
	// 		.attr('cy', function(d){return viewerParams.imageGrowSize - (2.5*radius*d) - 2.5/2.*radius})
	// 		.attr('r', radius)
	// 		.attr('stroke', 'black')
	// 		.attr('stroke-width', strokeWidth)
	// 		.attr('fill', function(d){return colorMap(d/10.)});

	// var clipPath = svg.append('defs').append("clipPath")
	// 	.attr("id",clipID)
	// 	.append('rect')
	// 		.attr("width", 10*radius+'px')
	// 		.attr("height", 2.5*radius*value)
	// 		.attr("x", 0)
	// 		.attr("y", viewerParams.imageGrowSize )
	// d3.select('#'+clipID).selectAll('rect').transition().duration(1000)
	// 	.attr("y", viewerParams.imageGrowSize*(1.-value/10.))

	// svg.attr('clip-path', 'url(#'+clipID+')');
}
function populateStats(img){

	var radius = (viewerParams.imageGrowSize/10.)/2.5;

	var spiral = 10*img['t04_spiral_a08_spiral_debiased'];
	var smooth = 10*img['t01_smooth_or_features_a01_smooth_debiased'];
	console.log("spiral, smooth", spiral, smooth)

	makeStatsPlot(getImageID(img), getImageID(img)+'SpiralClip', spiral, radius, 1, -2.*radius - viewerParams.imageBorderWidth, viewerParams.spiralColorMap)
	makeStatsPlot(getImageID(img), getImageID(img)+'SmoothClip', smooth, radius, 1, viewerParams.imageGrowSize - 1.5*viewerParams.imageBorderWidth, viewerParams.smoothColorMap)

	d3.select('#'+getImageID(img)).on('mouseup',function(){shrinkImage(img)});

}

function showMLResults(){
	viewerParams.nSpiralAgree = 0.;
	viewerParams.nSmoothAgree = 0.;
	viewerParams.nSpiral = 0.;
	viewerParams.nSmooth = 0.;
	viewerParams.objDataShown.forEach(function(d,i){
		var spiral = 10*d['t04_spiral_a08_spiral_debiased'];
		var smooth = 10*d['t01_smooth_or_features_a01_smooth_debiased'];
		if (spiral > smooth){
			viewerParams.nSpiral += 1.;
		} else {
			viewerParams.nSmooth += 1.;
		}
		if (d.results0) {
			
			var cColor = viewerParams.unknownColor;
			if (d.results0.label == "spiral"){
				cColor = viewerParams.spiralColorMap(d.results0.confidence);
				if (spiral > smooth){
					d.agree = true;
					viewerParams.nSpiralAgree += 1;
				} else {
					d.agree = false;
				}
			}
			if (d.results0.label == "smooth"){
				cColor = viewerParams.smoothColorMap(d.results0.confidence);
				if (smooth > spiral){
					d.agree = true;
					viewerParams.nSmoothAgree += 1;
				} else {
					d.agree = false;
				}
			}
			d3.select('#'+getImageID(d)).transition().duration(1000)
				.style('border-color',cColor)
				.on('end', function(){
					if (d.agree){
						d3.select('#'+getImageID(d)).select('#textBox').text('')
					} else{
						d3.select('#'+getImageID(d)).select('#textBox').text('X')
					}
				})
			console.log("img, results[0]", d.image, spiral, smooth, d.results0, d.agree)


		}
		if (i == viewerParams.objDataShown.length-1){
			//show the percent agreement (will have some way to display on screen later)
			//NOTE: I think this will also include the training set (but is that a problem?)
			d3.select('#spiralP').html(Math.round(viewerParams.nSpiralAgree/viewerParams.nSpiral*100.))
			d3.select('#smoothP').html(Math.round(viewerParams.nSmoothAgree/viewerParams.nSmooth*100.))
			console.log('Spiral agreement : ', viewerParams.nSpiral, viewerParams.nSpiralAgree, viewerParams.nSpiralAgree/viewerParams.nSpiral)
			console.log('Smooth agreement : ', viewerParams.nSmooth, viewerParams.nSmoothAgree, viewerParams.nSmoothAgree/viewerParams.nSmooth)

		}
	});

}

//https://bl.ocks.org/EfratVil/903d82a7cde553fb6739fe55af6103e2
function setColorMap(){
	var step = d3.scaleLinear()
		.domain([1, 8])
		.range([0, 1]);

	viewerParams.colorMap= d3.scaleLinear()
		.domain([0, step(2), step(3), step(4), step(5), step(6), step(7), 1])
		.range(['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'])
		.interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb

}
function setColorMaps(){

	viewerParams.smoothColorMap= d3.scaleLinear()
		.domain([0, 1])
		.range([d3.rgb(viewerParams.unknownColor), d3.rgb(viewerParams.smoothColor)])
		.interpolate(d3.interpolateRgb); //interpolateHsl interpolateHcl interpolateRgb

	viewerParams.spiralColorMap= d3.scaleLinear()
		.domain([0, 1])
		.range([d3.rgb(viewerParams.unknownColor), d3.rgb(viewerParams.spiralColor)])
		.interpolate(d3.interpolateRgb); //interpolateHsl interpolateHcl interpolateRgb

	}

//splash screens (for instructions and training)
function createInstructionsSplash(){
	d3.select('body').append('div')
		.attr('id','instructions')
		.attr('class','splash')
		.style('line-height',viewerParams.windowHeight + 'px')
		.style('text-align', 'center')
		.style('font-size','48px')
		.style('cursor','pointer')
		.on('click',function(){
			showSplash('instructions',false)	
		})
		.text('Instructions')
}
function createTrainingSplash(){
	d3.select('body').append('div')
		.attr('id','training')
		.attr('class','splash blink_me')
		.style('line-height',viewerParams.windowHeight + 'px')
		.style('text-align', 'center')
		.style('font-size','48px')
		.style('background-color','rgba(50, 50, 50, 0)')
		.text('Training Model')
		.classed('hidden', true);
}
function showSplash(id, show){
	console.log('showSplash',id, show)
	var op = 0;
	if (show){
		op = 0.99
		d3.select('#'+id).classed('hidden', false)
	}
	d3.select('#'+id).transition().duration(1000)
		.style('background-color','rgba(50, 50, 50,'+op+')')
		.style('opacity',op)
		.on('end',function(){
			if (!show){
				d3.select('#'+id).classed('hidden', true);
			}
		})
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
	viewerParams.spiralImages=[];
	viewerParams.smoothImages=[];
	viewerParams.objDataShown=[];
	d3.select('#spiralN').text('0')
	d3.select('#smoothN').text('0')
	d3.select('#spiralP').html('&mdash;')
	d3.select('#smoothP').html('&mdash;')

	populateField();
}
function init(){
	createInstructionsSplash();
	createTrainingSplash();
	setColorMaps();
	formatBucketText();
	populateField();
	createButtons();
	createCounters();
}


///////////////////////////
// socketio
///////////////////////////
function setViewerParams(vars){
	var keys = Object.keys(vars);
	//var keys = ['objDataShown']
	keys.forEach(function(k){
		viewerParams[k] = vars[k]
	});
	console.log('have params for viewer', viewerParams.objDataShown)

	//update the viewer
	showSplash('training', false)
	showMLResults();
}

function sendToML(){
	//only send if there are enough images in the buckets
	if (viewerParams.spiralImages.length >= 2 && viewerParams.smoothImages.length >= 2){
		showSplash('training', true)
		var ml_input = {
					'objDataShown':viewerParams.objDataShown,
					'spiralImages':viewerParams.spiralImages,
					'smoothImages':viewerParams.smoothImages
					};
		if (viewerParams.usingSocket){
			socketParams.socket.emit('ml_input',ml_input);
		} else {
			setMLParams(ml_input);
		}
	} else {
		//blink red to show the problem
		if (viewerParams.spiralImages.length < 2){
			var x1 = d3.select('#spiralCounter');
			var color = x1.style('background-color')
			x1.transition().duration(500)
				.style('background-color','red')
				.on('end',function(){
					x1.transition().duration(500).style('background-color',color)
				})
		}
		if (viewerParams.smoothImages.length < 2){
			var x2 = d3.select('#smoothCounter');
			var color = x2.style('background-color')
			x2.transition().duration(500)
				.style('background-color','red')
				.on('end',function(){
					x2.transition().duration(500).style('background-color',color)
				})
		}
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
			//request data from server
			socketParams.socket.emit('input_data_request', {data: 'requesting data'});
		});
		socketParams.socket.on('connection_response', function(msg) {
			console.log(msg);
		});		
		// Event handler for server sent data.
		// The callback function is invoked whenever the server emits data
		// to the client. The data is then displayed in the "Received"
		// section of the page.
		//input data
		socketParams.socket.on('input_data_response', function(msg) {
			console.log("data received", msg);
			viewerParams.objData = shuffle(msg);
			init();
		});	
		//updates from ML engine
		socketParams.socket.on('update_viewerParams', function(msg) {
			setViewerParams(msg);
		});

	});
}

//so that it can run locally also without using Flask
function runLocal(){
	viewerParams.usingSocket = false;
	MLParams.usingSocket = false;

	//read in the data
	d3.json('static/data/GZ2data.json')
		.then(function(data) {
			viewerParams.objData = shuffle(data);
			init();
		});
}

///////////////////////////
// runs on load
///////////////////////////

d3.select(window)
	.on('mousemove', handleImageMoves)
	.on('mouseup', finishImageMoves)
	.on('touchmove', handleImageMoves)
	.on('touchend', finishImageMoves)


