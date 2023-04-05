// function used to prepare color scale for map and bar chart
function getColors(densityData) {
    var sortedDensities = densityData
      .map((x) => parseInt(x.value))
      .sort(function (a, b) {
        return parseInt(a) - parseInt(b);
      });
    var maxDensity = d3.max(sortedDensities);
  
  
    var oranges = ["white"]; // create lower bound for thresholds
  
    // Map the sorted densities to colors using the interpolate function
    sortedDensities.forEach((x) => {
      var color = d3.interpolateReds(x / maxDensity);
      oranges.push(color);
    });
  
    return d3.scaleThreshold().domain(sortedDensities).range(oranges);
  }


function prepareBarChartData(data, selectedOption) {
    const filteredData = data.get(selectedOption)

    // converting the map to the array of objects key at index 0 and value at index 1
    const dataArray = filteredData.map((d) => ({
      id: d.country_code,
      country: d.country,
      year: d3.timeParse("%Y")(d.year).getFullYear(),
      value: +d.value,
    }));
  
    return dataArray;
  }



function getData(groupedByYearCollection, dataset) {
    const dataSet = groupedByYearCollection[dataset]
    const color =  groupedByYearCollection[dataset].color;
    const dataObject = [dataSet, color]; 
    return dataObject;
}

export {getColors, prepareBarChartData, getData};