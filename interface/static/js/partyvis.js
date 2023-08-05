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

var bubbletree = d3.select("#bubbletree")
.append("svg")
.attr("width",width+margin.left+margin.right)
.attr("height",height+margin.top+margin.bottom)
 .append("g")
.attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

function my_Func(abortion,climate,feminism,data,politicians){
  
    //y-axis
    var y = d3.scaleLinear().domain([-1,1]).range([height,0]);
    partysvg.append("g").call(d3.axisLeft(y));

    //get the dates for the x axis
    const dates_abortion = abortion.map((item)=>item.created_at);
    const dates_climate = climate.map((item)=>item.created_at);
    const dates_feminism = feminism.map((item)=>item.created_at);
    const all_dates=dates_abortion.concat(dates_climate,dates_feminism);
    const dateObj=all_dates.map((dateString)=>new Date(dateString));
    //x_axis
     var xExtent = d3.extent(dateObj);
     var x = d3.scaleTime().domain(xExtent).range([0,width]);
     var XaxisParty=partysvg.append("g").attr("transform", "translate(0," + height/2 + ")").call(d3.axisBottom(x));
    //x axis label
    partysvg.append("text").attr("text-anchor","end").attr("x",width).attr("y",height/2).text("Time");
    //y axis label
    partysvg.append("text").attr("text-anchor","end").attr("transform","rotate(-90)").attr("x",0).attr("y",-25).text("Favor");
    partysvg.append("text").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("y",-25).attr("x",-height/2).text("Neutral");
    partysvg.append("text").attr("text-anchor","end").attr("transform","rotate(-90)").attr("y",-25).attr("x",-height).text("Against");
    
    //tooltip
    var Tooltip = d3.select("#partychart").append("div").style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");
    //tooltip for politicians names
    var poliTooltip = d3.select("#bubbletree").append("div").style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");
    //mouseover partychart
    var mouseover = function(d) {
      Tooltip
        .style("opacity", 1);
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1);
    };
    //mouseover for politicians names
    var poliMouseover = function(d) {
      poliTooltip
        .style("opacity", 1);
      /*d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1);*/
    };
    //mousemove partychart
    var mousemove = function(event,d) {
      Tooltip
        .html("user: " + d.user+"<br>stance: "+d.stance+"<br>date: "+new Date(d.created_at)+"<br>tweet: "+d.translated_text)
        .style("left", (event.pageX+70) + "px")
        .style("top", (event.pageY) + "px");
    };
    //mousemove for politicians names
    var poliMousemove = function(event,d) {
      poliTooltip
        .html("name: "+d.data.name)
        .style("left", (event.pageX+70) + "px")
        .style("top", (event.pageY) + "px");
    };

    //mouseleave partychart
    var mouseleave = function(d) {
      Tooltip
        .style("opacity", 0);
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8);
    }
    //mouseleave for politicians names
    var poliMouseleave = function(d) {
      poliTooltip
        .style("opacity", 0);
      /*d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8);*/
    }
    //for points user selected by bubble
    var mouseleaveBubble = function(d) {
      Tooltip
        .style("opacity", 0);
      d3.select(this)
        .style("stroke", "#999999")
        .style("opacity", 0.8);
    }
    //line function
    var line = d3.line().curve(d3.curveBasis).x(function(d){return x(d.created_at);})
    .y(function(d){
     if(d.stance === "AGAINST"){return y(-d.probability);}
     else if (d.stance === "NEUTRAL"){return y(0);}
     else{return y(d.probability);}
    });
    //colors for each line
    var color = ['red','black','green','yellow','blue','pink'];
    const colorScale = d3.scaleOrdinal()
    .domain(["SPD", "CDU/CSU", "BÜ90/GR","FDP","AfD","DIE LINKE."])
    .range(color);
    //sort datasets for line graph
    var sorted_feminism=feminism.sort(function(a,b){
         return new Date(a.created_at)-new Date (b.created_at);
     });
     var sorted_climate=climate.sort(function(a,b){
         return new Date(a.created_at)-new Date (b.created_at);
     });
    var sorted_abortion=abortion.sort(function(a,b){
        return new Date(a.created_at)-new Date (b.created_at);
    });
    //bin data for the line graph
    var groupedPartyDateAbortion = d3.group(sorted_abortion,(d)=>d.party,d => d3.timeWeek(d.created_at));
    var groupedPartyDateClimate = d3.group(sorted_climate,(d)=>d.party,d => d3.timeWeek(d.created_at));
    var groupedPartyDateFeminism = d3.group(sorted_feminism,(d)=>d.party,d => d3.timeWeek(d.created_at));
     //calculate number of tweets per week for each party

    const BinnedAbortion = Array.from(groupedPartyDateAbortion, ([party, data]) => ({
      party,
      data: Array.from(data, ([week, tweets]) => ({ week, count: tweets.length })),
    }));
    const BinnedClimate = Array.from(groupedPartyDateClimate, ([party, data]) => ({
      party,
      data: Array.from(data, ([week, tweets]) => ({ week, count: tweets.length })),
    }));
    const BinnedFeminism = Array.from(groupedPartyDateFeminism, ([party, data]) => ({
      party,
      data: Array.from(data, ([week, tweets]) => ({ week, count: tweets.length })),
    }));
    //console.log(BinnedFeminism);

    //y-axis for tweets per week
    var y_week = d3.scaleLinear().domain([0,300]).range([height,0]);
    var y_weekParty=partysvg.append("g").attr("transform", "translate(" + width + ",0)").call(d3.axisRight(y_week));
    //draw lines
    const line_week = d3.line()
      .x(d => x(d.week))
      .y(d => y_week(d.count));

    partysvg.selectAll(".line")
      .data(BinnedAbortion)
      .enter()
      .append("path")
      .attr("class",function(d){if(d.party==="DIE LINKE."){return "lineWeekAbortionDIELINKE";}
    else if(d.party==="BÜ90/GR"){return "lineWeekAbortionGruenen";}else if(d.party==="CDU/CSU"){return "lineWeekAbortionCDU";}else{return "lineWeekAbortion"+d.party;}})
      .attr("d", d => line_week(d.data))
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.party))
      .attr("stroke_width",2).style("stroke-dasharray",("5,5"));
    partysvg.selectAll(".line")
      .data(BinnedClimate)
      .enter()
      .append("path")
      .attr("class",function(d){if(d.party==="DIE LINKE."){return "lineWeekClimateDIELINKE";}
    else if(d.party==="BÜ90/GR"){return "lineWeekClimateGruenen";}else if(d.party==="CDU/CSU"){return "lineWeekClimateCDU";}else{return "lineWeekClimate"+d.party;}})
      .attr("d", d => line_week(d.data))
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.party))
      .attr("stroke_width",2).style("stroke-dasharray",("3,3"));
    partysvg.selectAll(".line")
      .data(BinnedFeminism)
      .enter()
      .append("path")
      .attr("class",function(d){if(d.party==="DIE LINKE."){return "lineWeekFeminismDIELINKE";}
    else if(d.party==="BÜ90/GR"){return "lineWeekFeminismGruenen";}else if(d.party==="CDU/CSU"){return "lineWeekFeminismCDU";}else{return "lineWeekFeminism"+d.party;}})
      .attr("d", d => line_week(d.data))
      .attr("fill", "none")
      .attr("stroke", d => colorScale(d.party))
      .attr("stroke_width",2);

    //path for each party from topic abortion

    var grouped_abortion =d3.group(sorted_abortion, d => d.party);
    var grouped_climate =d3.group(sorted_climate, d => d.party);
    var grouped_feminism =d3.group(sorted_feminism, d => d.party);
    
    /*var Line=partysvg.selectAll(".line")
    .data(grouped_feminism)
    .enter()
    .append("path")
    .attr("class",function(d){if(d[0]==="DIE LINKE."){return "lineDIELINKE";}
    else if(d[0]==="BÜ90/GR"){return "lineGruenen";}else if(d[0]==="CDU/CSU"){return "lineCDU";}else{return "line"+d[0];}})
    .attr("d", d => line(d[1]))
    .attr("stroke", d => colorScale(d[0]))
    .attr("fill","none")
    .attr("stroke_width",1.5);
    //points for each party from topic abortion
    var Points=partysvg.selectAll(".point")
    .data(feminism)
    .enter()
    .append("circle")
    .attr("class",function(d){if(d.party==="DIE LINKE."){return "pointDIELINKE";}
    else if(d.party==="BÜ90/GR"){return "pointGruenen";}else if(d.party==="CDU/CSU"){return "pointCDU";}else{return "point"+d.party;}})
    .attr("cx", d => x(d.created_at)) 
    .attr("cy",function(d){
        if(d.stance === "AGAINST"){return y(-d.probability);}
        else if (d.stance === "NEUTRAL"){return y(0);}
        else{return y(d.probability);}
       } ) 
    .attr("r", 5) // Set the radius of the points
    .attr("fill", d => colorScale(d.party))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);*/
    var abortionLine=partysvg.selectAll(".line")
    .data(grouped_abortion)
    .enter()
    .append("path")
    .attr("class",function(d){if(d[0]==="DIE LINKE."){return "lineAbortionDIELINKE";}
    else if(d[0]==="BÜ90/GR"){return "lineAbortionGruenen";}else if(d[0]==="CDU/CSU"){return "lineAbortionCDU";}else{return "lineAbortion"+d[0];}})
    .attr("d", d => line(d[1]))
    .attr("stroke", d => colorScale(d[0]))
    .attr("fill","none")
    .attr("stroke_width",1.5).style("stroke-dasharray",("5,5"));
    //path for each party from topic climate
    var climateLine=partysvg.selectAll(".line")
    .data(grouped_climate)
    .enter()
    .append("path")
    .attr("class", function(d){if(d[0]==="DIE LINKE."){return "lineClimateDIELINKE";}
    else if(d[0]==="BÜ90/GR"){return "lineClimateGruenen";}else if(d[0]==="CDU/CSU"){return "lineClimateCDU";}else{return "lineClimate"+d[0];}})
    .attr("d", d => line(d[1]))
    .attr("stroke", d => colorScale(d[0]))
    .attr("fill","none")
    .attr("stroke_width",1.5).style("stroke-dasharray",("3,3"));
    //path for each party from topic feminism
    var feminismLine=partysvg.selectAll(".line")
    .data(grouped_feminism)
    .enter()
    .append("path")
    .attr("class",function(d){if(d[0]==="DIE LINKE."){return "lineFeminismDIELINKE";}
    else if(d[0]==="BÜ90/GR"){return "lineFeminismGruenen";}else if(d[0]==="CDU/CSU"){return "lineFeminismCDU";}else{return "lineFeminism"+d[0];}})
    .attr("d", d => line(d[1]))
    .attr("stroke", d => colorScale(d[0]))
    .attr("fill","none")
    .attr("stroke_width",1.5);
    //points for each party from topic abortion
    /*partysvg.selectAll(".point")
    .data(abortion)
    .enter()
    .append("circle")
    .attr("class",function(d){if(d.party==="DIE LINKE."){return "pointAbortionDIELINKE";}
    else if(d.party==="BÜ90/GR"){return "pointAbortionGruenen";}else if(d.party==="CDU/CSU"){return "pointAbortionCDU";}else{return "pointAbortion"+d.party;}})
    .attr("cx", d => x(d.created_at)) 
    .attr("cy",function(d){
        if(d.stance === "AGAINST"){return y(-d.probability);}
        else if (d.stance === "NEUTRAL"){return y(0);}
        else{return y(d.probability);}
       } ) 
    .attr("r", 5) // Set the radius of the points
    .attr("fill", d => colorScale(d.party))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);*/
    partysvg.selectAll(".point")
  .data(abortion)
  .enter()
  .append("rect")
  .attr("class", function(d) {
    if (d.party === "DIE LINKE.") {
      return "pointAbortionDIELINKE";
    } else if (d.party === "BÜ90/GR") {
      return "pointAbortionGruenen";
    } else if (d.party === "CDU/CSU") {
      return "pointAbortionCDU";
    } else {
      return "pointAbortion" + d.party;
    }
  })
  .attr("x", d => x(d.created_at) - 5) // Adjust the square's x position to center it around the x-coordinate
  .attr("y", function(d){
    if(d.stance === "AGAINST"){return y(-d.probability)-5;}
    else if (d.stance === "NEUTRAL"){return y(0)-5;}
    else{return y(d.probability)-5;}
   }) // Adjust the square's y position to center it around the y-coordinate
  .attr("width", 10) // Set the width of the square
  .attr("height", 10) // Set the height of the square
  .attr("fill", d => colorScale(d.party))
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave);
    //points for each party from topic climate
    partysvg.selectAll(".point")
    .data(climate)
    .enter()
    .append("circle")
    .attr("class",function(d){if(d.party==="DIE LINKE."){return "pointClimateDIELINKE";}
    else if(d.party==="BÜ90/GR"){return "pointClimateGruenen";}else if(d.party==="CDU/CSU"){return "pointClimateCDU";}else{return "pointClimate"+d.party;}})
    .attr("cx", d => x(d.created_at)) 
    .attr("cy",function(d){
        if(d.stance === "AGAINST"){return y(-d.probability);}
        else if (d.stance === "NEUTRAL"){return y(0);}
        else{return y(d.probability);}
       } ) 
    .attr("r", 5) // Set the radius of the points
    .attr("fill", d => colorScale(d.party))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
    //points for each party from topic feminism
    /*partysvg.selectAll(".point")
    .data(feminism)
    .enter()
    .append("circle")
    .attr("class", function(d){if(d.party==="DIE LINKE."){return "pointFeminismDIELINKE";}
    else if(d.party==="BÜ90/GR"){return "pointFeminismGruenen";}else if(d.party==="CDU/CSU"){return "pointFeminismCDU";}else{return "pointFeminism"+d.party;}})
    .attr("cx", d => x(d.created_at)) 
    .attr("cy",function(d){
        if(d.stance === "AGAINST"){return y(-d.probability);}
        else if (d.stance === "NEUTRAL"){return y(0);}
        else{return y(d.probability);}
       } ) 
    .attr("r", 5) // Set the radius of the points
    .attr("fill", d => colorScale(d.party))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);*/
    partysvg.selectAll(".point")
  .data(feminism)
  .enter()
  .append("path")
  .attr("class", function(d) {
    if (d.party === "DIE LINKE.") {
      return "pointFeminismDIELINKE";
    } else if (d.party === "BÜ90/GR") {
      return "pointFeminismGruenen";
    } else if (d.party === "CDU/CSU") {
      return "pointFeminismCDU";
    } else {
      return "pointFeminism" + d.party;
    }
  })
  .attr("transform", function(d){
    if(d.stance === "AGAINST"){return "translate(" + x(d.created_at) + "," + y(-d.probability) + ")";}
    else if (d.stance === "NEUTRAL"){return "translate(" + x(d.created_at) + "," + y(0) + ")";}
    else{return "translate(" + x(d.created_at) + "," + y(d.probability) + ")";}
   }) // Translate the path to the point's position
  .attr("d", "M 0 -5 L 5 5 L -5 5 Z") // Define the path data for a triangle
  .attr("fill", d => colorScale(d.party))
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave);

    // Define a toggle state variable
