import { prepareBarChartData, getColors, getData } from "./helper.js";

var width = 900;
var height = 905;

var svgMap = d3
  .select(".map-container1")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("class", "map1");

var projection = d3
  .geoMercator()
  .center([13, 52])  
  .translate([width / 2, height / 2]) 
  .scale([width / 1.5]); 

var path = d3.geoPath().projection(projection);


var tooltip = d3
  .select(".map-container1")
  .append("div")
  .attr("class", "tooltip1")
  .style("opacity", 0);

loadData();

// method to read in datasets
function loadData() {
    var promises = [];
    // primary energy consumption per capita (kWh/person)
    promises.push(d3.csv("data/negative/co2_emissions_kt_by_country.csv"));
    promises.push(d3.csv("data/negative/obesity-cleaned_filtered.csv"));
    promises.push(d3.csv("data/negative/cause_of_deaths.csv"));
    promises.push(d3.json("data/europe.json"));
    promises.push(d3.csv("data/disasters/disasters.csv"));

    
  
    Promise.all(promises).then(dataLoaded);
  }

  function dataLoaded(results) {
    
    const intervalTime = 5000
    // getting data from promises array 
    const emissions = results[0];
    const obesity = results[1];
    const diabetes = results[2];
    const countryData = results[3];
    const disasters = results[4];

    // other functional objects 
    var densities = {};
    var selectedOptionIndex = 0;
    const dataset_names = ['CO2 Emissions by country', 'Obesity among adults by country', 'Deaths from diabetes by country']

    // initiating color scale for map display
    var colorEmissions = getColors(emissions); 
    var colorObesity = getColors(obesity); 
    var colorDiabetes = getColors(diabetes); 
    var color =colorEmissions;

    // console.log("gdp", emissions);
    // console.log("dev index", development_idex);
    // console.log("schooling", schooling);

    // grouping datasets by country 
    const groupedEmissions = d3.group(emissions, d => d.country);
    const groupedObesity = d3.group(obesity, d => d.country);
    const groupedDiabetes = d3.group(diabetes, d => d.country);

    // grouping datasets by year 
    const groupedEmissionsYear = d3.group(emissions, d => d.year);
    const groupedObesityYear = d3.group(obesity, d => d.year);
    const groupedDiabetesYear = d3.group(diabetes, d => d.year);

    const groupedByCollection = {
      'CO2 Emissions by country': {
        dataByYear: groupedEmissionsYear,
        dataByCountry: groupedEmissions,
        color: colorEmissions,
        header: "CO2 Emissions by country (kt)"
      },
      'Obesity among adults by country': {
        dataByYear: groupedObesityYear,
        dataByCountry: groupedObesity,
        color: colorObesity,
        header: "Obesity among adults (%) by country:"
      },
      'Deaths from diabetes by country': {
        dataByYear: groupedDiabetesYear,
        dataByCountry: groupedDiabetes,
        color: colorDiabetes,
        header: "Deaths from diabetes by country: "
      }
    }

    // initiating data by year for map display
    let groupedByYearData = groupedEmissionsYear;
      
      console.log("grouped by year map", groupedEmissionsYear)
    // preparing data for a bar chart
    const barChartData = prepareBarChartData(groupedEmissions, 'Albania'); 

    const dropdownDatasetMap = d3.select('#dropdown-dataset-map1');

    dataset_names.forEach(data => {
      dropdownDatasetMap.append('option')
        .attr('value', data)
        .text(data);
    });
   
   
    var dropdown = d3.select("#dropdown1")
      .append("select")
      .attr("id", "dropdown-select");

  const yearDataOption =  Array.from(groupedByYearData.keys());
    console.log("grouped by year", yearDataOption)
    var options = dropdown.selectAll("option")
      .data(yearDataOption)
      .enter()
      .append("option")
      .text(function(d) { return d; });

      const dropdownDatasetMapUpdate = d3.select('#dropdown-dataset-map1');
      dropdownDatasetMapUpdate.on('change', function() {
        const selectedOption = d3.select(this).property('value');
        const setFromCollection = getData(groupedByCollection, selectedOption);
        groupedByYearData = setFromCollection[0].dataByYear;
        const filteredData = groupedByYearData.get(dropdownYear)
          color = setFromCollection[1]; 
          selectedOptionIndex = 0;
          const densitiesUpdate = {};
          filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
          updateDensities(svgMap, filteredData, color, dropdownYear, densitiesUpdate)
    
        console.log("changing the datasets: ", groupedByYearData);
      });



const optionUpdate = d3.select("#dropdown1")

optionUpdate.on('change', function() {
  const dropdownYear = dropdown.property("value");
  const filteredData = groupedByYearData.get(dropdownYear);
  const densitiesUpdate = {};
  if(filteredData){
    filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
    updateDensities(svgMap, filteredData, color, dropdownYear, densitiesUpdate)
  }
});
    
    const dropdownYear = dropdown.property("value");;
    const filteredData = groupedByYearData.get(dropdownYear)
    
    densities = {};
    filteredData.forEach((x) => (densities[x.country_code] = +x.value));
    // console.log("data by year in function", densities)


        svgMap
      .append("g")
      .attr("class", "countries1")
      .selectAll("path")
      .data(countryData.features)
      .enter()
      .append("path")
      .attr("class", (d) => `map-path1 ${d.properties.name}`)
      .attr("d", path)
      .style("fill", (d) => colorEmissions(densities[d.id]))
      .style("stroke", "black")
      .style("stroke-width", 0.3)

       //Draw header and subheader.
      const headerMap = svgMap
      .append("g")
      .attr("class", "map-header1")
      .append("text")
      .attr("stroke-width", "2px")
      .attr("font-size", "19pt")
      .attr("fill", "black")
      .attr("x", width - 700)
      .attr("y", height - 100);


    updateDensities(svgMap, filteredData, colorEmissions, "2000")
    
    const plusButtonInterval = d3.select("#plus-button1");

    let timeLaps;
    let isTimeLapOn;
    let intervalCounter;
    let timeLapsCounter = 4;


    
    const timerElement = d3.select("#timer1")
            .append("text")
    const timerLabel = d3.select("#timer-label1")
            .append("text")


    var buttonValue = d3.select("#time-laps-button1").node().value;
    console.log(buttonValue);
    if(buttonValue === "Turn Off Time-laps"){
           // Click the plus button every interval of seconds
           isTimeLapOn = true;
           timeLaps = setInterval(() => {
            plusButtonInterval.node().click();
          if(yearDataOption.length-1 == selectedOptionIndex){
            selectedOptionIndex =0
          }
          }, intervalTime);
    }

    if(isTimeLapOn){
      intervalCounter = setInterval(() => {
       timerLabel.join().text("- Year change timer")
         timerElement.join().text(timeLapsCounter)
         if(timeLapsCounter==0){
           timeLapsCounter = 4
         }else {
           timeLapsCounter-=1;
         }
       }, 1000) 
     }
    
    //  button for the time-laps bind with its click event
      d3.select("#time-laps-button1").on("click", function () {
        // Toggle the brush state
        var buttonValue = d3.select("#time-laps-button1").node().value;
        if(buttonValue === "Turn On Time-laps"){
          d3.select("#time-laps-button1").attr("value", "Turn Off Time-laps");
          
          // Click the plus button every interval of seconds
          timeLaps = setInterval(() => {
           isTimeLapOn = true;
            plusButtonInterval.node().click();
            if(yearDataOption.length-1 == selectedOptionIndex){
              selectedOptionIndex =0
            }
          }, intervalTime);
          intervalCounter = setInterval(() => {
            timerElement.join().text(timeLapsCounter)
            timerLabel.join().text("- Year change timer")
            if(timeLapsCounter==0){
              timeLapsCounter = 4
            }else {
              timeLapsCounter-=1;
            }
          }, 1000) 
         
        }else {
          d3.select("#time-laps-button1").attr("value", "Turn On Time-laps");
          // Clear the interval
          isTimeLapOn = false;
          clearInterval(timeLaps);

          timeLapsCounter =4;
          clearInterval(intervalCounter)
          timerElement.join().text("")
          timerLabel.join().text("")
        
        }
      });

 
    // setting svg size
  const marginChart = { top: 60, right: 40, bottom: 40, left: 70 };
  const widthChart = 900 - marginChart.right - marginChart.left;
  const heightChart = 350 - marginChart.top - marginChart.bottom;

  // Draw svg.
  const svg = d3
    .select(`#chartContainer1`)
    .append("svg")
    .attr("width", widthChart + marginChart.right + marginChart.left)
    .attr("height", heightChart + marginChart.top + marginChart.bottom)
    .append("g")
    .attr("transform", `translate(${marginChart.left}, ${marginChart.top})`);

  // Scale data.
  // shows the dates
  const xScale = d3.scaleBand()
  .domain(barChartData.map(d => d.year))
  .range([0, widthChart])
  .padding(0.2);

  // Draw x axis.
  const xAxis = d3
    .axisBottom(xScale)
    .tickSizeOuter(0)
    .tickPadding(12)
    .tickSizeInner(-heightChart)
    .ticks(20);
  const xAxisDraw = svg
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(0, ${heightChart})`)
    .call(xAxis);


  // the chart should start from 0 so getting a max
  const yMax = d3.max(barChartData, (d) => d.value);

  const yScale = d3.scaleLinear()
    // array with minimum and maximum values mapping from the domain to range values
    .domain([yMax,0 ])
    .range([0, heightChart]);

  // Draw y axis.
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat(formatTicks)
    .tickSizeOuter(0)
    .tickSizeInner(-widthChart)
    .ticks(10);
  

  const yAxisDraw = svg.append("g").attr("class", "yAxis").call(yAxis);

 //Draw header and subheader.
 const header = svg
 .append("g")
 .attr("class", "bar-chart-header1")
 .attr("transform", `translate(260, -20)`)
 .attr("font-size", "18px")
 .append("text")

 const initialHeader = groupedByCollection["CO2 Emissions by country"].header

  updateBarChart(barChartData, svg, xScale, yScale, "steelblue", xAxis, yAxis, heightChart, densities, color, initialHeader)


// prepareDataYear(groupedGdpYear)

    const dropdownCountry = d3.select('#dropdown_country1');

    const countryDataOption = Array.from(groupedEmissions, ([country, gdp]) => ({ country, gdp }))
      .sort((a, b) => d3.ascending(a.country, b.country));
      console.log("country data option", countryDataOption)
      countryDataOption.forEach(data => {
      dropdownCountry.append('option')
        .attr('value', data.country)
        .text(data.country);
    });
      

    const dropdownDataset = d3.select('#dropdown_dataset1');

    dataset_names.forEach(data => {
      dropdownDataset.append('option')
        .attr('value', data)
        .text(data);
    });
    const dropdownDatasetUpdate = d3.select('#dropdown_dataset1');
    dropdownDatasetUpdate.on('change', function() {
      const selectedOption = d3.select(this).property('value');
      const currentCountry = d3.select("#dropdown_country1").property("value");
      const setFromCollection = getData(groupedByCollection, selectedOption);
      const groupedByYearData = setFromCollection[0].dataByYear;
      const dropdownYear = dropdown.property("value");
      const filteredData = groupedByYearData.get(dropdownYear)
      const header = setFromCollection[0].header
      const densitiesUpdate = {};
      filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
      var data =  prepareBarChartData(setFromCollection[0].dataByCountry, currentCountry)
      updateBarChart(data, svg, xScale, yScale, "steelblue", xAxis, yAxis, heightChart, densitiesUpdate, color, header)
    });

        
    const dropdownCountryUpdate = d3.select('#dropdown_country1');
    dropdownCountryUpdate.on('change', function() {
      const selectedOption = d3.select(this).property('value');
      const currentDataset = d3.select("#dropdown_dataset1").property("value");
      const setFromCollection = getData(groupedByCollection, currentDataset);
      const groupedByYearData = setFromCollection[0].dataByYear;
      const dropdownYear = dropdown.property("value");
      const header = setFromCollection[0].header
      const filteredData = groupedByYearData.get(dropdownYear)
      const densitiesUpdate = {};
      filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
      var data =  prepareBarChartData(setFromCollection[0].dataByCountry, selectedOption)
      updateBarChart(data, svg, xScale, yScale, "steelblue", xAxis, yAxis, heightChart, densitiesUpdate, color, header)
    
    });

       // setting svg size
    const marginImg = { top: 40, right: 40, bottom: 40, left: 120 };
    const widthImg = 900 - marginImg.right - marginImg.left;
    const heightImg = 550 - marginImg.top - marginImg.bottom;

    // preparing data
    const disastersData = prepareDisastersData(disasters);
    // Drawing svg for inventions chart
    const svgImg = d3
    .select(`#disasters-container`)
    .append("svg")
    .attr("width", widthImg + marginImg.right + marginImg.left)
    .attr("height", heightImg + marginImg.top + marginImg.bottom)
    .append("g")
    .attr("transform", `translate(${marginImg.left}, ${marginImg.top})`);

     // shows the dates
    const xScaleImg = d3.scaleBand()
    .domain(disastersData.map(d => d.year))
    .range([0, widthImg])
    .padding(0.2);

    
    // Defining the y-axis scale
    const yScaleImg = d3.scaleBand()
  .domain(disastersData.map(d => d.value))
  .range([heightImg, 0])
  .padding(0.2);
    console.log("data map", disastersData.map(d => d.year)) 

  // Creating the y-axis
  const yAxisImg = d3.axisLeft(yScaleImg)
  .tickSizeOuter(0)
  .tickFormat(formatTickLabel)
  .tickSizeInner(-widthImg);

  // Creating the x-axis
  const xAxisImg = d3.axisBottom(xScaleImg)
  .tickSizeOuter(0)
  .tickSizeInner(-heightImg)
  .tickPadding(12);


  
  // Appending the x-axis to the chart
  svgImg.append("g")
  .attr("class", "xAxis")
  .attr("transform", "translate(0," + heightImg + ")")
  .call(xAxisImg);
  
  // Appending the y-axis to the chart
  svgImg.append("g")
  .attr("class", "yAxis")
  .call(yAxisImg);

  // Rotate xAxis ticks
  d3.selectAll(".xAxis .tick text")
  .attr("transform", "rotate(-22)")

  //Draw header and subheader.
 const headerImg = svgImg
 .append("g")
 .attr("class", "image-chart-header1")
 .attr("transform", `translate(220, 10)`)
 .append("text")
 .text("World's disasters between 2000-2019")

  let browserWidth; 
  let browserHeight;
  let setHight = 780;

  //appending images
 const images = svgImg.selectAll("image")
  .data(disastersData) // limit to first 10 data points
  .enter()
  .append("image")
  .attr("class", (d, i ) => `image1` + d.year)
  .attr("x", function(d) { return xScaleImg(d.year); })
  .attr("y", function(d) { return yScaleImg(d.value) -5; })
  .attr("width", 30)
  .attr("height", 30)
  .attr("xlink:href", function(d) { return `data/disasters/${d.image}`; })
  .attr("opacity", 0.4);

  // Defining the mouseover behavior
images.on("mouseover", function(event, d) {
  // Select the image and update its attributes

   browserWidth = window.innerWidth;
   browserHeight = window.innerHeight;
  console.log("Browser resolution:", browserWidth, "x", browserHeight);
  if(browserWidth <= 1745 ){
    setHight = 1620;
  }

  d3.select(this)
    .raise()
    .transition()
    .duration(1000)
    .attr("x", widthImg / 2 - 150)
    .attr("y", heightImg / 2 - 250)
    .attr("width", 300)
    .attr("height", 300)
    .style("opacity", 1)
    .transition()
    .delay(3000)
    .duration(500)
    .attr("x", function(d) { return xScaleImg(d.year); })
    .attr("y", function(d) { return yScaleImg(d.value) -5; })
    .attr("width", 30)
    .attr("height", 30)
    .style("opacity", 0.4);
    
    d3.select(".tooltip-inventions1")
    .html(
      "<strong>"+ d.value +" - " +d.year +
        "</strong><br>"+ d.description
        )
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .style("left",  browserWidth/2 + 80 + "px")
    .style("top",  setHight + "px")
    .transition()
    .delay(intervalTime-2000)
    .duration(1000)
    .style("opacity", 0);

});

// 
const tooltipImg = d3
  .select("#disasters-container")
  .append("div")
  .attr("class", "tooltip-inventions1")
  .style("opacity", 0);

var plusButton = d3.select("#plus-button1");
var minusButton = d3.select("#minus-button1");

plusButton.on("click", function() {
  selectedOptionIndex = Math.min(selectedOptionIndex + 1, yearDataOption.length - 1);
  dropdown.property("value", yearDataOption[selectedOptionIndex]);

  const dropdownYear = dropdown.property("value");
  const filteredData = groupedByYearData.get(dropdownYear)
  const densitiesUpdate = {};
  filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
  updateDensities(svgMap, filteredData, color, dropdownYear, densitiesUpdate)
    if(isTimeLapOn)
    {
      const selectedImageData = d3.select(`image.image1${dropdownYear}`).datum();
        d3.select(`image.image1${dropdownYear}`)
        .transition()
        .duration(1000)
        .attr("x", widthImg / 2 - 150)
        .attr("y", heightImg / 2 - 250)
        .attr("width", 300)
        .attr("height", 300)
        .style("opacity", 1)
        .style("z-index", 99)
        .transition()
        .delay(intervalTime)
        .duration(500)
        .attr("x", function(d) { return xScaleImg(selectedImageData.year); })
        .attr("y", function(d) { return yScaleImg(selectedImageData.value) -5; })
        .attr("width", 30)
        .attr("height", 30)
        .style("opacity", 0.4);
        
        d3.select(".tooltip-inventions1")
        .html(
          "<strong>"+ selectedImageData.value +" - " +selectedImageData.year +
            "</strong><br>"+ selectedImageData.description
            )
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .style("left",  browserWidth/2 + "px")
        .style("top",  setHight + "px")
        .transition()
        .delay(intervalTime-2000)
        .duration(1000)
        .style("opacity", 0);
  }

});

minusButton.on("click", function() {
  selectedOptionIndex = Math.max(selectedOptionIndex - 1, 0);
  dropdown.property("value", yearDataOption[selectedOptionIndex]);

  const dropdownYear = dropdown.property("value");
  const filteredData = groupedByYearData.get(dropdownYear);
  const densitiesUpdate = {};
  filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
  updateDensities(svgMap, filteredData, color, dropdownYear, densitiesUpdate)
  
});
var colors = ["red","#4fadc2"];
var currentColor = 0;
var buttons = d3.selectAll("button")
var inputs = d3.selectAll("#time-laps-button1")

function changeColor() {
  currentColor = (currentColor + 1) % colors.length;
  buttons.style("border", `2px solid ${colors[currentColor]}`);
  inputs.style("border", `2px solid ${colors[currentColor]}`);
}

setInterval(changeColor, 1000);

}



  
  function prepareDisastersData(data){
      // converting the map to the array of objects key at index 0 and value at index 1
      const dataArray = data.map((d) => ({
        year: d3.timeParse("%Y")(d.year).getFullYear(),
        value: d.caption,
        image: d.image,
        description: d.description
      }));
    
      return dataArray;

  }

  // function for formatting bar chart ticks 
