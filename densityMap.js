var margin = {
        top: 30,
        right: 40,
        bottom: 50,
        left: 80
    },
    width = 1800 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var projection = d3.geoAlbersUsa()
    .scale(6280)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()

    .projection(projection);


var quantize = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.range(9).map(function (i) {
        return "q" + i + "-9";
    }));

var bluColor = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemePuBu[9]);
var redColor = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeOrRd[9]);

var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

g.selectAll("rect")
    .data(bluColor.range().map(function (d) {
        d = bluColor.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function (d) {
        return x(d[0]);
    })
    .attr("width", function (d) {
        return x(d[1]) - x(d[0]);
    })
    .attr("fill", function (d) {
        return bluColor(d[0]);
    });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population per square mile");

g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickValues(bluColor.domain()))
    .select(".domain")
    .remove();

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.csv("Population-Density By County.csv").then((pdd) => {
    const densityMap = new Map();
    for (let i = 0; i < pdd.length; i++) {
        densityMap.set(pdd[i]["GCT_STUB.target-geo-id2"], pdd[i]["Density per square mile of land area"]);
        densityMap.set(pdd[i]["GCT_STUB.target-geo-id2"] + "name", pdd[i]["GCT_STUB.display-label"]);
    }
    d3.json("us-10m.json").then((usd) => {
        svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(usd, usd.objects.counties).features)
            .enter().append("path")
            .filter(function (d) {
                return (36001 <= d.id && d.id <= 36123);
            })

            .attr("fill", function (d) {
                return (bluColor(densityMap.get("" + d.id)));
            })
            .attr("transform", "translate(-2000,600)")
            .attr("class", "county")
            .attr("d", path)
            .on("mouseover", function (event, d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(densityMap.get(d.id + "name") + "<br/>" + "Population Density: " + densityMap.get("" + d.id) + " People per square mile")
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append("circle").attr("cx", width - 600).attr("cy", height - 120).attr("r", function (d) {
            return Math.sqrt(4 / Math.PI) * 10
        }).style("fill", "lightBlue").style("stroke", "dimgray").on('click', changeBlue)

        svg.append("circle").attr("cx", width - 600).attr("cy", height - 90).attr("r", function (d) {
            return Math.sqrt(4 / Math.PI) * 10
        }).style("fill", "lightcoral").style("stroke", "dimgray").on('click', changeRed)

        svg.append("rect").attr("x", width - 670).attr("y", height - 130).attr("width", "40").attr("height", "20").style("fill", "grey").style("stroke", "dimgray").on('click', grey)

        svg.append("rect").attr("x", width - 670).attr("y", height - 100).attr("width", "40").attr("height", "20").style("fill", "floralwhite").style("stroke", "dimgray").on('click', white)

        function grey() {
            d3.selectAll(".states").style("stroke", d3.color("black"));

        }

        function white() {
            d3.selectAll(".states").style("stroke", d3.color("white"));

        }


        function changeRed() {
            d3.selectAll(".county")
                .attr("fill", function (d) {
                    return (redColor(densityMap.get("" + d.id)));
                });

            d3.selectAll("rect")
                .attr("fill", function (d) {
                    return redColor(d[0]);
                });
        }

        function changeBlue() {
            d3.selectAll(".county")
                .attr("fill", function (d) {
                    return (bluColor(densityMap.get("" + d.id)));
                });

            d3.selectAll("rect")
                .attr("fill", function (d) {
                    return bluColor(d[0]);
                });
        }


    });

});