let toggleState = false;
let toggleLi = false;
let toggleLiWeek=false;
// Add event listener to the button
document.getElementById("toggleButton").addEventListener("click", togglePoints);
document.getElementById("toggleLines").addEventListener("click", toggleLines);
document.getElementById("toggleLinesWeek").addEventListener("click", toggleLinesWeek);
// Event handler function
function togglePoints() {
  // Toggle the state
  toggleState = !toggleState;

  // Select all points and update their visibility based on the toggle state
  partysvg.selectAll(".pointAbortionSPD").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointAbortionAfD").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointAbortionFDP").style("display", toggleState ? "none" : "initial"); 
  partysvg.selectAll(".pointAbortionDIELINKE").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointAbortionGruenen").style("display", toggleState ? "none" : "initial"); 
  partysvg.selectAll(".pointAbortionCDU").style("display", toggleState ? "none" : "initial");

  partysvg.selectAll(".pointClimateSPD").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointClimateAfD").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointClimateFDP").style("display", toggleState ? "none" : "initial"); 
  partysvg.selectAll(".pointClimateDIELINKE").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointClimateGruenen").style("display", toggleState ? "none" : "initial"); 
  partysvg.selectAll(".pointClimateCDU").style("display", toggleState ? "none" : "initial");

  partysvg.selectAll(".pointFeminismSPD").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointFeminismAfD").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointFeminismFDP").style("display", toggleState ? "none" : "initial"); 
  partysvg.selectAll(".pointFeminismDIELINKE").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointFeminismGruenen").style("display", toggleState ? "none" : "initial"); 
  partysvg.selectAll(".pointFeminismCDU").style("display", toggleState ? "none" : "initial");
  //check selected parties
  d3.selectAll(".checkboxparty").each(function(d){
    cb = d3.select(this);
    grp = cb.property("value");
    select = cb.property("checked");
    toggleTopic(grp,".point",select,toggleState);

  });
    
}
//check if topic is selected, if not set display to none for the topic
function toggleTopic(parti,sym,selection,state){
  d3.selectAll(".checkboxtopic").each(function(d){
    cbTopic = d3.select(this);
    grpTopic = cbTopic.property("value");
    selectTopic = cbTopic.property("checked");

    if(!cbTopic.property("checked")&&!selection&&state==false){
      partysvg.selectAll(sym+grpTopic+parti).style("display","none");
    }
    else if(!cbTopic.property("checked")&&!selection&&state==true){
      partysvg.selectAll(sym+grpTopic+parti).style("display","none");
    }
    else if(!cbTopic.property("checked")&&selection&&state==false){
      partysvg.selectAll(sym+grpTopic+parti).style("display","none");
    }
    else if(!cbTopic.property("checked")&&selection&&state==true){
      partysvg.selectAll(sym+grpTopic+parti).style("display","none");
    }
    else if(cbTopic.property("checked")&&!selection&&state==false){
      partysvg.selectAll(sym+grpTopic+parti).style("display","none");
    }
    else if(cbTopic.property("checked")&&!selection&&state==true){
      partysvg.selectAll(sym+grpTopic+parti).style("display","none");
    };
  });

}
//function toggle lines
function toggleLines(){
  // Toggle the state
  toggleLi = !toggleLi;

  // Select all points and update their visibility based on the toggle state
  partysvg.selectAll(".lineAbortionSPD").style("display", toggleLi ? "none" : "initial");
  partysvg.selectAll(".lineAbortionAfD").style("display", toggleLi ? "none" : "initial");
  partysvg.selectAll(".lineAbortionFDP").style("display", toggleLi ? "none" : "initial"); 
  partysvg.selectAll(".lineAbortionDIELINKE").style("display", toggleLi ? "none" : "initial");
  partysvg.selectAll(".lineAbortionGruenen").style("display", toggleLi ? "none" : "initial"); 
  partysvg.selectAll(".lineAbortionCDU").style("display", toggleLi ? "none" : "initial");

  partysvg.selectAll(".lineClimateSPD").style("display", toggleLi ? "none" : "initial");
  partysvg.selectAll(".lineClimateAfD").style("display", toggleLi ? "none" : "initial");
  partysvg.selectAll(".lineClimateFDP").style("display", toggleLi ? "none" : "initial"); 
  partysvg.selectAll(".lineClimateDIELINKE").style("display", toggleLi ? "none" : "initial");
  partysvg.selectAll(".lineClimateGruenen").style("display", toggleLi ? "none" : "initial"); 
  partysvg.selectAll(".lineClimateCDU").style("display", toggleLi ? "none" : "initial");

  partysvg.selectAll(".lineFeminismSPD").style("display", toggleLi ? "none" : "initial");
  partysvg.selectAll(".lineFeminismAfD").style("display", toggleLi ? "none" : "initial");
  partysvg.selectAll(".lineFeminismFDP").style("display", toggleLi ? "none" : "initial"); 
  partysvg.selectAll(".lineFeminismDIELINKE").style("display", toggleLi ? "none" : "initial");
  partysvg.selectAll(".lineFeminismGruenen").style("display", toggleLi ? "none" : "initial"); 
  partysvg.selectAll(".lineFeminismCDU").style("display", toggleLi ? "none" : "initial");
  //check selected parties
  d3.selectAll(".checkboxparty").each(function(d){
    cb = d3.select(this);
    grp = cb.property("value");
    select = cb.property("checked");
    toggleTopic(grp,".line",select,toggleState);
  });
}
//function toggle lines tweets per week
function toggleLinesWeek(){
  // Toggle the state
  toggleLiWeek = !toggleLiWeek;

  // Select all lines and update their visibility based on the toggle state
  partysvg.selectAll(".lineWeekAbortionSPD").style("display", toggleLiWeek ? "none" : "initial");
  partysvg.selectAll(".lineWeekAbortionAfD").style("display", toggleLiWeek ? "none" : "initial");
  partysvg.selectAll(".lineWeekAbortionFDP").style("display", toggleLiWeek ? "none" : "initial"); 
  partysvg.selectAll(".lineWeekAbortionDIELINKE").style("display", toggleLiWeek ? "none" : "initial");
  partysvg.selectAll(".lineWeekAbortionGruenen").style("display", toggleLiWeek ? "none" : "initial"); 
  partysvg.selectAll(".lineWeekAbortionCDU").style("display", toggleLiWeek ? "none" : "initial");

  partysvg.selectAll(".lineWeekClimateSPD").style("display", toggleLiWeek ? "none" : "initial");
  partysvg.selectAll(".lineWeekClimateAfD").style("display", toggleLiWeek ? "none" : "initial");
  partysvg.selectAll(".lineWeekClimateFDP").style("display", toggleLiWeek ? "none" : "initial"); 
  partysvg.selectAll(".lineWeekClimateDIELINKE").style("display", toggleLiWeek ? "none" : "initial");
  partysvg.selectAll(".lineWeekClimateGruenen").style("display", toggleLiWeek ? "none" : "initial"); 
  partysvg.selectAll(".lineWeekClimateCDU").style("display", toggleLiWeek ? "none" : "initial");

  partysvg.selectAll(".lineWeekFeminismSPD").style("display", toggleLiWeek ? "none" : "initial");
  partysvg.selectAll(".lineWeekFeminismAfD").style("display", toggleLiWeek ? "none" : "initial");
  partysvg.selectAll(".lineWeekFeminismFDP").style("display", toggleLiWeek ? "none" : "initial"); 
  partysvg.selectAll(".lineWeekFeminismDIELINKE").style("display", toggleLiWeek ? "none" : "initial");
  partysvg.selectAll(".lineWeekFeminismGruenen").style("display", toggleLiWeek ? "none" : "initial"); 
  partysvg.selectAll(".lineWeekFeminismCDU").style("display", toggleLiWeek ? "none" : "initial");
  //check selected parties
  d3.selectAll(".checkboxparty").each(function(d){
    cb = d3.select(this);
    grp = cb.property("value");
    select = cb.property("checked");
    toggleTopic(grp,".lineWeek",select,toggleState);
  });
}
//add function to change visability of the lines and points
function updateTopic(){
  let selectedTopic = [];
  d3.selectAll(".checkboxtopic").each(function(d){
    cb=d3.select(this);
    grp=cb.property("value");
    select=cb.property("checked");
    if(select){
      selectedTopic.push(grp);
    }

    if(selectedTopic.length===3){
      x.domain(xExtent);
      XaxisParty.transition().call(d3.axisBottom(x));
      //y axis for tweets per week
      y_week.domain([0,300]);
      y_weekParty.transition().call(d3.axisRight(y_week));
    }
    else if(selectedTopic.includes("Feminism")&&selectedTopic.includes("Abortion")){
      x.domain(d3.extent(dates_feminism));
      XaxisParty.transition().call(d3.axisBottom(x));
      //y axis for tweets per week
      y_week.domain([0,100]);
      y_weekParty.transition().call(d3.axisRight(y_week));
    }
    else if(selectedTopic.includes("Feminism")&&selectedTopic.includes("Climate")){
      x.domain(d3.extent(dates_feminism));
      XaxisParty.transition().call(d3.axisBottom(x));
      //y axis for tweets per week
      y_week.domain([0,300]);
      y_weekParty.transition().call(d3.axisRight(y_week));
    }
    else if(selectedTopic.includes("Abortion")&&selectedTopic.includes("Climate")){
      const dates=dates_abortion.concat(dates_climate);
      const dateOb=dates.map((dateString)=>new Date(dateString));
      x.domain(d3.extent(dateOb));
      XaxisParty.transition().call(d3.axisBottom(x));
      //y axis for tweets per week
      y_week.domain([0,300]);
      y_weekParty.transition().call(d3.axisRight(y_week));
    }
    else if(selectedTopic.length===1){
      if(selectedTopic.includes("Feminism")){
        x.domain(d3.extent(dates_feminism));
        XaxisParty.transition().call(d3.axisBottom(x));
        //y axis for tweets per week
        y_week.domain([0,35]);
        y_weekParty.transition().call(d3.axisRight(y_week));
      }
      else if(selectedTopic.includes("Abortion")){
        x.domain(d3.extent(dates_abortion));
        XaxisParty.transition().call(d3.axisBottom(x));
        //y axis for tweets per week
        y_week.domain([0,100]);
        y_weekParty.transition().call(d3.axisRight(y_week));
      }
      else{
        x.domain(d3.extent(dates_climate));
        XaxisParty.transition().call(d3.axisBottom(x));
        //y axis for tweets per week
        y_week.domain([0,300]);
        y_weekParty.transition().call(d3.axisRight(y_week));
      }
    }
    if(selectedBubblesPeople.length !==0){
      partysvg.selectAll(".pointsAbortionBubble").remove();
      partysvg.selectAll(".pointsFeminismBubble").remove();
      partysvg.selectAll(".pointsClimateBubble").remove();
      updateVisualizationPeople();
    }

    if(cb.property("checked")){
      //lines
      partysvg.selectAll(".line"+grp+"SPD").attr("d", d => line(d[1])).style("display","initial");
      partysvg.selectAll(".line"+grp+"CDU").attr("d", d => line(d[1])).style("display","initial");
      partysvg.selectAll(".line"+grp+"Gruenen").attr("d", d => line(d[1])).style("display","initial");
      partysvg.selectAll(".line"+grp+"DIELINKE").attr("d", d => line(d[1])).style("display","initial");
      partysvg.selectAll(".line"+grp+"AfD").attr("d", d => line(d[1])).style("display","initial");
      partysvg.selectAll(".line"+grp+"FDP").attr("d", d => line(d[1])).style("display","initial");
      //lines tweets per week
      partysvg.selectAll(".lineWeek"+grp+"SPD").attr("d", d => line_week(d.data)).style("display","initial");
      partysvg.selectAll(".lineweek"+grp+"CDU").attr("d", d => line_week(d.data)).style("display","initial");
      partysvg.selectAll(".lineWeek"+grp+"Gruenen").attr("d", d => line_week(d.data)).style("display","initial");
      partysvg.selectAll(".lineweek"+grp+"DIELINKE").attr("d", d => line_week(d.data)).style("display","initial");
      partysvg.selectAll(".lineWeek"+grp+"AfD").attr("d", d => line_week(d.data)).style("display","initial");
      partysvg.selectAll(".lineWeek"+grp+"FDP").attr("d", d => line_week(d.data)).style("display","initial");
      //points
      partysvg.selectAll(".point"+grp+"SPD").style("display","initial");
      partysvg.selectAll(".point"+grp+"CDU").style("display","initial");
      partysvg.selectAll(".point"+grp+"Gruenen").style("display","initial");
      partysvg.selectAll(".point"+grp+"DIELINKE").style("display","initial");
      partysvg.selectAll(".point"+grp+"AfD").style("display","initial");
      partysvg.selectAll(".point"+grp+"FDP").style("display","initial");
      if(grp==="Abortion"){
        partysvg.selectAll(".point"+grp+"SPD").attr("x", d => x(d.created_at) - 5).style("display","initial");
        partysvg.selectAll(".point"+grp+"CDU").attr("x", d => x(d.created_at) - 5).style("display","initial");
        partysvg.selectAll(".point"+grp+"Gruenen").attr("x", d => x(d.created_at) - 5).style("display","initial");
        partysvg.selectAll(".point"+grp+"DIELINKE").attr("x", d => x(d.created_at) - 5).style("display","initial");
        partysvg.selectAll(".point"+grp+"AfD").attr("x", d => x(d.created_at) - 5).style("display","initial");
        partysvg.selectAll(".point"+grp+"FDP").attr("x", d => x(d.created_at) - 5).style("display","initial");
      }
      if(grp==="Climate"){
        partysvg.selectAll(".point"+grp+"SPD").attr("cx", d => x(d.created_at)).style("display","initial");
        partysvg.selectAll(".point"+grp+"CDU").attr("cx", d => x(d.created_at)).style("display","initial");
        partysvg.selectAll(".point"+grp+"Gruenen").attr("cx", d => x(d.created_at)).style("display","initial");
        partysvg.selectAll(".point"+grp+"DIELINKE").attr("cx", d => x(d.created_at)).style("display","initial");
        partysvg.selectAll(".point"+grp+"AfD").attr("cx", d => x(d.created_at)).style("display","initial");
        partysvg.selectAll(".point"+grp+"FDP").attr("cx", d => x(d.created_at)).style("display","initial");
      }
      if(grp==="Feminism"){
        partysvg.selectAll(".point"+grp+"SPD").attr("transform", function(d){
          if(d.stance === "AGAINST"){return "translate(" + x(d.created_at) + "," + y(-d.probability) + ")";}
          else if (d.stance === "NEUTRAL"){return "translate(" + x(d.created_at) + "," + y(0) + ")";}
          else{return "translate(" + x(d.created_at) + "," + y(d.probability) + ")";}
         }).style("display","initial");
        partysvg.selectAll(".point"+grp+"CDU").attr("transform", function(d){
          if(d.stance === "AGAINST"){return "translate(" + x(d.created_at) + "," + y(-d.probability) + ")";}
          else if (d.stance === "NEUTRAL"){return "translate(" + x(d.created_at) + "," + y(0) + ")";}
          else{return "translate(" + x(d.created_at) + "," + y(d.probability) + ")";}
         }).style("display","initial");
        partysvg.selectAll(".point"+grp+"Gruenen").attr("transform", function(d){
          if(d.stance === "AGAINST"){return "translate(" + x(d.created_at) + "," + y(-d.probability) + ")";}
          else if (d.stance === "NEUTRAL"){return "translate(" + x(d.created_at) + "," + y(0) + ")";}
          else{return "translate(" + x(d.created_at) + "," + y(d.probability) + ")";}
         }).style("display","initial");
        partysvg.selectAll(".point"+grp+"DIELINKE").attr("transform", function(d){
          if(d.stance === "AGAINST"){return "translate(" + x(d.created_at) + "," + y(-d.probability) + ")";}
          else if (d.stance === "NEUTRAL"){return "translate(" + x(d.created_at) + "," + y(0) + ")";}
          else{return "translate(" + x(d.created_at) + "," + y(d.probability) + ")";}
         }).style("display","initial");
        partysvg.selectAll(".point"+grp+"AfD").attr("transform", function(d){
          if(d.stance === "AGAINST"){return "translate(" + x(d.created_at) + "," + y(-d.probability) + ")";}
          else if (d.stance === "NEUTRAL"){return "translate(" + x(d.created_at) + "," + y(0) + ")";}
          else{return "translate(" + x(d.created_at) + "," + y(d.probability) + ")";}
         }).style("display","initial");
        partysvg.selectAll(".point"+grp+"FDP").attr("transform", function(d){
          if(d.stance === "AGAINST"){return "translate(" + x(d.created_at) + "," + y(-d.probability) + ")";}
          else if (d.stance === "NEUTRAL"){return "translate(" + x(d.created_at) + "," + y(0) + ")";}
          else{return "translate(" + x(d.created_at) + "," + y(d.probability) + ")";}
         }).style("display","initial");
      }
      //bubble points
      partysvg.selectAll(".points"+grp+"Bubble").style("display","initial");
    }
    else{
      //line
      partysvg.selectAll(".line"+grp+"SPD").style("display","none");
      partysvg.selectAll(".line"+grp+"CDU").style("display","none");
      partysvg.selectAll(".line"+grp+"DIELINKE").style("display","none");
      partysvg.selectAll(".line"+grp+"AfD").style("display","none");
      partysvg.selectAll(".line"+grp+"Gruenen").style("display","none");
      partysvg.selectAll(".line"+grp+"FDP").style("display","none");
      //lines tweets per week
      partysvg.selectAll(".lineWeek"+grp+"SPD").style("display","none");
      partysvg.selectAll(".lineweek"+grp+"CDU").style("display","none");
      partysvg.selectAll(".lineWeek"+grp+"DIELINKE").style("display","none");
      partysvg.selectAll(".lineWeek"+grp+"AfD").style("display","none");
      partysvg.selectAll(".lineWeek"+grp+"Gruenen").style("display","none");
      partysvg.selectAll(".lineWeek"+grp+"FDP").style("display","none");
      //point
      partysvg.selectAll(".point"+grp+"SPD").style("display","none");
      partysvg.selectAll(".point"+grp+"CDU").style("display","none");
      partysvg.selectAll(".point"+grp+"DIELINKE").style("display","none");
      partysvg.selectAll(".point"+grp+"AfD").style("display","none");
      partysvg.selectAll(".point"+grp+"Gruenen").style("display","none");
      partysvg.selectAll(".point"+grp+"FDP").style("display","none");
      //bubble points
      partysvg.selectAll(".points"+grp+"Bubble").style("display","none");
    }
    doubleCheckParty(grp,select);
  });
  if(toggleState){
    partysvg.selectAll(".pointAbortionSPD").style("display", "none");
    partysvg.selectAll(".pointAbortionAfD").style("display", "none");
    partysvg.selectAll(".pointAbortionFDP").style("display", "none"); 
    partysvg.selectAll(".pointAbortionDIELINKE").style("display", "none");
    partysvg.selectAll(".pointAbortionGruenen").style("display", "none"); 
    partysvg.selectAll(".pointAbortionCDU").style("display", "none");

    partysvg.selectAll(".pointClimateSPD").style("display","none");
    partysvg.selectAll(".pointClimateAfD").style("display","none");
    partysvg.selectAll(".pointClimateFDP").style("display","none"); 
    partysvg.selectAll(".pointClimateDIELINKE").style("display","none");
    partysvg.selectAll(".pointClimateGruenen").style("display","none"); 
    partysvg.selectAll(".pointClimateCDU").style("display","none");

    partysvg.selectAll(".pointFeminismSPD").style("display", "none" );
    partysvg.selectAll(".pointFeminismAfD").style("display", "none");
    partysvg.selectAll(".pointFeminismFDP").style("display", "none"); 
    partysvg.selectAll(".pointFeminismDIELINKE").style("display", "none" );
    partysvg.selectAll(".pointFeminismGruenen").style("display", "none" ); 
    partysvg.selectAll(".pointFeminismCDU").style("display", "none");

  }
  if(toggleLi){
    partysvg.selectAll(".lineAbortionSPD").style("display", "none");
    partysvg.selectAll(".lineAbortionAfD").style("display", "none");
    partysvg.selectAll(".lineAbortionFDP").style("display", "none"); 
    partysvg.selectAll(".lineAbortionDIELINKE").style("display", "none");
    partysvg.selectAll(".lineAbortionGruenen").style("display", "none"); 
    partysvg.selectAll(".lineAbortionCDU").style("display", "none");

    partysvg.selectAll(".lineClimateSPD").style("display", "none");
    partysvg.selectAll(".lineClimateAfD").style("display", "none");
    partysvg.selectAll(".lineClimateFDP").style("display", "none"); 
    partysvg.selectAll(".lineClimateDIELINKE").style("display","none");
    partysvg.selectAll(".lineClimateGruenen").style("display","none"); 
    partysvg.selectAll(".lineClimateCDU").style("display","none");

    partysvg.selectAll(".lineFeminismSPD").style("display",  "none");
    partysvg.selectAll(".lineFeminismAfD").style("display","none");
    partysvg.selectAll(".lineFeminismFDP").style("display","none"); 
    partysvg.selectAll(".lineFeminismDIELINKE").style("display","none");
    partysvg.selectAll(".lineFeminismGruenen").style("display","none"); 
    partysvg.selectAll(".lineFeminismCDU").style("display", "none");
  }
  if(toggleLiWeek){
    partysvg.selectAll(".lineWeekAbortionSPD").style("display", "none");
    partysvg.selectAll(".lineWeekAbortionAfD").style("display", "none");
    partysvg.selectAll(".lineWeekAbortionFDP").style("display", "none"); 
    partysvg.selectAll(".lineWeekAbortionDIELINKE").style("display", "none");
    partysvg.selectAll(".lineWeekAbortionGruenen").style("display", "none"); 
    partysvg.selectAll(".lineWeekAbortionCDU").style("display", "none");

    partysvg.selectAll(".lineWeekClimateSPD").style("display", "none");
    partysvg.selectAll(".lineWeekClimateAfD").style("display", "none");
    partysvg.selectAll(".lineWeekClimateFDP").style("display", "none"); 
    partysvg.selectAll(".lineWeekClimateDIELINKE").style("display","none");
    partysvg.selectAll(".lineWeekClimateGruenen").style("display","none"); 
    partysvg.selectAll(".lineWeekClimateCDU").style("display","none");

    partysvg.selectAll(".lineWeekFeminismSPD").style("display",  "none");
    partysvg.selectAll(".lineWeekFeminismAfD").style("display","none");
    partysvg.selectAll(".lineWeekFeminismFDP").style("display","none"); 
    partysvg.selectAll(".lineWeekFeminismDIELINKE").style("display","none");
    partysvg.selectAll(".lineWeekFeminismGruenen").style("display","none"); 
    partysvg.selectAll(".lineWeekFeminismCDU").style("display", "none");
  }
  
};
function doubleCheckParty(topic,select){
  d3.selectAll(".checkboxparty").each(function(d){
    cb = d3.select(this);
    grp = cb.property("value");
    if(cb.property("checked")&&select){
      //line
      partysvg.selectAll(".line"+topic+grp).style("display","initial");
      //lines tweets per week
      partysvg.selectAll(".lineWeek"+topic+grp).style("display","initial");
      //point
      partysvg.selectAll(".point"+topic+grp).style("display","initial");
    }
    else{
      //line
      partysvg.selectAll(".line"+topic+grp).style("display","none");
      //lines tweets per week
      partysvg.selectAll(".lineWeek"+topic+grp).style("display","none");
      //point
      partysvg.selectAll(".point"+topic+grp).style("display","none");
    }

  });
};
function updateParty(){
  d3.selectAll(".checkboxparty").each(function(d){
      cb = d3.select(this);
      grp = cb.property("value");
      select = cb.property("checked");

      if(cb.property("checked")){
        //line
          partysvg.selectAll(".line"+"Feminism"+grp).style("display","initial");
          partysvg.selectAll(".line"+"Climate"+grp).style("display","initial");
          partysvg.selectAll(".line"+"Abortion"+grp).style("display","initial");
        //lines tweets per week
          partysvg.selectAll(".lineWeek"+"Feminism"+grp).style("display","initial");
          partysvg.selectAll(".lineWeek"+"Climate"+grp).style("display","initial");
          partysvg.selectAll(".lineWeek"+"Abortion"+grp).style("display","initial");
          //point
          partysvg.selectAll(".point"+"Feminism"+grp).style("display","initial");
          partysvg.selectAll(".point"+"Climate"+grp).style("display","initial");
          partysvg.selectAll(".point"+"Abortion"+grp).style("display","initial");
      }
      else{
        //line
        partysvg.selectAll(".line"+"Feminism"+grp).style("display","none");
        partysvg.selectAll(".line"+"Climate"+grp).style("display","none");
        partysvg.selectAll(".line"+"Abortion"+grp).style("display","none");
        //lines tweets per week
        partysvg.selectAll(".lineWeek"+"Feminism"+grp).style("display","none");
        partysvg.selectAll(".lineweek"+"Climate"+grp).style("display","none");
        partysvg.selectAll(".lineWeek"+"Abortion"+grp).style("display","none");
        //point
        partysvg.selectAll(".point"+"Feminism"+grp).style("display","none");
        partysvg.selectAll(".point"+"Climate"+grp).style("display","none");
        partysvg.selectAll(".point"+"Abortion"+grp).style("display","none");
      }
      doubleCheckTopic(grp,select);
  });
  if(toggleState){
    partysvg.selectAll(".pointAbortionSPD").style("display", "none");
    partysvg.selectAll(".pointAbortionAfD").style("display", "none");
    partysvg.selectAll(".pointAbortionFDP").style("display", "none"); 
    partysvg.selectAll(".pointAbortionDIELINKE").style("display", "none");
    partysvg.selectAll(".pointAbortionGruenen").style("display", "none"); 
    partysvg.selectAll(".pointAbortionCDU").style("display", "none");

    partysvg.selectAll(".pointClimateSPD").style("display","none");
    partysvg.selectAll(".pointClimateAfD").style("display","none");
    partysvg.selectAll(".pointClimateFDP").style("display","none"); 
    partysvg.selectAll(".pointClimateDIELINKE").style("display","none");
    partysvg.selectAll(".pointClimateGruenen").style("display","none"); 
    partysvg.selectAll(".pointClimateCDU").style("display","none");

    partysvg.selectAll(".pointFeminismSPD").style("display", "none" );
    partysvg.selectAll(".pointFeminismAfD").style("display", "none");
    partysvg.selectAll(".pointFeminismFDP").style("display", "none"); 
    partysvg.selectAll(".pointFeminismDIELINKE").style("display", "none" );
    partysvg.selectAll(".pointFeminismGruenen").style("display", "none" ); 
    partysvg.selectAll(".pointFeminismCDU").style("display", "none");

  }
  if(toggleLi){
    partysvg.selectAll(".lineAbortionSPD").style("display", "none");
    partysvg.selectAll(".lineAbortionAfD").style("display", "none");
    partysvg.selectAll(".lineAbortionFDP").style("display", "none"); 
    partysvg.selectAll(".lineAbortionDIELINKE").style("display", "none");
    partysvg.selectAll(".lineAbortionGruenen").style("display", "none"); 
    partysvg.selectAll(".lineAbortionCDU").style("display", "none");

    partysvg.selectAll(".lineClimateSPD").style("display", "none");
    partysvg.selectAll(".lineClimateAfD").style("display", "none");
    partysvg.selectAll(".lineClimateFDP").style("display", "none"); 
    partysvg.selectAll(".lineClimateDIELINKE").style("display","none");
    partysvg.selectAll(".lineClimateGruenen").style("display","none"); 
    partysvg.selectAll(".lineClimateCDU").style("display","none");

    partysvg.selectAll(".lineFeminismSPD").style("display",  "none");
    partysvg.selectAll(".lineFeminismAfD").style("display","none");
    partysvg.selectAll(".lineFeminismFDP").style("display","none"); 
    partysvg.selectAll(".lineFeminismDIELINKE").style("display","none");
    partysvg.selectAll(".lineFeminismGruenen").style("display","none"); 
    partysvg.selectAll(".lineFeminismCDU").style("display", "none");
  }
  if(toggleLiWeek){
    partysvg.selectAll(".lineWeekAbortionSPD").style("display", "none");
    partysvg.selectAll(".lineWeekAbortionAfD").style("display", "none");
    partysvg.selectAll(".lineWeekAbortionFDP").style("display", "none"); 
    partysvg.selectAll(".lineWeekAbortionDIELINKE").style("display", "none");
    partysvg.selectAll(".lineWeekAbortionGruenen").style("display", "none"); 
    partysvg.selectAll(".lineWeekAbortionCDU").style("display", "none");

    partysvg.selectAll(".lineWeekClimateSPD").style("display", "none");
    partysvg.selectAll(".lineWeekClimateAfD").style("display", "none");
    partysvg.selectAll(".lineWeekClimateFDP").style("display", "none"); 
    partysvg.selectAll(".lineWeekClimateDIELINKE").style("display","none");
    partysvg.selectAll(".lineWeekClimateGruenen").style("display","none"); 
    partysvg.selectAll(".lineWeekClimateCDU").style("display","none");

    partysvg.selectAll(".lineWeekFeminismSPD").style("display",  "none");
    partysvg.selectAll(".lineWeekFeminismAfD").style("display","none");
    partysvg.selectAll(".lineWeekFeminismFDP").style("display","none"); 
    partysvg.selectAll(".lineWeekFeminismDIELINKE").style("display","none");
    partysvg.selectAll(".lineWeekFeminismGruenen").style("display","none"); 
    partysvg.selectAll(".lineWeekFeminismCDU").style("display", "none");
  }
};
function doubleCheckTopic(name,select){
  d3.selectAll(".checkboxtopic").each(function(d){
      cb = d3.select(this);
      grp = cb.property("value");

      if(cb.property("checked")&&select){
        //line
          partysvg.selectAll(".line"+grp+name).style("display","initial");
        //lines tweets per week
          partysvg.selectAll(".lineweek"+grp+name).style("display","initial");
          //point
          partysvg.selectAll(".point"+grp+name).style("display","initial");
      }
      else{
        //line
          partysvg.selectAll(".line"+grp+name).style("display","none");
        //lines tweets per week
          partysvg.selectAll(".lineWeek"+grp+name).style("display","none");
          //point
          partysvg.selectAll(".point"+grp+name).style("display","none");
      }
  });
};
//when button change, run update function
d3.selectAll(".checkboxparty").on("change",updateParty);
d3.selectAll(".checkboxtopic").on("change",updateTopic);
//update graph according to selected parties
/*function updateParty(){
  var selectbutton = d3.select('input[name="topic"]:checked').node().value;
  d3.selectAll(".checkboxparty").each(function(d){
    cb = d3.select(this);
    grp = cb.property("value");
    select = cb.property("checked");

    if(cb.property("checked")){
      //line
        partysvg.selectAll(".line"+grp).style("display","initial");
        //point
        partysvg.selectAll(".point"+grp).style("display","initial");
    }
    else{
      //line
      partysvg.selectAll(".line"+grp).style("display","none");
      //point
      partysvg.selectAll(".point"+grp).style("display","none");
    }
  });

};
//function update chart for radio buttons
function updateGraph(){
  // Remove any existing lines
  partysvg.select(".lineDIELINKE").remove();
  partysvg.select(".lineCDU").remove();
  partysvg.select(".lineFDP").remove();
  partysvg.select(".lineSPD").remove();
  partysvg.select(".lineAfD").remove();
  partysvg.select(".lineGruenen").remove();
  //Remove any existing point
  partysvg.selectAll(".pointDIELINKE").remove();
  partysvg.selectAll(".pointCDU").remove();
  partysvg.selectAll(".pointFDP").remove();
  partysvg.selectAll(".pointSPD").remove();
  partysvg.selectAll(".pointAfD").remove();
  partysvg.selectAll(".pointGruenen").remove();
  var selectedValue = d3.select('input[name="topic"]:checked').node().value;
  if(selectedValue==="Abortion"){
    var data=grouped_abortion;
    var data_point=abortion;
    //update x scale
    var extent =d3.extent(dates_abortion);
    x.domain(extent);
    var numberofDays = d3.timeDay.count(extent[0],extent[1]);
    var spanElement = d3.select("#days");
    spanElement.text(numberofDays.toString());
    XaxisParty.transition().call(d3.axisBottom(x));
    var Inputstart = d3.select(".start");
    Inputstart.attr("min", "2021-11-24");
    Inputstart.attr("max", "2022-07-02");
    Inputstart.attr("value","2021-11-24");
    var Inputend = d3.select(".end");
    Inputend.attr("min", "2021-11-24");
    Inputend.attr("max", "2022-07-02");
    Inputend.attr("value", "2022-07-02");

  }
  else if(selectedValue==="Climate"){
    var data=grouped_climate;
    var data_point=climate;
    //update x scale
    var extent = d3.extent(dates_climate);
    x.domain(extent);
    //number of days
    var numberofDays = d3.timeDay.count(extent[0],extent[1]);
    var spanElement = d3.select("#days");
    spanElement.text(numberofDays.toString());
    //x axis
    XaxisParty.transition().call(d3.axisBottom(x));
    //time selection
    var Inputstart = d3.select(".start");
    Inputstart.attr("min", "2021-04-28");
    Inputstart.attr("max", "2021-11-25");
    Inputstart.attr("value", "2021-04-28");
    var Inputend = d3.select(".end");
    Inputend.attr("min", "2021-04-28");
    Inputend.attr("max", "2021-11-25");
    Inputend.attr("value","2021-11-25");
  }
  else{
    var data=grouped_feminism;
    var data_point=feminism;
    var extent = d3.extent(dates_feminism);
    x.domain(extent);
    var numberofDays = d3.timeDay.count(extent[0],extent[1]);
    var spanElement = d3.select("#days");
    spanElement.text(numberofDays.toString());
    XaxisParty.transition().call(d3.axisBottom(x));
    var Inputstart = d3.select(".start");
    Inputstart.attr("min", "2020-03-07");
    Inputstart.attr("max", "2022-09-29");
    Inputstart.attr("value", "2020-03-07");
    var Inputend = d3.select(".end");
    Inputend.attr("min", "2020-03-07");
    Inputend.attr("max", "2022-09-29");
    Inputend.attr("value", "2022-09-29");
  }
  //lines for the selected topic
   Line=partysvg.selectAll(".line")
    .data(data)
    .enter()
    .append("path")
    .attr("class",function(d){if(d[0]==="DIE LINKE."){return "lineDIELINKE";}
    else if(d[0]==="BÜ90/GR"){return "lineGruenen";}else if(d[0]==="CDU/CSU"){return "lineCDU";}else{return "line"+d[0];}})
    .attr("d", d => line(d[1]))
    .attr("stroke", d => colorScale(d[0]))
    .attr("fill","none")
    .attr("stroke_width",1.5);
  //points for the selected topic
   Points=  partysvg.selectAll(".point")
    .data(data_point)
    .enter()
    .append("circle")
    .attr("class",function(d){if(d.party==="DIE LINKE."){return "pointDIELINKE";}
    else if(d.party==="BÜ90/GR"){return "pointGruenen";}else if(d.party==="CDU/CSU"){return "pointCDU";}else{return "point"+d.party;}})
    .attr("cx", d => x(d.created_at)) 
    .attr("cy",function(d){
        if(d.stance === "AGAINST"){return y(-d.probability);}
        else if (d.stance === "NEUTRAL"){return y(0);}
        else{return y(d.probability);}
       } ) 
    .attr("r", 5) // Set the radius of the points
    .attr("fill", d => colorScale(d.party))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  //check for selected Parties
  updateParty();

}
d3.selectAll('input[name="topic"]').on("change",updateGraph);
d3.selectAll(".checkboxparty").on("change",updateParty);*/
//time range slider
/*var numberofDays = d3.timeDay.count(xExtent[0],xExtent[1]);
var spanElement = d3.select("#days");
    spanElement.text(numberofDays.toString());
    
    var timeRange = d3.scaleTime().domain(xExtent).range([0,numberofDays]);
    var rangeInputMin = d3.select(".start");
    var rangeInputMax= d3.select(".end");

rangeInputMin.on("change",function(d){
      let minDate= new Date(this.value);
      console.log(this.value);
      let maxDate= new Date(rangeInputMax.property("value"));
      d3.select("#days").text(d3.timeDay.count(minDate,maxDate));
      updateChart(minDate,maxDate);
      
  });
rangeInputMax.on("change",function(d){
      let minDate = new Date(rangeInputMin.property("value"));
      let maxDate= new Date(this.value);
      d3.select("#days").text(d3.timeDay.count(minDate,maxDate));
      updateChart(minDate,maxDate);
      
  });

//filter datasets according to selected start and end date
function filterData(dataset,start,end){
  const filtered = dataset.filter(function(d){return new Date(d.created_at)>=new Date(start)&&new Date(d.created_at)<=new Date(end);});
  var grouped_data =d3.group(filtered, d => d.party);
  return grouped_data;
};
function filterPoints(dataset,start,end){
  const filtered = dataset.filter(function(d){return new Date(d.created_at)>=new Date(start)&&new Date(d.created_at)<=new Date(end);});
  return filtered;
};
//update chart according to time selection
function updateChart(start,end){
  x.domain([start,end]);
  XaxisParty.transition().call(d3.axisBottom(x));
  //update lines
  abortionLine.data(filterData(sorted_abortion,start,end)).attr("d",d => line(d[1]));
  climateLine.data(filterData(sorted_climate,start,end)).attr("d",d => line(d[1]));
  feminismLine.data(filterData(sorted_feminism,start,end)).attr("d",d => line(d[1]));
  //update points
  var data_abortion =filterPoints(abortion,start,end);
  var data_climate =filterPoints(climate,start,end);
  var data_feminism =filterPoints(feminism,start,end);
  var selectedValue = d3.select('input[name="topic"]:checked').node().value;
  //remove abortion points
  partysvg.selectAll(".pointAbortionDIELINKE").remove();
  partysvg.selectAll(".pointAbortionCDU").remove();
  partysvg.selectAll(".pointAbortionFDP").remove();
  partysvg.selectAll(".pointAbortionSPD").remove();
  partysvg.selectAll(".pointAbortionAfD").remove();
  partysvg.selectAll(".pointAbortionGruenen").remove();
  //remove climate points
  partysvg.selectAll(".pointClimateDIELINKE").remove();
  partysvg.selectAll(".pointClimateCDU").remove();
  partysvg.selectAll(".pointClimateFDP").remove();
  partysvg.selectAll(".pointClimateSPD").remove();
  partysvg.selectAll(".pointClimateAfD").remove();
  partysvg.selectAll(".pointClimateGruenen").remove();
  //remove feminism points
  partysvg.selectAll(".pointFeminismDIELINKE").remove();
  partysvg.selectAll(".pointFeminismCDU").remove();
  partysvg.selectAll(".pointFeminismFDP").remove();
  partysvg.selectAll(".pointFeminismSPD").remove();
  partysvg.selectAll(".pointFeminismAfD").remove();
  partysvg.selectAll(".pointFeminismGruenen").remove();
  // update abortion points
  partysvg.selectAll(".point")
  .data(data_abortion)
  .enter()
  .append("rect")
  .attr("class", function(d) {
    if (d.party === "DIE LINKE.") {
      return "pointAbortionDIELINKE";
    } else if (d.party === "BÜ90/GR") {
      return "pointAbortionGruenen";
    } else if (d.party === "CDU/CSU") {
      return "pointAbortionCDU";
    } else {
      return "pointAbortion" + d.party;
    }
  })
  .attr("x", d => x(d.created_at) - 5) // Adjust the square's x position to center it around the x-coordinate
  .attr("y", function(d){
    if(d.stance === "AGAINST"){return y(-d.probability)-5;}
    else if (d.stance === "NEUTRAL"){return y(0)-5;}
    else{return y(d.probability)-5;}
   }) // Adjust the square's y position to center it around the y-coordinate
  .attr("width", 10) // Set the width of the square
  .attr("height", 10) // Set the height of the square
  .attr("fill", d => colorScale(d.party))
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave);
  // update climate points
  partysvg.selectAll(".point")
    .data(data_climate)
    .enter()
    .append("circle")
    .attr("class",function(d){if(d.party==="DIE LINKE."){return "pointClimateDIELINKE";}
    else if(d.party==="BÜ90/GR"){return "pointClimateGruenen";}else if(d.party==="CDU/CSU"){return "pointClimateCDU";}else{return "pointClimate"+d.party;}})
    .attr("cx", d => x(d.created_at)) 
    .attr("cy",function(d){
        if(d.stance === "AGAINST"){return y(-d.probability);}
        else if (d.stance === "NEUTRAL"){return y(0);}
        else{return y(d.probability);}
       } ) 
    .attr("r", 5) // Set the radius of the points
    .attr("fill", d => colorScale(d.party))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
  //update feminism points
  partysvg.selectAll(".point")
  .data(data_feminism)
  .enter()
  .append("path")
  .attr("class", function(d) {
    if (d.party === "DIE LINKE.") {
      return "pointFeminismDIELINKE";
    } else if (d.party === "BÜ90/GR") {
      return "pointFeminismGruenen";
    } else if (d.party === "CDU/CSU") {
      return "pointFeminismCDU";
    } else {
      return "pointFeminism" + d.party;
    }
  })
  .attr("transform", function(d){
    if(d.stance === "AGAINST"){return "translate(" + x(d.created_at) + "," + y(-d.probability) + ")";}
    else if (d.stance === "NEUTRAL"){return "translate(" + x(d.created_at) + "," + y(0) + ")";}
    else{return "translate(" + x(d.created_at) + "," + y(d.probability) + ")";}
   }) // Translate the path to the point's position
  .attr("d", "M 0 -5 L 5 5 L -5 5 Z") // Define the path data for a triangle
  .attr("fill", d => colorScale(d.party))
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave);
  //check visibility of the lines and points
  updateParty();
};*/
//bubbletree
var color_tree = d3.scaleLinear()
    .domain([0, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);
const pack = d3.pack()
    .size([width, height])
    .padding(3);
const root = d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);
//const nodes = pack(root).descendants();
const nodes=pack(root);
let focus = nodes;
let view;