function formatTicks(d) {
  if((d >= 1000000000000)){
    return (d / 1000000000000).toFixed(1) + "tn";
  }
  else if (d >= 1000000000) {
    return (d / 1000000000).toFixed(1) + "bl";
  } else if (d >= 1000000) {
    return (d / 1000000).toFixed(1) + "mil";
  } else if (d >= 1000) {
    return (d / 1000).toFixed(1) + "k";
  } else {
    return d;
  }
}


// function used to draw bar chart, contains mouse events for tooltip and styling changes on hover
function updateBarChart(data, svgChart, xScaleBar, yScaleBar , barColor, xAxis, yAxis, height, densities, color, header){
   console.log("data in update", densities)

  // getting selected country from drop down
   let selectedCountry = d3.select('#dropdown_country1').property("value")
    selectedCountry? selectedCountry = selectedCountry : selectedCountry = "Albania";
  
  // update header
  const headerElements = d3.select(".bar-chart-header1 text");
// append a new text element to each header element
headerElements.join(
  enter => enter  
  .text(`${header}: ${selectedCountry}`)
  .attr("fill", "white")
  .transition()
  .duration(1500)
  .attr("fill", "black"),


  update =>update
  .transition()
  .duration(0)
  .text(`${header}: ${selectedCountry}`)
  .attr("fill", "white")
  .transition()
  .duration(1500)
  .attr("fill", "black"),


  exit => exit.transition().duration(500).attr("x", 30).remove()
);
  const yMax = d3.max(data, (d) => d.value);
    // Create the X and Y axis:
    xScaleBar.domain(data.map((d) => d.year))
    yScaleBar.domain([ yMax, 0])

    svgChart.selectAll(".xAxis")
    .transition()
    .duration(1000)
    .call(xAxis)
    .selectAll("text") // Select all the tick label elements
    .style("font-size", "12px") // Set the font size to 16 pixels
    .style("font-weight", "bold");
   
    svgChart.selectAll(".yAxis")
    .transition()
    .duration(1000)
    .call(yAxis)
    .selectAll("text") // Select all the tick label elements
    .style("font-size", "12px") // Set the font size to 12 pixels
    .style("font-weight", "bold");

    // Create a update selection: bind to the new data
   const u = svgChart.selectAll('.bar-series1')
   
   .data(data, d => d.year)
  // draw bars
    u
    .join(
      enter => enter    
        .append("rect")   
        .transition()
        .duration(1500)  
        .attr("class", (d) => `bar-series1 ${selectedCountry}`)
        .attr("x", d => xScaleBar(d.year))
        .attr("y", d => yScaleBar(d.value))
        .attr("width", xScaleBar.bandwidth())
        .attr("height", d => height - yScaleBar(d.value))
        .style("fill", "lightblue")
        .transition()
        .duration(750)  
        .style("fill", (d) => barColor),

      update => update
        .style("fill", "lightblue")
        .transition()
        .duration(1000)
        .attr("class", (d) => `bar-series1 ${selectedCountry}`)
        .attr("x", d => xScaleBar(d.year))
        .attr("y", d => yScaleBar(d.value))
        .attr("width", xScaleBar.bandwidth())
        .attr("height", d => height - yScaleBar(d.value))
        .transition()
        .duration(750)
        .style("fill", (d) => barColor),

      exit => exit
        .transition()
        .duration(300)
        .remove()
    )
    .on("mousemove", function (event, d) {
      // d3.select(this).style("fill", "dodgerblue");
      const className = d.country.split(" ")[0];
      d3.selectAll(`path.${className}`).style("fill", "dodgerblue");
      // var density = densities[d.id] ? densities[d.id].toLocaleString() : "N/A";
      d3.select(".tooltip-chart1")
          // .html(
          //   // "<strong>" +
          //   //   d.country +
          //   //   "</strong><br><strong>Cases per million: " +
          //   //   d.cases +
          //   //   "</strong><br>Population Density: " +
          //   //   density
          // )
          // .transition()
          // .duration(150)
          // .style("opacity", 0.9)
          // .style("left", event.pageX + 10 + "px")
          // .style("top", event.pageY - 100 + "px");
    })
    .on("mouseout", function (event, d) {
      // d3.select(this).style("fill", (d) => console.log("ddddddddddddddddd", d));
      const className = d.country.split(" ")[0];
      d3.selectAll(`path.${className}`).style("fill", (d) =>
        color(densities[d.id])
      );
    //   d3.select(".tooltip-chart").transition().duration(500).style("opacity", 0);
    });

     // Rotate xAxis ticks
     d3.selectAll(".xAxis .tick text")
     .attr("transform", "rotate(-22)")

}

