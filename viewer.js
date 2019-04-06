let objData;
let objIndex = 0;
let useIndex = 0;
let randomIndices = [];
let colorMap;
let tDur = 1000;

//try packing instead of random https://bl.ocks.org/denjn5/6d5ddd4226506d644bb20062fc60b53f
function populateField(size = 50){
	var left = parseFloat(d3.select('#mainImageDiv').style('width'))
	var w = window.innerWidth - left - 50 - 4; //4 for border (not needed)
	var h = window.innerHeight - 4; //4 for border (not needed)
	var field = d3.select('#fieldDiv')
		.style('position','absolute')
		.style('left', left+50)
		.style('width', w)
		.style('height', h)


	field.selectAll('div').data(objData).enter()
		.append('div')
		.attr('class','bordered')
		.style('width', size+'px')
		.style('height',size+'px')
		.style('position','absolute')
		.style('left',function(d){return Math.random()*w})
		.style('top',function(d){return Math.random()*h})
		.style('transform',function(d){return 'rotate('+Math.random()*360+'deg)'})
		.append('img')
			.attr('src',function(d){return 'data/'+d.image})
			.attr('width',size+'px')
			.attr('height',size+'px')


	// svg.selectAll('circle').data(data).enter()
	// .append('circle')
	// 	.attr('cx', function(d){return 2.5*radius*d + offsetX})
	// 	.attr('cy', radius + offsetY)
	// 	.attr('r', radius)
	// 	.attr('stroke', 'black')
	// 	.attr('stroke-width', strokeWidth)
	// 	.attr('fill', function(d){return colorMap(d/10.)});
}
function showImage(i, offsetX=0){

	var div = d3.select('#mainImageDiv')
	var w = parseFloat(div.style('width'))
	var h = parseFloat(div.style('height'))
	div.append('img')
		.attr('id','imgNow')
		.attr('src','data/'+objData[i].image)
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
				.attr('fill', function(d){return colorMap(d/10.)});

		var clipPath = svg.append('defs').append("clipPath")
			.attr("id",id+'Clip')
			.append('rect')
				.attr("width", 0)
				.attr("height", 50)
				.attr("x", offsetX - radius - strokeWidth)
				.attr("y", 0)
		var t = d3.transition().duration(tDur);
		d3.select('#'+id+'Clip').selectAll('rect').transition(t)
			.attr("width", 2.5*radius*value)

		svg.attr('clip-path', 'url(#'+id+'Clip)');
	}




	var spiral = 10*objData[i]['t04_spiral_a08_spiral_debiased'];
	var smooth = 10*objData[i]['t01_smooth_or_features_a01_smooth_debiased'];
	console.log("ID, spiral, smooth", useIndex, spiral, smooth)

	makeStatsPlot('spiralStats', spiral, 10, 1, 150, 10)
	makeStatsPlot('smoothStats', smooth, 10, 1, 150, 10)


}

//https://bl.ocks.org/EfratVil/903d82a7cde553fb6739fe55af6103e2
function setColorMap(){
var step = d3.scaleLinear()
		.domain([1, 8])
		.range([0, 1]);

	colorMap= d3.scaleLinear()
		.domain([0, step(2), step(3), step(4), step(5), step(6), step(7), 1])
		.range(['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'])
		.interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb

}

function advanceIndex(val, random=true){

	objIndex += val;
	if (objIndex < 0){
		objIndex = objData.length-1;
	}
	if (random){
		useIndex = randomIndices[objIndex];
	} else {
		useIndex = objIndex;
	}
	
}
//create a new index list that is random
function randomizeObjects(){
	for(var i=0; i<objData.length; i++){
		randomIndices.push(parseInt(Math.random()*objData.length));
	}
}
function moveImage(val){
	var t = d3.transition().duration(tDur);
	var w = parseFloat(d3.select('#mainImageDiv').style('width'))
	var h = parseFloat(d3.select('#mainImageDiv').style('height'))
	d3.select('#imgNow') //animation in css
		.attr('id','imgPrev')

	showImage(useIndex,-val*w);

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
	moveImage(1);
	populateStats(useIndex);
})
d3.select('#prevButton').on('click',function(e){
	advanceIndex(-1);
	moveImage(-1);
	populateStats(useIndex);
})
//read in the data
d3.json('data/GZ2data.json')
	.then(function(data) {
		objData = data;
		setColorMap();
		randomizeObjects();
		populateField();
		showImage(useIndex);
		populateStats(useIndex);
	});
