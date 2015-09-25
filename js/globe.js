
d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

var width = 500,
    height = 500;

var projection = d3.geo.orthographic()
    .scale(250)
    .translate([width / 2, height / 2])
    .clipAngle(90);
    //.precision(.1);

var path = d3.geo.path().projection(projection).pointRadius(1.5);

var svg = d3.select("#modelviewer").append("svg")
    .attr("width", width)
    .attr("height", height)
	.on("mousedown", mousedown);

var countries = {};	

queue()
    .defer(d3.json, "datafiles/briarwood/newworld_topo_highres.json")
    .defer(d3.tsv, "datafiles/newworld-country-names.tsv")
    .defer(d3.json, "datafiles/briarwood/places.json")
    .await(ready);
		 
		 
function ready(error, world, names, places) {
  if (error) throw error;
	
	//svg.append("defs").append("path")
	//    .datum({type: "Sphere"})
	//    .attr("id", "sphere")
	 //   .attr("d", path);
  names.forEach(function(n){
	countries[n.id] = n.name;
  });

	
	var ocean_fill = svg.append("defs").append("radialGradient")
			  .attr("id", "ocean_fill")
			  .attr("cx", "75%")
			  .attr("cy", "25%");
		  ocean_fill.append("stop").attr("offset", "5%").attr("stop-color", "#ddf");
		  ocean_fill.append("stop").attr("offset", "100%").attr("stop-color", "#9ab");

	var globe_highlight = svg.append("defs").append("radialGradient")
		.attr("id", "globe_highlight")
		.attr("cx", "75%")
		.attr("cy", "25%");
	  globe_highlight.append("stop")
		.attr("offset", "5%").attr("stop-color", "#ffd")
		.attr("stop-opacity","0.6");
	  globe_highlight.append("stop")
		.attr("offset", "100%").attr("stop-color", "#ba9")
		.attr("stop-opacity","0.2");

	var globe_shading = svg.append("defs").append("radialGradient")
		.attr("id", "globe_shading")
		.attr("cx", "50%")
		.attr("cy", "40%");
	  globe_shading.append("stop")
		.attr("offset","50%").attr("stop-color", "#9ab")
		.attr("stop-opacity","0")
	  globe_shading.append("stop")
		.attr("offset","100%").attr("stop-color", "#3e6184")
		.attr("stop-opacity","0.3")
	
	//Backdrop
	svg.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height);
	
	// Oceans
	svg.append("circle")
		.attr("cx", width / 2).attr("cy", height / 2)
		.attr("r", projection.scale())
		.attr("class", "noclicks")
		.style("fill", "url(#ocean_fill)");

	svg.append("circle")
		.attr("cx", width / 2).attr("cy", height / 2)
		.attr("r", projection.scale())
		.attr("class","noclicks")
		.style("fill", "url(#globe_highlight)");

	svg.append("circle")
		.attr("cx", width / 2).attr("cy", height / 2)
		.attr("r", projection.scale())
		.attr("class","noclicks")
		.style("fill", "url(#globe_shading)");
		
	// hover-able country outlines
    svg.append("g").attr("class","countries")
       .selectAll("path")
         .data(topojson.object(world, world.objects.countries).geometries)
       .enter().append("path")
         .attr("d", path)
	   .on("click", mouseclick);
	   
	//Places points and labels
	svg.append("g")
		.attr("class","points")
        .selectAll("text").data(places.features)
      .enter().append("path")
        .attr("class", "point")
        .attr("d", path);

    svg.append("g")
		.attr("class","labels")
        .selectAll("text").data(places.features)
      .enter().append("text")
      .attr("class", "label")
      .text(function(d) { return d.properties.name })
	   
	position_labels();
}

d3.select(self.frameElement).style("height", height + "px");

var m0, o0;
function mousedown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  o0 = projection.rotate();
  d3.event.preventDefault();
}

function mousemove() {
  if (m0) {
    var m1 = [d3.event.pageX, d3.event.pageY]
      , o1 = [o0[0] + (m1[0] - m0[0]) / 6, o0[1] + (m0[1] - m1[1]) / 6];
    o1[1] = o1[1] > 30  ? 30  :
            o1[1] < -30 ? -30 :
            o1[1];
    projection.rotate(o1);
    svg.selectAll("path").attr("d", path);
	position_labels();
  }
}

function mouseup() {
  if (m0) {
    mousemove();
    m0 = null;
  }
}

function mouseclick(d) {
	alert(countries[d.id]);
}

function position_labels() {
  var centerPos = projection.invert([width/2,height/2]);

  var arc = d3.geo.greatArc();

  svg.selectAll(".label")
    .attr("text-anchor",function(d) {
      var x = projection(d.geometry.coordinates)[0];
      return x < width/2-20 ? "end" :
             x < width/2+20 ? "middle" :
             "start"
    })
    .attr("transform", function(d) {
      var loc = projection(d.geometry.coordinates),
        x = loc[0],
        y = loc[1];
      var offset = x < width/2 ? -5 : 5;
      return "translate(" + (x+offset) + "," + (y-2) + ")"
    })
    .style("display",function(d) {
      var d = arc.distance({source: d.geometry.coordinates, target: centerPos});
      return (d > 1.57) ? 'none' : 'inline';
    })
    
}