const bubbles = bubbletree.selectAll('circle')
  .data(nodes.descendants().slice(1))
  .enter()
  .append('circle')
  .attr('r', d => d.r)
  .attr('cx', d => d.x)
  .attr('cy', d => d.y)
  .style('fill', d => {
    const name = d.data.name;
    switch (name) {
      case 'CDU':
        return 'black';
      case 'SPD':
        return 'red';
      case 'AfD':
        return 'blue';
      case 'Gruenen':
        return 'green';
      case 'FDP':
        return 'yellow';
      case 'DIELINKE':
        return 'pink';
      default:
        if (d.depth < root.height) {
          // Set opacity based on depth
          const opacity = 0.5 + (d.depth / root.height) * 0.5; // Adjust opacity range as needed
          return `rgba(255, 255, 255, ${opacity})`;
        } else {
          // Last generation bubbles should be white
          return 'white';
        }
    }
  })
  //.on("mouseover", function() { d3.select(this).attr("stroke", "#000").attr("stroke-width",1); })
  //.on("mouseout", function() { d3.select(this).attr("stroke", null); })
  /*.on("click",function(event,d){
    var selectedBubble =d3.select(this);
    var bubbleName = d.data.name;
  if (selectedBubble.attr("stroke") === "#000") {
    // stroke is the initial value, change it to a different value
    selectedBubble.attr("stroke", null);
    var selectedCheckboxes = d3.selectAll(".checkboxparty")
  .each(function(d) {
    if(d3.select(this).property("value") === bubbleName){
      d3.select(this).property("checked", false);
    }
  });
  updateParty();
  } else {
    // stroke is different, change it back to the initial value
    selectedBubble.attr("stroke", "#000").attr("stroke-width",1.5);
    console.log(d.data.name);
    var selectBubblename = d.data.name;
    handleClick(selectBubblename);
  }

  });*/
  .on("click", function(event,d){
    var pointer = d3.select(this);
    handleBubbleSelection(d,pointer);
  })
  .on("mouseover", poliMouseover)
  .on("mousemove", poliMousemove)
  .on("mouseleave", poliMouseleave);
