const width = 700;
const height = 600;
const margin = {
    left: 50,
    right: 50,
    top: 50,
    bottom: 50,
};

const header = document.getElementById("header");

var partysvg = d3.select("#partychart")
.append("svg")
.attr("width",width+margin.left+margin.right)
.attr("height",height+margin.top+margin.bottom)
.append("g")
.attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var peoplesvg = d3.select("#peoplechart")
.append("svg")
.attr("width",width+margin.left+margin.right)
.attr("height",height+margin.top+margin.bottom)
 .append("g")
.attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

function my_Func(abortion){
    console.log(abortion)
    //y-axis
    var y = d3.scaleLinear().domain([-1,1]).range([height,0]);
    partysvg.append("g").call(d3.axisLeft(y));
    peoplesvg.append("g").call(d3.axisLeft(y));
    //x_axis
    // var xExtent = d3.extent(climate, function(d){return d.created_at;});
    // var x = d3.scaleTime().domain(xExtent).range([0,width]);
    // partysvg.append("g").attr("transform", "translate(0," + height/2 + ")").call(d3.axisBottom(x));
    // peoplesvg.append("g").attr("transform", "translate(0," + height/2 + ")").call(d3.axisBottom(x));
    //x axis label
    partysvg.append("text").attr("text-anchor","end").attr("x",width).attr("y",height/2).text("Time");
    peoplesvg.append("text").attr("text-anchor","end").attr("x",width).attr("y",height/2).text("Time");
    //y axis label
    partysvg.append("text").attr("text-anchor","end").attr("transform","rotate(-90)").attr("x",0).attr("y",-25).text("Favor");
    partysvg.append("text").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("y",-25).attr("x",-height/2).text("Neutral");
    partysvg.append("text").attr("text-anchor","end").attr("transform","rotate(-90)").attr("y",-25).attr("x",-height).text("Against");
    peoplesvg.append("text").attr("text-anchor","end").attr("transform","rotate(-90)").attr("x",0).attr("y",-25).text("Favor");
    peoplesvg.append("text").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("y",-25).attr("x",-height/2).text("Neutral");
    peoplesvg.append("text").attr("text-anchor","end").attr("transform","rotate(-90)").attr("y",-25).attr("x",-height).text("Against");
    //add legend
    var legend = d3.select(".legend-place").append("svg").attr("height",150);
    legend.append("path").attr("d",d3.line()([[10,20],[40,20]])).attr("fill","none").attr("stroke_width",1.5).style("stroke","black");
    legend.append("text").text("feminist movement").attr("x",50).attr("y",20);
    legend.append("path").attr("d",d3.line()([[10,40],[40,40]])).attr("fill","none").attr("stroke-width",1.5).style("stroke","black").style("stroke-dasharray",("3,3"));
    legend.append("text").text("climate change is a real concern").attr("x",50).attr("y",40);
    legend.append("path").attr("d",d3.line()([[10,60],[40,60]])).attr("fill","none").attr("stroke-width",1.5).style("stroke","black").style("stroke-dasharray",("5,5"));
    legend.append("text").text("legalization of abortion").attr("x",50).attr("y",60);


    //line function
    var line = d3.line().curve(d3.curveBasis).x(function(d){return x(d.created_at);})
    .y(function(d){
     if(d.stance === "AGAINST"){return y(-d.probability);}
     else if (d.stance === "NEUTRAL"){return y(0);}
     else{return y(d.probability);}
    });

    //sort datasets for line graph
    // var sorted_feminism=feminism.sort(function(a,b){
    //     return new Date(a.created_at)-new Date (b.created_at);
    // });
    // var sorted_climate=climate.sort(function(a,b){
    //     return new Date(a.created_at)-new Date (b.created_at);
    // });
    var sorted_abortion=abortion.sort(function(a,b){
        return new Date(a.created_at)-new Date (b.created_at);
    });

    //colors for each line
    var color = ['red','black','green','yellow','blue','pink'];


};