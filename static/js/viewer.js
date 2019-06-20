//the text for the budgets
function formatBucketText(){

	d3.select('body').append('img')
		.attr('id', 'backgroundImg')
		.attr('src','static/doc/Whirlpool_IC2006_blend_HD.png')
		.attr('height',viewerParams.windowHeight + 'px')
		.style('position', 'absolute')
		.style('top','0px')
		.style('left','0px')
		.style('z-index','0')
		.on('load', function(){
			var w = parseFloat(d3.select('#backgroundImg').node().getBoundingClientRect().width);
			if (w < viewerParams.windowWidth){
				d3.select('body').append('img')
					.attr('id', 'backgroundImg2')
					.attr('src','static/doc/Whirlpool_IC2006_blend_HD.png')
					.attr('height',viewerParams.windowHeight + 'px')
					.style('position', 'absolute')
					.style('top','0px')
					.style('z-index','0')
					.style('left', viewerParams.windowWidth - w + 'px')
				}
		});

	d3.select('body').append('div')
		.attr('id','spiralText')
		.attr('class','textOutline')
		.text('Spiral')
		.style('font-size',viewerParams.bucketWidth*0.5 + 'px')
		.attr('font-size',viewerParams.bucketWidth*0.5 + 'px')
		.style('position', 'absolute')
		.style('color',viewerParams.spiralColor)
		.style('transform','rotate(90deg)')
		.style('z-index','1')
		.style('margin','20px')

	var w = parseFloat(d3.select('#spiralText').node().getBoundingClientRect().width);
	d3.select('#spiralText')
		.attr('left',-w/2. -20+ 'px')  //why is this 20 and I use 10 below
		.style('left',-w/2. -20+ 'px')  //why is this 20 and I use 10 below
		.style('line-height',viewerParams.windowHeight + 'px')
		.style('text-align','center')


	d3.select('body').append('div')
		.attr('id','smoothText')
		.attr('class','textOutline')
		.text('Smooth')
		.attr('font-size',viewerParams.bucketWidth*0.5 + 'px')
		.style('font-size',viewerParams.bucketWidth*0.5 + 'px')
		.style('position', 'absolute')
		.style('color',viewerParams.smoothColor)
		.style('z-index','1')
		.style('transform','rotate(-90deg)')
		.style('margin','20px')

	var w = parseFloat(d3.select('#smoothText').node().getBoundingClientRect().width);
	d3.select('#smoothText')
		.attr('left',viewerParams.windowWidth - 2.*w - 10 + 'px') //don't understand this
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
	var divWidth0 = Math.min(w - 2.*viewerParams.bucketWidth, viewerParams.objData.length/viewerParams.nImageHeight*viewerParams.imageSize);
	var nImageWidth = Math.floor(divWidth0/viewerParams.imageSize);
	divWidth = nImageWidth*viewerParams.imageSize;
	var xOffset = (w - divWidth)/2. ;
	var yOffset = 0;//(h - divHeight)/2. ;

	viewerParams.imageGridLeft = xOffset;
	viewerParams.imageGridWidth = divWidth;

	//check which ones will be shown
	viewerParams.objData.forEach(function(d,i){
		var left = Math.floor(i/viewerParams.nImageHeight)*viewerParams.imageSize;
		var top = (i % viewerParams.nImageHeight)*viewerParams.imageSize;
		if (left < divWidth){
			d.left0 = left + xOffset;
			d.top0 = top + yOffset;
			d.left = d.left0;
			d.top = d.top0;
			d.large = false;
			d.color = viewerParams.unknownColor;
			d.dragImageSamples = [];
			viewerParams.objDataShownIndex.push(i);

		}
	})

	viewerParams.nSpiral = 0.;
	viewerParams.nSmooth = 0.;
	viewerParams.objDataShownIndex.forEach(function(i){
		var d = viewerParams.objData[i]
		var spiral = 10*d['t04_spiral_a08_spiral_debiased'];
		var smooth = 10*d['t01_smooth_or_features_a01_smooth_debiased'];
		if (spiral > smooth){
			viewerParams.nSpiral += 1.;
		} else {
			viewerParams.nSmooth += 1.;
		}
	});

	console.log('N images available, used', viewerParams.objData.length, viewerParams.objDataShownIndex.length)
	console.log('N spiral, N smooth', viewerParams.nSpiral, viewerParams.nSmooth)
	console.log('image size', viewerParams.imageSize)

	viewerParams.objDataShownIndex.forEach(function(i){
		addImageToField(viewerParams.objData[i])
	})
}

function addActiveImageIndex(d){
	viewerParams.objDataShownIndex.forEach(function(i){
		if (viewerParams.objData[i].id == d.id){
			viewerParams.activeImageIndex.push(i);
		}
	});
}