//label for each bubble  
const labels = bubbletree.selectAll('text')
  .data(nodes.descendants().slice(1))
  .enter()
  .append('text')
  .text(d => d.data.name)
  .attr('x', d => d.x)
  .attr('y', d => d.y)
  .attr('dy', '0.35em')
  .attr("text-anchor", "middle")
  .style("fill-opacity", d => d.parent === root ? 1 : 0)
  .style("display", d => d.parent === root ? "inline" : "none");

//click function for bubbles, filter data
let selectedBubblesParty = [];
let selectedBubblesPeople = [];
let people =politicians.map((d) => d.user);
function handleBubbleSelection(d,pointer){
  // Check if the bubble is already selected, then unselect it (remove from selection)
  if(people.includes(d.data.name)){
    if (selectedBubblesPeople.includes(d.data.name)) {
      selectedBubblesPeople = selectedBubblesPeople.filter(bubble => bubble !== d.data.name);
      pointer.attr("stroke", null);
    } else {
      // Otherwise, add the bubble to the selection
      pointer.attr("stroke", "#000").attr("stroke-width",1.5);
      selectedBubblesPeople.push(d.data.name);
    }
  }
  else if(d.data.name==="AfD"||d.data.name==="SPD"||d.data.name==="CDU"||d.data.name==="FDP"||d.data.name==="DIELINKE"||d.data.name==="Gruenen"){
    if (selectedBubblesParty.includes(d)) {
      selectedBubblesParty = selectedBubblesParty.filter(bubble => bubble !== d);
      pointer.attr("stroke", null);
    } else {
      // Otherwise, add the bubble to the selection
      pointer.attr("stroke", "#000").attr("stroke-width",1.5);
      selectedBubblesParty.push(d);
    }

  }
  // Update the visualization 
  updateVisualizationParty(d.data.name);
  partysvg.selectAll(".pointsAbortionBubble").remove();
  partysvg.selectAll(".pointsClimateBubble").remove();
  partysvg.selectAll(".pointsFeminismBubble").remove();
  updateVisualizationPeople();
}
// Function to update the visualization based on selectedBubbles
function updateVisualizationParty(selectBubblename) {
  // Here, you can apply the black stroke to selected bubbles
  

  // Now, you can check the number of selected bubbles:
  const numSelectedBubbles = selectedBubblesParty.length;

  if (numSelectedBubbles === 0) {
    d3.selectAll(".checkboxparty")
      .each(function(d) {
        d3.select(this).property("checked", true);
        
    });
    updateParty();
  } else if (numSelectedBubbles === 1) {
    d3.selectAll(".checkboxparty")
      .each(function(d) {
        if(d3.select(this).property("value") === selectedBubblesParty[0].data.name){
          d3.select(this).property("checked", true);
        }
        else{
          d3.select(this).property("checked", false);
        }
    });
    updateParty();
  } else {
    let bubbleselectedName = selectedBubblesParty.map((d) => d.data.name)
    d3.selectAll(".checkboxparty")
      .each(function(d) {
        if(bubbleselectedName.includes(d3.select(this).property("value"))){
          d3.select(this).property("checked", true);
        }
        else{
          d3.select(this).property("checked", false);
        }
    });
    updateParty();
  }
}

