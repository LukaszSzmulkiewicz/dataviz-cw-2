var width = 900;
var height = 800;

var svgMap = d3
  .select(".map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("class", "map");

var projection = d3
  .geoMercator()
  .center([13, 52])  
  .translate([width / 2, height / 2]) 
  .scale([width / 1.5]); 

var path = d3.geoPath().projection(projection);

var tooltip = d3
  .select(".map-container")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

loadData();

// method to read in datasets
function loadData() {
    var promises = [];

    promises.push(d3.csv("data/positive/countries_gdp_hist_filtered.csv"));
    promises.push(d3.csv("data/positive/HDI_index.csv"));
    promises.push(d3.csv("data/positive/schooling.csv"));
    promises.push(d3.json("data/europe.json"));
    promises.push(d3.csv("data/europe.csv"));

  
    Promise.all(promises).then(dataLoaded);
  }

  function dataLoaded(results) {
    // getting data from promises array 
    var gdp = results[0];
    var development_idex = results[1];
    var schooling = results[2];
    var countryData = results[3];
    var densityData = results[4];

    // other functional objects 
    var densities = {};
    var selectedOptionIndex = 0;
    const dataset_names = ['Gross domestic product', 'Human Development Index', 'Mean - years of schooling']

    // initiating color scale for map display
    var colorGdp = getColors(gdp); 
    var colorIndex = getColors(development_idex); 
    var colorSchooling = getColors(schooling); 
    var color =colorGdp;



    console.log("gdp", gdp);
    // console.log("dev index", development_idex);
    // console.log("schooling", schooling);

    // grouping datasets by country 
    const groupedGdp = d3.group(gdp, d => d.country);
    const groupedDevIndex = d3.group(development_idex, d => d.country);
    const groupedSchooling = d3.group(schooling, d => d.country);

    // grouping datasets by year 
    const groupedGdpYear = d3.group(gdp, d => d.year);
    const groupedDevIndexYear = d3.group(development_idex, d => d.year);
    const groupedSchoolingYear = d3.group(schooling, d => d.year);

    // initiating data by year for map display
    let groupedByYearData = groupedGdpYear;
      
      console.log("grouped by year map", groupedGdpYear)
    // preparing data for a bar chart
    const barChartDataGDP = prepareBarChartData(groupedGdp, 'Albania'); 

    const dropdownDatasetMap = d3.select('#dropdown-dataset-map');

    dataset_names.forEach(data => {
      dropdownDatasetMap.append('option')
        .attr('value', data)
        .text(data);
    });
   
   
    var dropdown = d3.select("#dropdown")
      .append("select")
      .attr("id", "dropdown-select");

  const yearDataOption =  Array.from(groupedByYearData.keys());
    console.log("grouped by year", yearDataOption)
    var options = dropdown.selectAll("option")
      .data(yearDataOption)
      .enter()
      .append("option")
      .text(function(d) { return d; });

      const dropdownDatasetMapUpdate = d3.select('#dropdown-dataset-map');
      dropdownDatasetMapUpdate.on('change', function() {
        const selectedOption = d3.select(this).property('value');
        if ( selectedOption === "Gross domestic product"){
          groupedByYearData = groupedGdpYear;
          const filteredData = groupedByYearData.get(dropdownYear)
          color = colorGdp; 
          selectedOptionIndex = 0;
          const densitiesUpdate = {};
          filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
          updateDensities(svgMap, filteredData, color, dropdownYear, densitiesUpdate)
        } 
        else if (selectedOption === 'Human Development Index'){
          groupedByYearData = groupedDevIndexYear;
          const filteredData = groupedByYearData.get(dropdownYear)
          selectedOptionIndex = 0;
          color = colorIndex; 
          const densitiesUpdate = {};
          filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
          updateDensities(svgMap, filteredData, color, dropdownYear, densitiesUpdate)
        } 
        else if ( selectedOption === 'Mean - years of schooling'){
          groupedByYearData = groupedSchoolingYear;
          const filteredData = groupedByYearData.get(dropdownYear)
          color = colorSchooling; 
          selectedOptionIndex = 0;
          const densitiesUpdate = {};
          filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.avg_years_of_schooling));
          updateDensities(svgMap, filteredData, color, dropdownYear, densitiesUpdate)
        }
        console.log("changing the datasets: ", groupedByYearData);
      });

      var plusButton = d3.select("#plus-button");
var minusButton = d3.select("#minus-button");