function addImageToField(d){
	var div = viewerParams.fieldDiv
		.append('div')
		.attr('class','imageField')
		.attr('id',getImageID(d))
		.style('border-style','solid')
		.style('border-width',viewerParams.imageBorderWidth + 'px')
		.style('border-color',d.color)
		.style('width', viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px') 
		.style('height',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('position','absolute')
		.style('left',d.left + 'px')
		.style('top',d.top + 'px')
		.style('z-index',1)

	div.append('img')
		.attr('src','static/data/'+d.image)
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


	div.append('div')
		.attr('id', 'infoBox')
		.style('position','absolute')
		.style('text-align','left')
		.style('color',getComputedStyle(document.documentElement).getPropertyValue('--background-color'))


	//for touch movements
	addHammer(d);

	// svg.selectAll('circle').data(data).enter()
	// .append('circle')
	// 	.attr('cx', function(d){return 2.5*radius*d + offsetX})
	// 	.attr('cy', radius + offsetY)
	// 	.attr('r', radius)
	// 	.attr('stroke', 'black')
	// 	.attr('stroke-width', strokeWidth)
	// 	.attr('fill', function(d){return viewerParams.colorMap(d/10.)});
}
function replaceImageInField(d){
	//add another image to the group
	//select images with same left value and top < image
	var sameRow = [];
	var minTop = 0.;
	if (d.top0 > 0){
		minTop = viewerParams.windowHeight;
		viewerParams.objDataShownIndex.forEach(function(i){
			var dd = viewerParams.objData[i]
			if (dd.left == d.left0 && dd.top < d.top0){
				dd.top0 += viewerParams.imageSize; //reset this here so that it is consistent with style later
				dd.top = dd.top0;
				sameRow.push(dd)
				var x = d3.select('#'+getImageID(dd))
				minTop = Math.min(minTop,  parseFloat(x.style('top')))
			}
		});
	}

	//add an image
	var dd = viewerParams.objData[viewerParams.objDataShownIndex.length]; //I think this is the next one (or else length+1?)
	dd.left0 = d.left0;
	dd.top0 = minTop - viewerParams.imageSize;
	dd.left = dd.left0;
	dd.top = dd.top0;
	dd.large = false;
	dd.color = viewerParams.unknownColor;
	dd.dragImageSamples = [];
	viewerParams.objDataShownIndex.push(viewerParams.objDataShownIndex.length);
	sameRow.push(dd);
	addImageToField(dd);

	dd.top0 += viewerParams.imageSize; //reset this here so that it is consistent with style later
	dd.top = dd.top0;

	//move the images in that row
	sameRow.forEach(function(dd,i){
		var x = d3.select('#'+getImageID(dd))
		var top = parseFloat(x.style('top'));
		x.transition().ease(d3.easeBounceOut).duration(400)
			.style('top',top+viewerParams.imageSize + 'px')
	});
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
		.style('margin','0px')
		.style('margin-top',viewerParams.buttonMargin + 'px')
		.style('margin-bottom',viewerParams.buttonMargin + 'px')
		.text('Train Model')
		.on('mousedown',sendToML)
		.on('touchStart',sendToML)

	d3.select('body').append('div')
		.attr('id','resetButton')
		.attr('class', 'buttonDiv')
		.style('height', hb + 'px') 
		.style('font-size', hb*0.75 + 'px')
		.style('line-height', hb + 'px')
		.style('text-align','center')
		.style('position','absolute')
		.style('margin','0px')
		.style('margin-top',viewerParams.buttonMargin + 'px')
		.style('margin-bottom',viewerParams.buttonMargin + 'px')
		.text('Reset')
		.on('mousedown',reset)
		.on('touchStart',reset)

	d3.select('body').append('div')
		.attr('id','helpButton')
		.attr('class', 'buttonDiv')
		.style('height', hb + 'px') 
		.style('width', hb +'px')
		.style('font-size', hb*0.75 + 'px')
		.style('line-height', hb + 'px')
		.style('text-align','center')
		.style('position','absolute')
		.style('margin','0px')
		.style('margin-top',viewerParams.buttonMargin + 'px')
		.style('margin-bottom',viewerParams.buttonMargin + 'px')
		.text('?')
		.on('mousedown',function(){showSplash('instructions',true)	})
		.on('touchStart',function(){showSplash('instructions',true)	})

	var wh = parseFloat(d3.select('#helpButton').node().getBoundingClientRect().width);
	var w = parseFloat(d3.select('#trainingButton').node().getBoundingClientRect().width);
	var h = parseFloat(d3.select('#trainingButton').node().getBoundingClientRect().height);

	//center
	var offset = 10 + 8 + 4 ; //for box shadow, border, padding
	d3.select('#helpButton')
		.style('left',(viewerParams.windowWidth)/2. - wh/2. -2 + 'px')  //why the extra -2? (need to center at least to my eye)
		.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
		.style('border-radius', h/2 + 'px')

	//right
	d3.select('#trainingButton')
		.style('left',(viewerParams.windowWidth)/2. + wh/2. + offset/2. -2 + 'px')   //-2 from above
		.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
		.style('width', w +'px') 
		.style('border-radius', h/2 + 'px')

	//left
	d3.select('#resetButton')
		.style('left',(viewerParams.windowWidth)/2. - w  - wh/2. - offset -2  +'px')  //-2 from above
		.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
		.style('width', w  +'px') //to make things symmetric by allow white circle of help to be in center
		.style('border-radius', h/2 + 'px')


}

function createCounters(){
	var h = parseFloat(d3.select('#helpButton').node().getBoundingClientRect().height);
	var t = parseFloat(d3.select('#helpButton').style('top'));

	var spiralCounter = d3.select('body').append('div')
		.attr('id','spiralCounter')
		.attr('class', 'counterDiv')
		.style('height', viewerParams.buttonHeight + 'px')
		.style('position','absolute')
		.style('margin','0px')
		.style('margin-top',viewerParams.buttonMargin + 'px')
		.style('margin-bottom',viewerParams.buttonMargin + 'px')
		.style('border-width','4px')
		.style('border-radius', h/2 + 'px')
		.style('top', t + 'px')
	spiralCounter.append('div')
		.attr('id','spiralN')
		.style('position','absolute')
		.style('top', '0px')
		.style('font-size', viewerParams.buttonHeight*0.75 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.75 + 'px')
		.style('text-align','center')
		.text(viewerParams.spiralImages.length)
	spiralCounter.append('div')
		.attr('id','spiralNtext')
		.style('position','absolute')
		.style('top', viewerParams.buttonHeight*0.75 + 'px')
		.style('font-size', viewerParams.buttonHeight*0.25 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.25 + 'px')
		.style('text-align','center')
		.style('padding-right', '10px')
		.text('# spiral images in model')
	spiralCounter.append('div')
		.attr('id','spiralP')
		.style('position','absolute')
		.style('top', '0px')
		.style('font-size', viewerParams.buttonHeight*0.75 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.75 + 'px')
		.style('text-align','center')
		.html('&mdash;')
	spiralCounter.append('div')
		.attr('id','spiralPtext')
		.style('position','absolute')
		.style('top', viewerParams.buttonHeight*0.75 + 'px')
		.style('font-size', viewerParams.buttonHeight*0.25 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.25 + 'px')
		.style('text-align','center')
		.text('spiral agreement')


	var smoothCounter = d3.select('body').append('div')
		.attr('id','smoothCounter')
		.attr('class', 'counterDiv')
		.style('height', viewerParams.buttonHeight + 'px')
		.style('position','absolute')
		.style('margin','0px')
		.style('margin-top',viewerParams.buttonMargin + 'px')
		.style('margin-bottom',viewerParams.buttonMargin + 'px')
		.style('border-width','4px')
		.style('border-radius', h/2 + 'px')
		.style('top', t + 'px')
	smoothCounter.append('div')
		.attr('id','smoothN')
		.style('position','absolute')
		.style('top', '0px')
		.style('font-size', viewerParams.buttonHeight*0.75 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.75 + 'px')
		.style('text-align','center')
		.text(viewerParams.smoothImages.length)
	smoothCounter.append('div')
		.attr('id','smoothNtext')
		.style('position','absolute')
		.style('top', viewerParams.buttonHeight*0.75 + 'px')
		.style('font-size', viewerParams.buttonHeight*0.25 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.25 + 'px')
		.style('text-align','center')
		.style('padding-left', '10px')
		.text('# smooth images in model')
	smoothCounter.append('div')
		.attr('id','smoothP')
		.style('position','absolute')
		.style('top', '0px')
		.style('font-size', viewerParams.buttonHeight*0.75 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.75 + 'px')
		.style('text-align','center')
		.html('&mdash;')
	smoothCounter.append('div')
		.attr('id','smoothPtext')
		.style('position','absolute')
		.style('top', viewerParams.buttonHeight*0.75 + 'px')
		.style('font-size', viewerParams.buttonHeight*0.25 + 'px')
		.style('line-height', viewerParams.buttonHeight*0.25 + 'px')
		.style('text-align','center')
		.text('smooth agreement')

	//sizes and positions for the counters
	leftReset = parseFloat(d3.select('#resetButton').style('left'));
	leftTraining = parseFloat(d3.select('#trainingButton').style('left'));
	widthTraining = parseFloat(d3.select('#trainingButton').style('width'))+ 10 + 8 + 4 ; //for box shadow, border, padding?
	widthReset = parseFloat(d3.select('#resetButton').style('width'))+ 10 + 8 + 4 ; //for box shadow, border, padding?

	//positions of the grid
	var maxLeft = 0.;
	var minLeft = viewerParams.windowWidth;
	viewerParams.objDataShownIndex.forEach(function(i){
		var d = viewerParams.objData[i]
		maxLeft = Math.max(maxLeft, d.left0 + viewerParams.imageSize);
		minLeft = Math.min(minLeft, d.left0);
	})

	var w1 = leftReset - minLeft - 12; //2x4 for border, 2x2 for padding
	d3.select('#spiralCounter')
		.style('width',w1 + 'px') 
		.style('left', minLeft + 'px')
	d3.select('#spiralN')
		.style('width', w1/2 + 'px')
		.style('left',  w1/2 + 'px')
	d3.select('#spiralNtext')
		.style('width', w1/2 + 'px')
		.style('left', w1/2 - 6 + 'px')//so that there's room for the text given curved border
	d3.select('#spiralP')
		.style('width', w1/2 + 'px')
		.style('left', '0px')
	d3.select('#spiralPtext')
		.style('width', w1/2 + 'px')
		.style('left', '0px')

	var w2 = maxLeft - leftTraining - widthTraining -12; //2x4 for border, 2x2 for padding
	d3.select('#smoothCounter')
		.style('width',w2 + 'px')
		.style('left', leftTraining + widthTraining + 'px')
	d3.select('#smoothN')
		.style('width', w2/2 + 'px')
		.style('left', '0px')
	d3.select('#smoothNtext')
		.style('width', w2/2 + 'px')
		.style('left', '0px')
	d3.select('#smoothP')
		.style('width', w2/2 + 'px')
		.style('left',  w2/2 + 'px')
	d3.select('#smoothPtext')
		.style('width', w2/2 + 'px')
		.style('left',  w2/2 - 10 + 'px')//so that there's room for the text given curved border

	// var w1 = parseFloat(d3.select('#spiralCounter').style('left')) - minLeft -6;//4 for border, 2 for padding;
	// d3.select('#spiralPercent')
	// 	.style('width',w1 + 'px')
	// 	.style('left',minLeft -2 + 'px')//4 for border, 2x2 for padding
	// 	.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
	// 	.style('border-radius', h/2 + 'px 0px 0px ' + h/2 + 'px')

	// var x = d3.select('#smoothCounter')
	// //var w2 = maxLeft - (parseFloat(x.style('left')) + parseFloat(x.style('width')) ) -12 +2;//2x4 for border, 2x2 for padding, and overlap borders;
	// d3.select('#smoothPercent')
	// 	.style('width',w1 + 'px')
	// 	.style('left',maxLeft - w1 + 'px')//2 for padding
	// 	.style('top', viewerParams.windowHeight - h - 2.*viewerParams.buttonMargin + 'px')
	// 	.style('border-radius', '0px ' + h/2 + 'px ' +h/2 + 'px 0px')


}
function getImageID(d){
	return d.image.split('.').join('').split('/').join('');
}
function growImage(d){
	d.large = true
	var top = d3.select('#'+getImageID(d)).style('top')
	var left = d3.select('#'+getImageID(d)).style('left')
	var s1 = viewerParams.imageGrowSize/30.;
	var s2 = viewerParams.imageGrowSize/25.;
	var bC = d.color;
	if (bC == viewerParams.unknownColor){		
		bC = 'gray';//getComputedStyle(document.documentElement).getPropertyValue('--background-color')
	}
	d3.select('#'+getImageID(d))
		.style('z-index',10)
	d3.select('#'+getImageID(d)).transition().duration(200)
		.style('height',viewerParams.imageGrowSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('width',viewerParams.imageGrowSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('margin-top', (viewerParams.imageSize - viewerParams.imageGrowSize) + 'px')
		.style('margin-left', (viewerParams.imageSize - viewerParams.imageGrowSize) + 'px')
		.style('border-color',bC)
		.style('box-shadow', s1 + 'px ' + s1 + 'px ' + s2 + 'px ' + s2 + 'px rgb(20,20,20)')
		.on('end', function(){
			populateStats(d);
		})

	d3.select('#'+getImageID(d)).select('img').transition().duration(200)
		.attr('height',viewerParams.imageGrowSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.attr('width',viewerParams.imageGrowSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
	
}
function shrinkImage(d){
	d.large = false;
	//cancel any transitions
	d3.selectAll('#'+getImageID(d)).interrupt(); 
	d3.select('#'+getImageID(d)).select('img').interrupt();

	//for some reason, the transitions don't work for the outer div here?
	d3.select('#'+getImageID(d))//.transition().duration(200)
		.style('height',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('width',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.style('margin-top', '0px')
		.style('margin-left', '0px')
		.style('border-width',viewerParams.imageBorderWidth + 'px')

	//highlight them (?)
	var s1 = viewerParams.imageSize/20.;
	var s2 = viewerParams.imageSize/10.;
	var bC = d.color;
	if (bC == viewerParams.unknownColor) bC = 'gray';
	d3.select('#'+getImageID(d))
		.style('border-color',bC)
		//.style('box-shadow', 'none')
		.style('box-shadow', s1 + 'px ' + s1 + 'px ' + s2 + 'px ' + s2 + 'px rgb(20,20,20)')

	d3.select('#'+getImageID(d)).select('img')//.transition().duration(200)
		.attr('height',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
		.attr('width',viewerParams.imageSize - viewerParams.imageSepFac*viewerParams.imageBorderWidth + 'px')
	d3.select('#'+getImageID(d)).select('#infoBox').html('')
	d3.select('#'+getImageID(d)).selectAll('svg').remove();

}

function growBucket(bucket, growFac=1.2){
	tSize = parseFloat(d3.select('#'+bucket).attr('font-size'));
	left = parseFloat(d3.select('#'+bucket).attr('left'));
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
}
//for touch/mouse events
function addHammer(d) {
	var element = document.getElementById(getImageID(d))

	var hammerOptions = {
	/*
	touchAction: 'auto'
	*/
	};

	var mc = new Hammer.Manager(element, hammerOptions);
	mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
	mc.add(new Hammer.Press({ event:"press", time:100 }));
	mc.on("pan", onPan);
	mc.on("panend", onPanend)
	mc.on("press", onPress)
	mc.on("pressup", onPressup)

	d['hammer'] = mc;



	function onPress(e){
		growImage(d);
		moveImage(e, d);

	}

	function onPressup(e){
		shrinkImage(d);
	}

	function onPan(e) {
		if (!d.large) growImage(d)
		if (e.type != "panend") moveImage(e, d)
	}

	function onPanend(e) {
		var left = parseFloat(d3.select('#'+getImageID(d)).style('left'))
		var top = parseFloat(d3.select('#'+getImageID(d)).style('top'))	
		shrinkImage(d);

		var finalX = left + e.velocityX*viewerParams.imageInertiaN;
		var finalY = top + e.velocityY*viewerParams.imageInertiaN;
		if (!finalX || !finalY){
			finalX = left;
			finalY = top;
		}
		finalMove(d, finalX, finalY, viewerParams.imageInertiaN)

	}

}
function moveImage(e, d){
	var position = [e.center.x, Math.min(Math.max(e.center.y, viewerParams.imageGrowSize - viewerParams.imageSize), viewerParams.windowHeight - viewerParams.imageSize)]; //I don't understand the first bit within the max, but it works...

	//sometimes there is a mistake somewhere?
	if (position[0] != 0 && position[1] != 0){
		d.left = position[0];
		d.top = position[1];
		d3.select('#'+getImageID(d))
			.style('left', d.left + 'px')
			.style('top', d.top + 'px')
	}
}

function checkBucket(xpos, d){
	var bucket = null;
	if (xpos <= viewerParams.windowWidth*viewerParams.bucketSuction){ //spiral bucket
		bucket = "spiralText";
	}
	if (xpos >= viewerParams.windowWidth*(1. - viewerParams.bucketSuction) ){ //smooth bucket
		bucket = "smoothText";
	}
	if (bucket != null){ 
		viewerParams.modelUpdateNeeded = true;
		var checkSpiral = viewerParams.spiralImages.indexOf(d);
		var checkSmooth = viewerParams.smoothImages.indexOf(d);
		if (checkSpiral == -1 && checkSmooth == -1){
			if (bucket == "spiralText") viewerParams.spiralImages.push(d);
			if (bucket == "smoothText") viewerParams.smoothImages.push(d);
			growBucket(bucket);
			replaceImageInField(d);		
		}
		return true;
	} else {
		return false
	}
}


function finalMove(d, finalX, finalY, duration, easeFunc = d3.easePolyOut.exponent(1.5)){

	var easeFunc = d3.easePolyOut.exponent(1.5);

	var inBucket = false;
	d3.select('#'+getImageID(d)).transition().ease(easeFunc).duration(duration)
	    .tween("position", function(dd) {
			var div = d3.select(this);
			var startLeft = parseInt(div.style('left'));  
			var startTop = parseInt(div.style('top'));
			var xInterp = d3.interpolateRound(startLeft, finalX);
			var yInterp = d3.interpolateRound(startTop, finalY);
			return function(t) {       
				d.left = xInterp(t);
				d.top = Math.abs(yInterp(t)); 
				if (Math.abs(yInterp(t)) > (viewerParams.windowHeight - viewerParams.imageSize)){
					d.top = 2.*(viewerParams.windowHeight - viewerParams.imageSize) - Math.abs(yInterp(t));
				}    
				div.style("left", d.left + "px");
				div.style("top", d.top + "px");
				inBucket = checkBucket(xInterp(t), d);
			};
		})
		.on('end', function(){
			if (!inBucket){
				d3.select('#'+getImageID(d)).style('z-index',2)
			}
		})
}


/////////////////////
//for the Zooniverse stats
function makeStatsPlot(id, clipID, value, radius, strokeWidth, offsetX, colorMap){
	var bW = parseFloat(d3.select('#'+id).style('border-width'))
	var div = d3.select('#'+id);
	var height = parseFloat(div.style('height')) + 2.*bW; 
	var width = parseFloat(div.style('width'));
	var left = parseFloat(div.style('left'));
	var top = parseFloat(div.style('top'));

	var sWidth = 0;//viewerParams.imageBorderWidth;

	var svg = div.append("svg")
		.style('width', 2*radius + 2*sWidth + 'px')
		.style('height', height + 'px')
		.style('position', 'absolute')
		.style('top',-bW + 'px') 
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

//for galaxy information
function showGalaxyInfo(img){

	var dd = d3.select('#'+getImageID(img))

	var infoStr = 'RA : ' + img.rastring +
				'<br/> Dec : ' + img.decstring +
				'<br/> <div id="zooName" style="display:inline-block">Zooniverse</div> : '+
				Math.round(100*img['t04_spiral_a08_spiral_debiased']) + '% spiral / ' +
				Math.round(100*img['t01_smooth_or_features_a01_smooth_debiased']) + '% smooth'

	dd.select('#infoBox')
		.style('font-size',viewerParams.imageGrowSize/20. + 'px')
		.style('line-height',viewerParams.imageGrowSize/15. + 'px')
		.html(infoStr)

	if (img.hasOwnProperty('results')){
		var w = parseFloat(dd.select('#zooName').node().getBoundingClientRect().width);
		var MLsmooth = 0;
		var MLspiral = 0;
		img.results.forEach(function(x){
			if (x.label == 'spiral') MLspiral = Math.round(100.*x.confidence);
			if (x.label == 'smooth') MLsmooth = Math.round(100.*x.confidence);
		})
		infoStr += '<br/> <div style="display:inline-block; width:'+w+'px">Computer</div> : ' + 
			MLspiral + '% spiral / ' + MLsmooth + '% smooth'
		dd.select('#infoBox').html(infoStr)
	}

	var w = parseFloat(dd.select('#infoBox').node().getBoundingClientRect().width);
	var h = parseFloat(dd.select('#infoBox').node().getBoundingClientRect().height);
	dd.select('#infoBox')
		.style('left','2px')
		.style('top',viewerParams.imageGrowSize - viewerParams.imageBorderWidth - h - 6  + 'px');//why do I need the extra offset here??
}

function populateStats(img){

	var radius = (viewerParams.imageGrowSize/10.)/2.5;

	var spiral = 10*img['t04_spiral_a08_spiral_debiased'];
	var smooth = 10*img['t01_smooth_or_features_a01_smooth_debiased'];
	console.log("spiral, smooth", spiral, smooth, img)
	
	showGalaxyInfo(img);

	var bW = parseFloat(d3.select('#'+getImageID(img)).style('border-width'))

	//I don't understand the x offset!
	makeStatsPlot(getImageID(img), getImageID(img)+'SpiralClip', spiral, radius, 1, -2*radius - 1.1*bW, viewerParams.spiralColorMap)
	makeStatsPlot(getImageID(img), getImageID(img)+'SmoothClip', smooth, radius, 1, viewerParams.imageGrowSize - 1.5*bW, viewerParams.smoothColorMap)

	// d3.select('#'+getImageID(img))
	// 	.on('mouseup',function(){shrinkImage(img)})
	// 	.on('touchend',function(){shrinkImage(img)})

}

function showMLResults(){
	viewerParams.nSpiralAgree = 0.;
	viewerParams.nSmoothAgree = 0.;
	viewerParams.nSpiral = 0.;
	viewerParams.nSmooth = 0.;
	viewerParams.objDataShownIndex.forEach(function(i){
		var d = viewerParams.objData[i]
		var spiral = 10*d['t04_spiral_a08_spiral_debiased'];
		var smooth = 10*d['t01_smooth_or_features_a01_smooth_debiased'];
		if (spiral > smooth){
			viewerParams.nSpiral += 1.;
		} else {
			viewerParams.nSmooth += 1.;
		}
		console.log(d.results)
		if (d.results && d.results[0]) {
			
			d.color = viewerParams.unknownColor;
			if (d.results[0].label == "spiral"){
				d.color = viewerParams.spiralColorMap(d.results[0].confidence);
				if (spiral > smooth){
					d.agree = true;
					viewerParams.nSpiralAgree += 1;
				} else {
					d.agree = false;
				}
			}
			if (d.results[0].label == "smooth"){
				d.color = viewerParams.smoothColorMap(d.results[0].confidence);
				if (smooth > spiral){
					d.agree = true;
					viewerParams.nSmoothAgree += 1;
				} else {
					d.agree = false;
				}
			}
			console.log(d.agree)
			d3.select('#'+getImageID(d)).transition().duration(1000)
				.style('border-color',d.color)
				.on('end', function(){
					if (d.agree){
						d3.select('#'+getImageID(d)).select('#textBox').text('')
					} else{
						d3.select('#'+getImageID(d)).select('#textBox').text('X')
					}
				})


		}
		if (i == viewerParams.objDataShownIndex.length-1){
			//show the percent agreement (will have some way to display on screen later)
			//NOTE: I think this will also include the training set (but is that a problem?)
			d3.select('#spiralP').html(Math.round(viewerParams.nSpiralAgree/viewerParams.nSpiral*100.)+'%')
			d3.select('#smoothP').html(Math.round(viewerParams.nSmoothAgree/viewerParams.nSmooth*100.)+'%')
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
	var instr = d3.select('body').append('div')
		.attr('id','instructions')
		.attr('class','splash')
		.style('width','100%')
		.style('cursor','pointer')
		.on('click',function(){showSplash('instructions',false)	})
		.on('touchstart',function(){showSplash('instructions',false)	})
		//.text('Instructions')

	var fs = viewerParams.windowHeight/35;
	var fsN = viewerParams.windowHeight/15;
	var yOffset = fs;
	var imageTop = fsN + 3.*yOffset;
	var stepsTop = fsN + 3.*yOffset + 75;
	var stepsLeft = 10;
	var stepsWidth = viewerParams.windowWidth/2.5;

	var instTitle = instr.append('div')
		.attr('id', 'instructionsTitle')
		.style('position', 'absolute')
		.style('top', '10px')
		.style('left','10px')
		.style('width',viewerParams.windowWidth - 20 + 'px')
		.style('height', fsN + 'px')	
		.style('text-align', 'center')
		.style('line-height',fsN +'px')
		.style('font-size',fsN +'px')
		.text("Hi! Please help me to classify these galaxies...")


	var instr1 = instr.append('div')
		.attr('id', 'instructionsStep1')
		.style('position', 'absolute')
		.style('top', stepsTop + 'px')
		.style('left',stepsLeft + 'px')
		.style('width', stepsWidth + 'px')
	instr1.append('div')
		.attr('id','instructionsStepN')
		.style('position','absolute')
		.style('left',0)
		.style('top',0)
		.style('width',1.1*fsN + 'px')
		.style('text-align', 'center')
		.style('line-height',fsN +'px')
		.style('font-size',fsN +'px')
		.html('&#10102;')
	instr1.append('div')
		.attr('id','instructionsStep1Text')
		.style('position','absolute')
		.style('left',1.1*fsN+'px')
		.style('top',0)
		.style('width',stepsWidth - 1.1*fsN + 'px')
		.style('text-align', 'left')
		.style('line-height',1.1*fs + 'px')
		.style('font-size',fs +'px')
		.text('Touch a square to see how the Zooniverse volunteers classified the galaxy.')
	var h1 = parseFloat(d3.select('#instructionsStep1Text').node().getBoundingClientRect().height) + yOffset;
	d3.select('#instructionsStep1Text').style('height', h1 + 'px')

	var instr2 = instr.append('div')
		.attr('id', 'instructionsStep2')
		.style('position', 'absolute')
		.style('top',stepsTop + h1 + 'px')
		.style('left', stepsLeft + 'px')
		.style('width',stepsWidth + 'px')
	instr2.append('div')
		.attr('id','instructionsStep2N')
		.style('position','absolute')
		.style('left',0)
		.style('top',0)
		.style('width',1.1*fsN + 'px')
		.style('text-align', 'center')
		.style('line-height',fsN +'px')
		.style('font-size',fsN +'px')
		.html('&#10103;')
	instr2.append('div')
		.attr('id','instructionsStep2Text')
		.style('position','absolute')
		.style('left',1.1*fsN+'px')
		.style('top',0)
		.style('width',stepsWidth - 1.1*fsN + 'px')
		.style('text-align', 'left')
		.style('line-height',1.1*fs + 'px')
		.style('font-size',fs +'px')
		.text('Slide the galaxy into either the spiral or smooth side.  These will be my "training set".')
	var h2 = parseFloat(d3.select('#instructionsStep2Text').node().getBoundingClientRect().height) + yOffset;
	d3.select('#instructionsStep2Text').style('height', h2 + 'px')

	var instr3 = instr.append('div')
		.attr('id', 'instructionsStep3')
		.style('position', 'absolute')
		.style('top',stepsTop + h1 + h2 + 'px')
		.style('left', stepsLeft + 'px')
		.style('width',stepsWidth + 'px')
	instr3.append('div')
		.attr('id','instructionsStep3N')
		.style('position','absolute')
		.style('left',0)
		.style('top',0)
		.style('width',1.1*fsN + 'px')
		.style('text-align', 'center')
		.style('line-height',fsN +'px')
		.style('font-size',fsN +'px')
		.html('&#10104;')
	instr3.append('div')
		.attr('id','instructionsStep3Text')
		.style('position','absolute')
		.style('left',1.1*fsN+'px')
		.style('top',0)
		.style('width',stepsWidth - 1.1*fsN + 'px')
		.style('text-align', 'left')
		.style('line-height',1.1*fs + 'px')
		.style('font-size',fs +'px')
		.text('After you have at least 2 images in each category.  Click the "Train Model" button at the bottom, and I\'ll get to work!  (I use a "Machine Learning" model developed by Google.)')	
	var h3 = parseFloat(d3.select('#instructionsStep3Text').node().getBoundingClientRect().height) + yOffset;
	d3.select('#instructionsStep3Text').style('height', h3 + 'px')

	var instr4 = instr.append('div')
		.attr('id', 'instructionsStep4')
		.style('position', 'absolute')
		.style('top',stepsTop + h1 + h2 + h3 + 'px')
		.style('left', stepsLeft + 'px')
		.style('width',stepsWidth + 'px')
	instr4.append('div')
		.attr('id','instructionsStep4N')
		.style('position','absolute')
		.style('left',0)
		.style('top',0)
		.style('width',1.1*fsN + 'px')
		.style('text-align', 'center')
		.style('line-height',fsN +'px')
		.style('font-size',fsN +'px')
		.html('&#10105;')
	instr4.append('div')
		.attr('id','instructionsStep4Text')
		.style('position','absolute')
		.style('left',1.1*fsN+'px')
		.style('top',0)
		.style('width',stepsWidth - 1.1*fsN + 'px')
		.style('text-align', 'left')
		.style('line-height',1.1*fs + 'px')
		.style('font-size',fs +'px')
		.text('After I\'m finished, you will see an "X" over any galaxies where I disagree with the Zooniverse volunteers.  Look at these, and maybe add them to my "training set" to help me learn.  When you\'re ready, click the "Train Model" button again to see if I can do better.')	
	var h4 = parseFloat(d3.select('#instructionsStep4Text').node().getBoundingClientRect().height) + yOffset;
	d3.select('#instructionsStep4Text').style('height', h4 + 'px')

	var instBottom = instr.append('div')
		.attr('id', 'instructionsBottom')
		.style('position', 'absolute')
		// .style('top', viewerParams.windowHeight - fsN - 20 + 'px')
		// .style('left','10px')
		// .style('width',viewerParams.windowWidth - 20 + 'px')
		// .style('text-align', 'center')
		.style('top',stepsTop + h1 + h2 + h3 + h4 + 'px')
		.style('left',stepsLeft + 1.1*fsN + 'px')
		.style('width',stepsWidth + 'px')
		.style('text-align', 'left')
		.style('height', fsN + 'px')	
		.style('line-height',fsN +'px')
		.style('font-size',fsN +'px')
		.text("Touch anywhere to begin.")

	var imgWidth = viewerParams.windowWidth - stepsWidth - stepsLeft - 20;

	//https://davidwalsh.name/css-flip
	var flipper = instr.append('div')
		.attr('id','instructionsImages')
		.attr('class','flip-container')
		.style('position', 'absolute')
		.style('top',imageTop + 'px')
		.style('left', stepsLeft + stepsWidth + 10 + 'px')
		.style('width',imgWidth + 'px')
		.append('div')
			.attr('class', 'flipper')


	var instImg1 = flipper.append('div')
		.attr('id', 'instructionsImage1')
		.attr('class', 'front')
		.append('img')
			.attr('src','static/doc/annotatedScreenShot1.png')
			.attr('width',imgWidth + 'px')

	var instImg2 = flipper.append('div')
		.attr('id', 'instructionsImage2')
		.attr('class', 'back')
		.append('img')
			.attr('src','static/doc/annotatedScreenShot2.png')
			.attr('width',imgWidth + 'px')	

	setInterval(function(){ d3.select("#instructionsImages").node().classList.toggle("flip") }, 15000);

}

function createLearnMoreTabs(){
	//gray background to cover rest of table
	d3.select('body').append('div')
		.attr('id','blankSplash')
		.attr('class','splash')
		.style('width','100%')
		.style('cursor','pointer')
	showSplash('blankSplash', false)

	var fs = viewerParams.windowHeight/35;
	var fsL = viewerParams.windowHeight/25;
	//Zooniverse
	d3.select('body').append('div')
		.attr('id','learnMoreZooniverseTab')
		.attr('class','tab')
		.style('cursor','pointer')
		.style('position','absolute')
		.style('height',1.1*fsL+'px')
		.style('left','20px')
		.style('text-align', 'left')
		.style('line-height',1.1*fsL +'px')
		.style('font-size',fsL +'px')
		.style('padding','10px')
		.style('border', 'solid white')
		.style('border-width', '2px 2px 0px 2px')
		.style('border-radius', '0px 20px 0px 0px')
		.text('What is Zooniverse?')
		.on('click', function(){showHideTab('zooniverseTab')})
		.on('touchstart', function(){showHideTab('zooniverseTab')})
	var wZ = parseFloat(d3.select('#learnMoreZooniverseTab').node().getBoundingClientRect().width);
	var hZ = parseFloat(d3.select('#learnMoreZooniverseTab').node().getBoundingClientRect().height);
	d3.select('#learnMoreZooniverseTab')
		.style('width',wZ+'px')
		.style('top', viewerParams.windowHeight - hZ + 'px')

	var zoo = d3.select('body').append('div')
		.attr('id','zooniverseTab')
		.attr('class','tab')
		.style('height',viewerParams.windowHeight - hZ + 'px')
		.style('width',viewerParams.windowWidth - 4 + 'px') //to show the border
		.style('cursor','pointer')
		.style('position','absolute')
		.style('border', '2px solid white')
		.style('top',viewerParams.windowHeight + 'px')
		.style('z-index',51)
		.on('click',function(){showHideTab('zooniverseTab')})
		.on('touchstart',function(){showHideTab('zooniverseTab')})

	zoo.append('img')
		.attr('src','static/doc/zooniverse-word-teal.png')
		.attr('id','zooImage')
		.style('width',viewerParams.windowWidth/2. + 'px')
		.style('padding','10px')
	var hZim = parseFloat(d3.select('#zooImage').node().getBoundingClientRect().height);
	zoo.append('div')
		.style('top',hZim + 'px')
		.style('line-height',1.1*fs +'px')
		.style('font-size',fs +'px')
		.style('padding','10px')
		.text("is home to some of the internet's largest, most popular and most successful citizen science projects. The organization grew from the original Galaxy Zoo project and now hosts dozens of projects which allow volunteers to participate in crowdsourced scientific research. It has headquarters at Oxford University and the Adler Planetarium.")

	//Machine Learning
	d3.select('body').append('div')
		.attr('id','learnMoreMLTab')
		.attr('class','tab')
		.style('cursor','pointer')
		.style('position','absolute')
		.style('height',1.1*fsL+'px')
		.style('left',60 + wZ + 'px')
		.style('text-align', 'left')
		.style('line-height',1.1*fsL +'px')
		.style('font-size',fsL +'px')
		.style('padding','10px')
		.style('border', 'solid white')
		.style('border-width', '2px 2px 0px 2px')
		.style('border-radius', '0px 20px 0px 0px')
		.text('What is Machine Learning?')
		.on('click', function(){showHideTab('MLTab')})
		.on('touchstart', function(){showHideTab('MLTab')})
	var wM = parseFloat(d3.select('#learnMoreMLTab').node().getBoundingClientRect().width);
	var hM = parseFloat(d3.select('#learnMoreMLTab').node().getBoundingClientRect().height);
	d3.select('#learnMoreMLTab')
		.style('width',wM+'px')
		.style('top', viewerParams.windowHeight - hM + 'px')


	var ml = d3.select('body').append('div')
		.attr('id','MLTab')
		.attr('class','tab')
		.style('height',viewerParams.windowHeight - hM + 'px')
		.style('width',viewerParams.windowWidth - 4 + 'px') //to show the border
		.style('cursor','pointer')
		.style('position','absolute')
		.style('border', '2px solid white')
		.style('top',viewerParams.windowHeight + 'px')
		.style('z-index',51)
		.on('click',function(){showHideTab('MLTab')})
		.on('touchstart',function(){showHideTab('MLTab')})

	ml.append('img')
		.attr('src','static/doc/machine-learning-teal.png')
		.attr('id','zooImage')
		.style('position', 'absolute')
		.style('left', viewerParams.windowWidth/2. + 'px')
		.style('width',viewerParams.windowWidth/2. + 'px')
		.style('padding','10px')

	ml.append('div')
		.attr('id','MLtabText')
		.style('position', 'absolute')
		.style('left',0)
		.style('top',0)
		.style('line-height',1.1*fs +'px')
		.style('width',viewerParams.windowWidth/2 + 'px') //to show the border
		.style('font-size',fs +'px')
		.style('padding','10px')
		.html('Machine learning is the science (and art) of programming computers so they can learn from data.  Machine Learning is part of the larger field of artificial intelligence (AI) that focuses on teaching computers how to learn without the need to be programmed for specific tasks. <br/> <br/> Our application here uses a machine learning model developed by Google, called TensorFlow.  And more specifically, we are using a "MobileNet" version, which has been developed to work well with images. <br/><br/> A machine learning model requires a "training set".  In this application our training set is a group of images of either spiral or smooth galaxies -- determined by you.  When you "train" the model, the computer uses different features in these training images to "learn" what defines a spiral or smooth galaxy. Afterwards the computer can compare the same features of a new image to classify it as either spiral or smooth on its own.<br/><br/> You will notice that sometimes the computer gets the classification wrong.  Often the computer\'s ability to classify images correctly can be improved by increasing the training set, and including a more diverse set of images in the training set.')

	//not working here for some reason
	// //make the text fill the screen
	// var fsM = fs;
	// var x = d3.select('#MLtabText');
	// var h = parseFloat(x.node().getBoundingClientRect().height);
	// var Ntrial = 0
	// while (h < 0.9*viewerParams.windowHeight && Ntrial < 1000){
	// 	console.log(h, fsM, viewerParams.windowHeight)
	// 	fsM+=1
	// 	x.style('font-size',fsM+'px')
	// 	w = parseFloat(x.node().getBoundingClientRect().height);
	// 	Ntrial += 1;
	// }

}

function showHideTab(id){


	//check if already showing
	show = true
	var check = parseFloat(d3.select('#learnMore'+id).style('top'))
	if (check == 0) show = false;

	console.log('showing tab', id, show)
	var top, topTab;

	if (show){
		top = parseFloat(d3.select('#learnMore'+id).node().getBoundingClientRect().height);
		topTab = 0;		
		showSplash('blankSplash', true)
	} else {
		topTab = viewerParams.windowHeight - parseFloat(d3.select('#learnMore'+id).node().getBoundingClientRect().height);
		top = viewerParams.windowHeight
		showSplash('blankSplash', false)
	} 

	d3.select('#'+id).transition().duration(1000)
		.style('top',top + 'px')
	d3.select('#LearnMore'+id).transition().duration(1000)
		.style('top',topTab + 'px')
}

function createTrainingSplash(){
	var fs = 48;
	d3.select('body').append('div')
		.attr('id','trainingSplash')
		.attr('class','splash ')
		.style('background-color','rgba(50, 50, 50, 0)')
		.style('width','')
		.append('div')
			.attr('id','trainingDivText')
			.attr('class','blink_me')
			.style('font-size',fs+'px')
			.style('line-height',viewerParams.windowHeight + 'px')
			.style('text-align', 'center')
			.text("My turn to classify!")

	//make the text fill the screen
	var x = d3.select('#trainingDivText');
	var w = parseFloat(x.node().getBoundingClientRect().width);
	var Ntrial = 0
	while (w < 0.9*viewerParams.windowWidth && Ntrial < 1000){
		fs+=1
		x.style('font-size',fs+'px')
		w = parseFloat(x.node().getBoundingClientRect().width);
		Ntrial += 1;
		if (w >= 0.9*viewerParams.windowWidth || Ntrial >= 1000){
			d3.select('#trainingSplash')
				.style('width','100%')
				.classed('hidden', true)

		}
	}
}

function createCountdownSplash(){
	var fs = 48;
	d3.select('body').append('div')
		.attr('id','countdownSplash')
		.attr('class','splash ')
		.attr('z-index',60)
		.style('background-color','rgba(50, 50, 50, 0)')
		.style('width','')
		.append('div')
			.attr('id','countdownDivText')
			.style('font-size',fs+'px')
			.style('line-height',viewerParams.windowHeight + 'px')
			.style('text-align', 'center')
			.html("Resetting in <span id='countdownNumber'>3</span>")

	//make the text fill the screen
	var x = d3.select('#countdownDivText');
	var w = parseFloat(x.node().getBoundingClientRect().width);
	var Ntrial = 0
	while (w < 0.9*viewerParams.windowWidth && Ntrial < 1000){
		fs+=1
		x.style('font-size',fs+'px')
		w = parseFloat(x.node().getBoundingClientRect().width);
		Ntrial += 1;
		if (w >= 0.9*viewerParams.windowWidth || Ntrial >= 1000){
			d3.select('#countdownSplash')
				.style('width','100%')
				.classed('hidden', true)

		}
	}
}

function showSplash(id, show){
	var op = 0;
	if (show){
		console.log('showSplash',id, show)
		op = 0.99
		d3.select('#'+id).classed('hidden', false)
	}
	d3.select('#'+id).transition().duration(1000)
		.style('background-color','rgba(50, 50, 50,'+op+')')
		.style('color','rgba(232, 232, 232,'+op+')') //should use the background color variable in css
		.style('opacity',op)
		.on('end',function(){
			if (!show){
				d3.select('#'+id).classed('hidden', true);
			}
		})
	//need to include tabs here
	if (id == 'instructions'){
		d3.selectAll('.tab').each(function() {
			showSplash(d3.select(this).attr('id'),show)
		})
	}
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
	viewerParams.objDataShownIndex=[];
	d3.select('#spiralN').text('0')
	d3.select('#smoothN').text('0')
	d3.select('#spiralP').html('&mdash;')
	d3.select('#smoothP').html('&mdash;')

	populateField();
}

function init(){
	//first send the object data to ML
	var ml_input = {'objData':viewerParams.objData};
	if (viewerParams.usingSocket){
		socketParams.socket.emit('ml_input',ml_input);
	} else {
		setMLParams(ml_input);
	}

	//splash screens
	createInstructionsSplash();
	createCountdownSplash();
	createTrainingSplash();
	createLearnMoreTabs();

	setIdle();
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
	keys.forEach(function(k,i){
		viewerParams[k] = [];
		vars[k].forEach(function(d, j){
			viewerParams[k].push(d)
			if (i == keys.length-1 && j == vars[k].length-1){
				//update the viewer (when using sockets, I need to reattach the events)
				viewerParams.objDataShownIndex.forEach(function(jj){
					var dd = viewerParams.objData[jj]
					dd.results = viewerParams.objDataShownClassifications[jj];
					if (jj == viewerParams.objDataShownIndex.length -1){
						showSplash('trainingSplash', false)
						showMLResults();
						clearInterval(viewerParams.holdIdle);
					}
				})
	
			}
		});
	});
	console.log('have params for viewer.')


}

function sendToML(){
	viewerParams.holdIdle = setInterval(function(){
		setIdle();
	}, viewerParams.idleDuration/2.);

	//only send if there are enough images in the buckets
	if (viewerParams.spiralImages.length >= 2 && viewerParams.smoothImages.length >= 2){
		showSplash('trainingSplash', true)
		var ml_input = {
					'objDataShownIndex':viewerParams.objDataShownIndex,
					'spiralImages':viewerParams.spiralImages,
					'smoothImages':viewerParams.smoothImages
					};
		if (viewerParams.usingSocket){
			console.log('sending to ML', ml_input)
			socketParams.socket.emit('ml_input',JSON.stringify(ml_input));
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


//to reset every so often
function setIdle(){ 
	clearInterval(viewerParams.idleTimer);
	clearInterval(viewerParams.countdownTimer);
	showSplash('countdownSplash',false)
	viewerParams.idleTimer = setInterval(function(){
		var seconds = 0+viewerParams.idleCountdown;
		if (!viewerParams.inStartup) {
			console.log('resetting...')
			d3.select("#countdownNumber").text(seconds);
			showSplash('countdownSplash',true)
			viewerParams.countdownTimer = setInterval(function(){
				console.log("idle countdown...", seconds);
				d3.select("#countdownNumber").text(seconds);
				seconds--
				if (seconds == 0) {
					clearInterval(viewerParams.countdownTimer);
					reset(); 
					showSplash('countdownSplash',false);
					showSplash('instructions',true);
					viewerParams.inStartup = true	
				}
			}, 1000);
		}


	},viewerParams.idleDuration);
}

function cancelIdle(){
	viewerParams.inStartup = false
	setIdle();
}

d3.select(window)
	.on('mousedown',cancelIdle)
	.on('mousemove', cancelIdle)
	.on('touchstart', cancelIdle)
	.on('touchmove', cancelIdle)