function updateVisualizationPeople(){
  const numSelectedBubblesPeople = selectedBubblesPeople.length;
  var filteredDataAbortion = abortion.filter(function(d) {
    return selectedBubblesPeople.includes(d.user);
  });
  var filteredDataClimate = climate.filter(function(d) {
    return selectedBubblesPeople.includes(d.user);
  });
  var filteredDataFeminism = feminism.filter(function(d) {
    return selectedBubblesPeople.includes(d.user);
  });
  //color scale for people to give each user another stroke color
  const strokeColorScale = d3.scaleOrdinal()
  .range(["#4fff00","#ffffff"]);
  const peopleStrokeAbortion = filteredDataAbortion.map(d => d.user); // Extract the people from the data
  const peopleStrokeClimate = filteredDataClimate.map(d => d.user);
  const peopleStrokeFeminism = filteredDataFeminism.map(d => d.user);
  const peopleStroke = peopleStrokeAbortion.concat(peopleStrokeClimate,peopleStrokeFeminism); 
  strokeColorScale.domain([...new Set(peopleStroke)]);

  //pointsPeopleAbortion.exit().remove();
  //pointsPeopleClimate.exit().remove();
  //pointsPeopleFeminism.exit().remove();
  //points for topic feminism
   var pointsPeopleFeminism = partysvg.selectAll("point")
  .data(filteredDataFeminism)
  .enter()
  .append("path")
  /*.attr("class", function(d) {
    if (d.party === "DIE LINKE.") {
      return "pointBubbleFeminismDIELINKE";
    } else if (d.party === "BÜ90/GR") {
      return "pointBubbleFeminismGruenen";
    } else if (d.party === "CDU/CSU") {
      return "pointBubbleFeminismCDU";
    } else {
      return "pointBubbleFeminism" + d.party;
    }
  })*/
  .attr("class", "pointsFeminismBubble")
  .attr("transform", function(d){
    if(d.stance === "AGAINST"){return "translate(" + x(d.created_at) + "," + y(-d.probability) + ")";}
    else if (d.stance === "NEUTRAL"){return "translate(" + x(d.created_at) + "," + y(0) + ")";}
    else{return "translate(" + x(d.created_at) + "," + y(d.probability) + ")";}
   }) // Translate the path to the point's position
  .attr("d", "M 0 -5 L 5 5 L -5 5 Z") // Define the path data for a triangle
  .attr("fill", d => colorScale(d.party))
  .attr("stroke", d => strokeColorScale(d.user))
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleaveBubble);
  //points for the topic abortion
  var pointsPeopleAbortion = partysvg.selectAll("point")
  .data(filteredDataAbortion)
  .enter()
  .append("rect")
  /*.attr("class", function(d) {
    if (d.party === "DIE LINKE.") {
      return "pointBubbleAbortionDIELINKE";
    } else if (d.party === "BÜ90/GR") {
      return "pointBubbleAbortionGruenen";
    } else if (d.party === "CDU/CSU") {
      return "pointBubbleAbortionCDU";
    } else {
      return "pointBubbleAbortion" + d.party;
    }
  })*/
  .attr("class", "pointsAbortionBubble")
  .attr("x", d => x(d.created_at) - 5) // Adjust the square's x position to center it around the x-coordinate
  .attr("y", function(d){
    if(d.stance === "AGAINST"){return y(-d.probability)-5;}
    else if (d.stance === "NEUTRAL"){return y(0)-5;}
    else{return y(d.probability)-5;}
   }) // Adjust the square's y position to center it around the y-coordinate
  .attr("width", 10) // Set the width of the square
  .attr("height", 10) // Set the height of the square
  .attr("fill", d => colorScale(d.party))
  .attr("stroke", d => strokeColorScale(d.user))
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleaveBubble);
  //points for each party from topic climate
  var pointsPeopleClimate= partysvg.selectAll("point")
    .data(filteredDataClimate)
    .enter()
    .append("circle")
    /*.attr("class",function(d){if(d.party==="DIE LINKE."){return "pointBubbleClimateDIELINKE";}
    else if(d.party==="BÜ90/GR"){return "pointBubbleClimateGruenen";}else if(d.party==="CDU/CSU"){return "pointBubbleClimateCDU";}else{return "pointBubbleClimate"+d.party;}})*/
    .attr("class", "pointsClimateBubble")
    .attr("cx", d => x(d.created_at)) 
    .attr("cy",function(d){
        if(d.stance === "AGAINST"){return y(-d.probability);}
        else if (d.stance === "NEUTRAL"){return y(0);}
        else{return y(d.probability);}
       } ) 
    .attr("r", 5) // Set the radius of the points
    .attr("fill", d => colorScale(d.party))
    .attr("stroke", d => strokeColorScale(d.user))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleaveBubble);  
    
}
//brushing
/*partysvg
      .call( d3.brush()                     // Add the brush feature using the d3.brush function
        .extent( [ [30,30], [400,400] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      )*/
  
  

  

};