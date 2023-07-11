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

function my_Func(abortion,climate,feminism,data){
  
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
     var xExtent = d3.extent(dates_feminism);
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

    var mouseover = function(d) {
      Tooltip
        .style("opacity", 1);
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1);
    };
    var mousemove = function(event,d) {
      Tooltip
        .html("user: " + d.user+"<br>stance: "+d.stance+"<br>date: "+new Date(d.created_at)+"<br>tweet: "+d.translated_text)
        .style("left", (event.pageX+70) + "px")
        .style("top", (event.pageY) + "px");
    };
    var mouseleave = function(d) {
      Tooltip
        .style("opacity", 0);
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8);
    }
    //line function
    var line = d3.line().curve(d3.curveBasis).x(function(d){return x(d.created_at);})
    .y(function(d){
     if(d.stance === "AGAINST"){return y(-d.probability);}
     else if (d.stance === "NEUTRAL"){return y(0);}
     else{return y(d.probability);}
    });

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

    //colors for each line
    var color = ['red','black','green','yellow','blue','pink'];
    const colorScale = d3.scaleOrdinal()
    .domain(["SPD", "CDU/CSU", "BÜ90/GR","FDP","AfD","DIE LINKE."])
    .range(color);
    //path for each party from topic abortion

    var grouped_abortion =d3.group(sorted_abortion, d => d.party);
    var grouped_climate =d3.group(sorted_climate, d => d.party);
    var grouped_feminism =d3.group(sorted_feminism, d => d.party);
    
    var Line=partysvg.selectAll(".line")
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
    .on("mouseleave", mouseleave);
    /*var abortionLine=partysvg.selectAll(".line")
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
    partysvg.selectAll(".point")
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
    partysvg.selectAll(".point")
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

    // Define a toggle state variable
let toggleState = false;

// Add event listener to the button
document.getElementById("toggleButton").addEventListener("click", togglePoints);

// Event handler function
function togglePoints() {
  // Toggle the state
  toggleState = !toggleState;

  // Select all points and update their visibility based on the toggle state
  partysvg.selectAll(".pointSPD").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointAfD").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointFDP").style("display", toggleState ? "none" : "initial"); 
  partysvg.selectAll(".pointDIELINKE").style("display", toggleState ? "none" : "initial");
  partysvg.selectAll(".pointGruenen").style("display", toggleState ? "none" : "initial"); 
  partysvg.selectAll(".pointCDU").style("display", toggleState ? "none" : "initial");
  //check selected parties
  d3.selectAll(".checkboxparty").each(function(d){
    cb = d3.select(this);
    grp = cb.property("value");
    select = cb.property("checked");

    if(!cb.property("checked")&&toggleState==false){
        //point
        partysvg.selectAll(".point"+grp).style("display","none");
    };
  });

}

//add function to change visability of the lines and points
/*function updateTopic(){
  d3.selectAll(".checkboxtopic").each(function(d){
    cb=d3.select(this);
    grp=cb.property("value");
    select=cb.property("checked");

    if(cb.property("checked")){
      //lines
      partysvg.selectAll(".line"+grp+"SPD").style("display","initial");
      partysvg.selectAll(".line"+grp+"CDU").style("display","initial");
      partysvg.selectAll(".line"+grp+"Gruenen").style("display","initial");
      partysvg.selectAll(".line"+grp+"DIELINKE").style("display","initial");
      partysvg.selectAll(".line"+grp+"AfD").style("display","initial");
      partysvg.selectAll(".line"+grp+"FDP").style("display","initial");
      //points
      partysvg.selectAll(".point"+grp+"SPD").style("display","initial");
      partysvg.selectAll(".point"+grp+"CDU").style("display","initial");
      partysvg.selectAll(".point"+grp+"Gruenen").style("display","initial");
      partysvg.selectAll(".point"+grp+"DIELINKE").style("display","initial");
      partysvg.selectAll(".point"+grp+"AfD").style("display","initial");
      partysvg.selectAll(".point"+grp+"FDP").style("display","initial");
    }
    else{
      //line
      partysvg.selectAll(".line"+grp+"SPD").style("display","none");
      partysvg.selectAll(".line"+grp+"CDU").style("display","none");
      partysvg.selectAll(".line"+grp+"DIELINKE").style("display","none");
      partysvg.selectAll(".line"+grp+"AfD").style("display","none");
      partysvg.selectAll(".line"+grp+"Gruenen").style("display","none");
      partysvg.selectAll(".line"+grp+"FDP").style("display","none");
      //point
      partysvg.selectAll(".point"+grp+"SPD").style("display","none");
      partysvg.selectAll(".point"+grp+"CDU").style("display","none");
      partysvg.selectAll(".point"+grp+"DIELINKE").style("display","none");
      partysvg.selectAll(".point"+grp+"AfD").style("display","none");
      partysvg.selectAll(".point"+grp+"Gruenen").style("display","none");
      partysvg.selectAll(".point"+grp+"FDP").style("display","none");
    }
    doubleCheckParty(grp,select);
  });
};
function doubleCheckParty(topic,select){
  d3.selectAll(".checkboxparty").each(function(d){
    cb = d3.select(this);
    grp = cb.property("value");
    if(cb.property("checked")&&select){
      //line
      partysvg.selectAll(".line"+topic+grp).style("display","initial");
      //point
      partysvg.selectAll(".point"+topic+grp).style("display","initial");
    }
    else{
      //line
      partysvg.selectAll(".line"+topic+grp).style("display","none");
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
        //point
        partysvg.selectAll(".point"+"Feminism"+grp).style("display","none");
        partysvg.selectAll(".point"+"Climate"+grp).style("display","none");
        partysvg.selectAll(".point"+"Abortion"+grp).style("display","none");
      }
      doubleCheckTopic(grp,select);
  });
};
function doubleCheckTopic(name,select){
  d3.selectAll(".checkboxtopic").each(function(d){
      cb = d3.select(this);
      grp = cb.property("value");

      if(cb.property("checked")&&select){
        //line
          partysvg.selectAll(".line"+grp+name).style("display","initial");
          //point
          partysvg.selectAll(".point"+grp+name).style("display","initial");
      }
      else{
        //line
          partysvg.selectAll(".line"+grp+name).style("display","none");
          //point
          partysvg.selectAll(".point"+grp+name).style("display","none");
      }
  });
};
//when button change, run update function
d3.selectAll(".checkboxparty").on("change",updateParty);
d3.selectAll(".checkboxtopic").on("change",updateTopic);*/
//update graph according to selected parties
function updateParty(){
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
d3.selectAll(".checkboxparty").on("change",updateParty);
//time range slider
var numberofDays = d3.timeDay.count(xExtent[0],xExtent[1]);
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
  var selectedValue = d3.select('input[name="topic"]:checked').node().value;
  if(selectedValue==="Abortion"){
    var data=sorted_abortion;
    var data_point=filterPoints(abortion,start,end);
    Line.data(filterData(data,start,end)).attr("d",d => line(d[1]));
  }
  else if(selectedValue==="Climate"){
    var data=sorted_climate;
    var data_point=filterPoints(climate,start,end);
    Line.data(filterData(data,start,end)).attr("d",d => line(d[1]));
  }
  else{
    var data=sorted_feminism;
    var data_point=filterPoints(feminism,start,end);
    Line.data(filterData(data,start,end)).attr("d",d => line(d[1]));
  }
  partysvg.selectAll(".pointDIELINKE").remove();
  partysvg.selectAll(".pointCDU").remove();
  partysvg.selectAll(".pointFDP").remove();
  partysvg.selectAll(".pointSPD").remove();
  partysvg.selectAll(".pointAfD").remove();
  partysvg.selectAll(".pointGruenen").remove();
  //new points
  partysvg.selectAll(".point")
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
  //check visibility of the lines
  updateParty();
};
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
      case 'CDU/CSU':
        return 'black';
      case 'SPD':
        return 'red';
      case 'AfD':
        return 'blue';
      case 'BÜ90/GR':
        return 'green';
      case 'FDP':
        return 'yellow';
      case 'DIE LINKE.':
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
  .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
  .on("mouseout", function() { d3.select(this).attr("stroke", null); });
  
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

 

  
  

  

};