function updateDensities(svgMap, filteredData, color, year){
  const headerElements = d3.select(".map-header1 text");
  let headerText;
  let tooltipText;
  // getting selected dataset from drop down
  let selectedDataset = d3.select('#dropdown-dataset-map1').property("value")

  if ( selectedDataset === "CO2 Emissions by country")
  {
    headerText = "CO2 Emissions (kiloton) in Europe, year: " + year;
    tooltipText = "CO2";
  } else if (selectedDataset === "Obesity among adults by country") 
  {
    headerText = "Obesity among adults (%) in Europe, year: " + year;
    tooltipText = "Obesity (%)";
  } else if (selectedDataset === 'Deaths from diabetes by country') 
  {
    headerText = "Deaths from diabetes in Europe, year: " + year;
    tooltipText = "Deaths";
  } else {
    headerText = "CO2 Emissions (kiloton) in Europe, year: " + year;
    tooltipText = "CO2";
  }
// append a new text element to each header element
headerElements.join(
  enter => enter  
  .text(headerText)
  .attr("fill", "black"),

  update =>update
  .text(headerText)
  .attr("fill", "black"),


  exit => exit.transition().duration(500).attr("x", 30).remove()
);
  const densities = {};
  filteredData.forEach((x) => (densities[x.country_code] = +x.value));

  const u = svgMap.selectAll('.map-path1')
  u.join(
    enter => enter,
  
    update => update
        .transition()
        .duration(500)
        .style("fill", (d) => color(densities[d.id])),

    exit => exit.remove()
  
  )       
  .on("mouseover", function (event, d) {
    d3.select().style("opacity", 1);
    d3.select(this).style("stroke", "black").style("opacity", 1);
  })
  .on("mousemove", function (event, d) {
    d3.select(this).style("fill", "dodgerblue");
    const className = d.properties.name.split(" ")[0];
    var density = densities[d.id] ? densities[d.id].toLocaleString() : "No Data";
    d3.select(".tooltip1")
      .html(
        "<strong>" + d.properties.name +
          "</strong><br>"+ tooltipText +": " + density
      )
      .transition()
      .duration(150)
      .style("opacity", 0.9)
      .style("left",event.screenX -80 + "px")
      .style("top", event.screenY - 80  + "px");
  })
  .on("mouseout", function (event, d) {
    d3.select(this).style("fill", (d) => color(densities[d.id]));
   
    d3.selectAll(".tooltip1").transition().duration(500).style("opacity", 0);
  });


  // map zoom
  let zoom = d3.zoom()
  .on('zoom', handleZoom);

  function handleZoom(e) {
  d3.select('.map1')
    .attr('transform', e.transform);
  }

  d3.select('.map-container1')
    .call(zoom);

}



// function used to shorten longer labels
function formatTickLabel(d) {
  // Check if the text is longer than the maximum length
  if (d.length > 15) {
    // Truncate the text and add an ellipsis
    return d.substr(0, 10 - 1) + "...";
  } else {
    // Return the original text
    return d;
  }
}