plusButton.on("click", function() {
  selectedOptionIndex = Math.min(selectedOptionIndex + 1, yearDataOption.length - 1);
  dropdown.property("value", yearDataOption[selectedOptionIndex]);

  const dropdownYear = dropdown.property("value");
  const filteredData = groupedByYearData.get(dropdownYear)
  const densitiesUpdate = {};
  filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
  updateDensities(svgMap, filteredData, color, dropdownYear, densitiesUpdate)

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


const optionUpdate = d3.select("#dropdown")

optionUpdate.on('change', function() {
  const dropdownYear = dropdown.property("value");
  const filteredData = groupedByYearData.get(dropdownYear);
  const densitiesUpdate = {};
  filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
  updateDensities(svgMap, filteredData, color, dropdownYear, densitiesUpdate)
});
    
    const dropdownYear = dropdown.property("value");;
    const filteredData = groupedByYearData.get(dropdownYear)
    
    densities = {};
    filteredData.forEach((x) => (densities[x.country_code] = +x.value));
    // console.log("data by year in function", densities)


        svgMap
      .append("g")
      .attr("class", "countries")
      .selectAll("path")
      .data(countryData.features)
      .enter()
      .append("path")
      .attr("class", (d) => `map-path ${d.properties.name}`)
      .attr("d", path)
      .style("fill", (d) => colorGdp(densities[d.id]))
      .style("stroke", "black")
      .style("stroke-width", 0.3)

       //Draw header and subheader.
      const headerMap = svgMap
      .append("g")
      .attr("class", "map-header")
      .append("text")
      .attr("stroke-width", "2px")
      .attr("font-size", "19pt")
      .attr("fill", "black")
      .attr("x", width - 700)
      .attr("y", height - 100);


    updateDensities(svgMap, filteredData, colorGdp, "2000")
    
    const plusButtonInterval = d3.select("#plus-button");

    let timeLaps;

    // var buttonValue = d3.select("#time-laps-button").node().value;
    // console.log(buttonValue);
    // if(buttonValue === "Turn Off Time-laps"){
    //        // Click the plus button every interval of seconds
    //        timeLaps = setInterval(() => {
    //         plusButtonInterval.node().click();
    //       if(yearDataOption.length-1 == selectedOptionIndex){
    //         selectedOptionIndex =0
    //       }
    //       }, 750);
    // }
    
    // //  button for the time-laps bind with its click event
    //   d3.select("#time-laps-button").on("click", function () {
    //     // Toggle the brush state
    //     var buttonValue = d3.select("#time-laps-button").node().value;
    //     if(buttonValue === "Turn On Time-laps"){
    //       d3.select("#time-laps-button").attr("value", "Turn Off Time-laps");
          
    //       // Click the plus button every interval of seconds
    //       timeLaps = setInterval(() => {
    //         plusButtonInterval.node().click();
    //         if(yearDataOption.length-1 == selectedOptionIndex){
    //           selectedOptionIndex =0
    //         }
    //       }, 750);
     
    //     }else {
    //       d3.select("#time-laps-button").attr("value", "Turn On Time-laps");
    //       // Clear the interval
    //       clearInterval(timeLaps);
        
    //     }
    //   });

 
    // setting svg size
  const marginChart = { top: 80, right: 40, bottom: 40, left: 70 };
  const widthChart = 800 - marginChart.right - marginChart.left;
  const heightChart = 450 - marginChart.top - marginChart.bottom;

  // Draw svg.
  const svg = d3
    .select(`#chartContainer`)
    .append("svg")
    .attr("width", widthChart + marginChart.right + marginChart.left)
    .attr("height", heightChart + marginChart.top + marginChart.bottom)
    .append("g")
    .attr("transform", `translate(${marginChart.left}, ${marginChart.top})`);

  // Scale data.
  // shows the dates
  const xScale = d3.scaleBand()
  .domain(barChartDataGDP.map(d => d.year))
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
  const yMax = d3.max(barChartDataGDP, (d) => d.value);
  console.log("yMAx", yMax)

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
    .ticks(20);
  

  const yAxisDraw = svg.append("g").attr("class", "yAxis").call(yAxis);

 //Draw header and subheader.
 const header = svg
 .append("g")
 .attr("class", "bar-chart-header")
 .attr("transform", `translate(70, -40)`)
 .append("text")


  updateBarChart(barChartDataGDP, svg, xScale, yScale, "steelblue", xAxis, yAxis, heightChart, densities, color)


// prepareDataYear(groupedGdpYear)

    const dropdownCountry = d3.select('#dropdown_country');

    const countryDataOption = Array.from(groupedGdp, ([country, gdp]) => ({ country, gdp }))
      .sort((a, b) => d3.ascending(a.country, b.country));
      console.log("country data option", countryDataOption)
      countryDataOption.forEach(data => {
      dropdownCountry.append('option')
        .attr('value', data.country)
        .text(data.country);
    });
      

    const dropdownDataset = d3.select('#dropdown_dataset');

    dataset_names.forEach(data => {
      dropdownDataset.append('option')
        .attr('value', data)
        .text(data);
    });
    const dropdownDatasetUpdate = d3.select('#dropdown_dataset');
    dropdownDatasetUpdate.on('change', function() {
      const selectedOption = d3.select(this).property('value');
      const currentCountry = d3.select("#dropdown_country").property("value");
      if ( selectedOption === "Gross domestic product"){

        const dropdownYear = dropdown.property("value");
        const filteredData = groupedByYearData.get(dropdownYear);
        const densitiesUpdate = {};
        filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
        var data =  prepareBarChartData(groupedGdp, currentCountry)
        updateBarChart(data, svg, xScale, yScale, "steelblue", xAxis, yAxis, heightChart, densitiesUpdate, color)
      } 
      else if (selectedOption === 'Human Development Index'){
        const dropdownYear = dropdown.property("value");
        const filteredData = groupedByYearData.get(dropdownYear);
        const densitiesUpdate = {};
        filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
        var data1 =  prepareBarChartDataIndex(groupedDevIndex, currentCountry)
        updateBarChart(data1, svg, xScale, yScale, "steelblue", xAxis, yAxis, heightChart, densitiesUpdate, color)

      } 
      else if ( selectedOption === 'Mean - years of schooling'){
        const dropdownYear = dropdown.property("value");
        const filteredData = groupedByYearData.get(dropdownYear);
        const densitiesUpdate = {};
        filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
        var data2 =  prepareBarChartDataSchooling(groupedSchooling, currentCountry)
        updateBarChart(data2, svg, xScale, yScale, "steelblue", xAxis, yAxis, heightChart, densitiesUpdate, color)
      }
    });

        
    const dropdownCountryUpdate = d3.select('#dropdown_country');
    dropdownCountryUpdate.on('change', function() {
      const selectedOption = d3.select(this).property('value');
      const currentDataset = d3.select("#dropdown_dataset").property("value");
      if ( currentDataset === "Gross domestic product"){
        const dropdownYear = dropdown.property("value");
        const filteredData = groupedByYearData.get(dropdownYear);
        const densitiesUpdate = {};
        filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));

        var data =  prepareBarChartData(groupedGdp, selectedOption)
        updateBarChart(data, svg, xScale, yScale, "steelblue", xAxis, yAxis, heightChart, densitiesUpdate, color)
      } 
      else if (currentDataset === 'Human Development Index'){
        const dropdownYear = dropdown.property("value");
        const filteredData = groupedByYearData.get(dropdownYear);
        const densitiesUpdate = {};
        filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
        var data1 =  prepareBarChartDataIndex(groupedDevIndex, selectedOption)
        updateBarChart(data1, svg, xScale, yScale, "steelblue", xAxis, yAxis, heightChart, densitiesUpdate, color)

      } else if ( currentDataset ==='Mean - years of schooling'){
        const dropdownYear = dropdown.property("value");
        const filteredData = groupedByYearData.get(dropdownYear);
        const densitiesUpdate = {};
        filteredData.forEach((x) => (densitiesUpdate[x.country_code] = +x.value));
        var data2 =  prepareBarChartDataSchooling(groupedSchooling, selectedOption)
        updateBarChart(data2, svg, xScale, yScale, "steelblue", xAxis, yAxis, heightChart, densitiesUpdate, color)

      }

    });
    
  
  }

  function prepareBarChartData(data, selectedOption) {
    const filteredData = data.get(selectedOption)

    // converting the map to the array of objects key at index 0 and value at index 1
    const dataArray = filteredData.map((d) => ({
      id: d.country_code,
      country: d.country,
      year: d3.timeParse("%Y")(d.year).getFullYear(),
      value: +d.value,
      header: "Gross Domestic product (Total)"
    }));
  
    return dataArray;
  }

  function prepareBarChartDataIndex(data, selectedOption) {
    const filteredData = data.get(selectedOption)

    // converting the map to the array of objects key at index 0 and value at index 1
    const dataArray = filteredData.map((d) => ({
      id: d.country_code,
      country: d.country,
      year: d3.timeParse("%Y")(d.year).getFullYear(),
      value: +d.value,
      header: "Human Development Index"

    }));
  
    return dataArray;
  }

  function prepareBarChartDataSchooling(data, selectedOption) {
    const filteredData = data.get(selectedOption)

    // converting the map to the array of objects key at index 0 and value at index 1
    const dataArray = filteredData.map((d) => ({
      id: d.country_code,
      country: d.country,
      year: d3.timeParse("%Y")(d.year).getFullYear(),
      value: +d.value,
      header: "Average Years of Schooling"
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
    return (d / 1000).toFixed(0) + "k";
  } else {
    return d;
  }
}


// function used to draw bar chart, contains mouse events for tooltip and styling changes on hover
function updateBarChart(data, svgChart, xScaleBar, yScaleBar , barColor, xAxis, yAxis, height, densities,color){
   console.log("data in update", densities)

  // getting selected country from drop down
   let selectedCountry = d3.select('#dropdown_country').property("value")
    selectedCountry? selectedCountry = selectedCountry : selectedCountry = "Albania";
  
    console.log("drop down country in bar chart update", selectedCountry)
  // update header
  const headerElements = d3.select(".bar-chart-header text");
  const headerText = data[0].header
// append a new text element to each header element
headerElements.join(
  enter => enter  
  .text(`${headerText}: ${selectedCountry}`)
  .attr("fill", "white")
  .transition()
  .duration(1500)
  .attr("fill", "black"),


  update =>update
  .transition()
  .duration(0)
  .text(`${headerText}: ${selectedCountry}`)
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
   const u = svgChart.selectAll('.bar-series')
   
   .data(data, d => d.year)
  // draw bars
    u
    .join(
      enter => enter    
        .append("rect")   
        .transition()
        .duration(1500)  
        .attr("class", (d) => `bar-series ${selectedCountry}`)
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
        .attr("class", (d) => `bar-series ${selectedCountry}`)
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
      d3.select(".tooltip-chart")
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
// function used to prepare color scale for map and bar chart
function getColors(densityData) {
  console.log("i am getting new colors")
  var sortedDensities = densityData
    .map((x) => parseInt(x.value))
    .sort(function (a, b) {
      return parseInt(a) - parseInt(b);
    });
  var maxDensity = d3.max(sortedDensities);

  console.log("sored densities", maxDensity)

  var oranges = ["white"]; // create lower bound for thresholds

  // Map the sorted densities to colors using the interpolate function
  sortedDensities.forEach((x) => {
    var color = d3.interpolateReds(x / maxDensity);
    oranges.push(color);
  });

  return d3.scaleThreshold().domain(sortedDensities).range(oranges);
}

function updateDensities(svgMap, filteredData, color, year){
  const headerElements = d3.select(".map-header text");
  let headerText;
  
   // getting selected dataset from drop down
   let selectedDataset = d3.select('#dropdown-dataset-map').property("value")

   if ( selectedDataset === "Gross domestic product"){
    headerText = "Gross Domestic product in Europe year: " + year;
  } else if (selectedDataset === "Human Development Index") {
    headerText = "Human Development Index in Europe year: " + year;
  } else if (selectedDataset === 'Mean - years of schooling') {
    headerText = "Mean - years of schooling in Europe year: " + year;
  } else {
    headerText = "Gross Domestic product in Europe year: " + year;
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

  const u = svgMap.selectAll('.map-path')
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
    // d3.selectAll(`.${className}`).style("fill", "dodgerblue");
    var density = densities[d.id] ? densities[d.id].toLocaleString() : "No Data";
    d3.select(".tooltip")
      .html(
        "<strong>" + d.properties.name +
          "</strong><br>GDP: " + density
      )
      .transition()
      .duration(150)
      .style("opacity", 0.9)
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 100 + "px");
  })
  .on("mouseout", function (event, d) {
    d3.select(this).style("fill", (d) => color(densities[d.id]));
    // const className = d.properties.name.split(" ")[0];
    // d3.selectAll(`.${className}`).style("fill", (d) =>
    //   color(densities[d.id])
    // );
    d3.selectAll(".tooltip").transition().duration(500).style("opacity", 0);
  });


// map zoom
  let zoom = d3.zoom()
  .on('zoom', handleZoom);

function handleZoom(e) {
  d3.select('svg g')
    .attr('transform', e.transform);
}

  d3.select('svg')
    .call(zoom);

}
