function d3waffle(type) {
  var margin = { top: 10, right: 0, bottom: 10, left: 0 },
    scale = 1,
    rows = 30,
    adjust = 0.8,
    colorscale = d3.scale.category20b(),
    appearancetimes = function(d, i) {
      return 500;
    },
    height = 600,
    magic_padding = 1;

  function chart(selection) {
    selection.each(function(data) {
      selection.selectAll("*").remove();
      
      const vizContainer = selection[0][0].parentElement.parentElement.parentElement.id;
      var idcontainer = selection[0][0].id;
      var total = d3.sum(data, function(d) { return d[type]; });

      /* updating data */
      data.forEach(function(d, i) {
        data[i].class = slugify(d.class);
        data[i].scalevalue = Math.round(data[i][type] * scale);
        data[i].percent = data[i][type] / total;
      });

      var totalscales = d3.sum(data, function(d) {
        return d.scalevalue;
      });
      var cols = Math.ceil(totalscales / rows);
      var griddata = cartesianprod(d3.range(cols), d3.range(rows));
      var detaildata = [];

      data.forEach(function(d) {
        d3.range(d.scalevalue).forEach(function(e) {
          detaildata.push({ name: d.name, class: d.class });
        });
      });

      detaildata.forEach(function(d, i) {
        detaildata[i].col = griddata[i][1];
        detaildata[i].row = griddata[i][0];
      });

      var gridSize = (height - margin.top - margin.bottom) / rows;

      var svg = selection
        .append("svg")
        .attr("width", "100%")
        .attr("height", height + "px")
        .append("g")
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("cursor", "default")
        .on("mouseleave", mouseout);

      var tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "waffle-tooltip")
        .style("position", "absolute")
        .style("text-align", "left")
        .style("background", "#fff")
        .style("margin", "3px")
        .style("color", "#333")
        .style("padding", "3px")
        .style("border", "1px")
        .style("display","none")
        .style("opacity", 0)
        .style("cursor", "default");

      var nodes = svg
        .selectAll(".node")
        .data(detaildata)
        .enter()
        .append("g")
        .attr("class", `node`)
        .attr("transform", function(d) {
          return (
            "translate(" +
            d.col * gridSize +
            "," +
            ( d.row ) * gridSize +
            ")"
          );
        });

      nodes
        .append("rect")
        .style("opacity", 1)
        .attr("width", gridSize)
        .attr("height", gridSize)
        .attr("class", function(d) {
          return d.class;
        })
        .style("fill", function(d) {
          return colorscale(d.class);
        })
      .style("opacity",0.9)
        .style("stroke", "#fff")
        .on("mouseenter", mouseover)
        .on("mousemove", mousemove);

      var legend = d3.select(`#${vizContainer} .legendContainer table tbody`)
        .selectAll(".legend")
        .data(data)
        .enter()
        .append("tr")
        .attr("class", d => `legend ${d.class}`)
        .on("mouseenter", mouseover2)
        .on("mouseleave", mouseout);

      legend
        .append("td")
        .attr("x", gridSize)
        .attr("y", function(d, i) {
          return (i * gridSize + (i * magic_padding) / 2);
        })
        .attr("width",15)
        .style("opacity", 1)
  
        .attr("class", function(d) {
          return "colorTable "+d.class;
        })
        .attr("transform", function(d) {
          return "translate(" + gridSize / 2 + "," + (5 / 6) * gridSize + ")";
        })
        .style("background", function(d) {
          return colorscale(d.class);
        })
      .style("opacity",0.9);

      legend
        .append("td")
        .attr("x", 1.5 * gridSize + magic_padding)
        .attr("y", function(d, i) {
          return i * gridSize + (i * magic_padding) / 2;
        })
        .style("opacity", 1)
        .html(function(d) {
          return d.name;
        })
        .attr("class", function(d) {
          return "waffle-legend " + " " + d.class;
        })
        .attr("transform", function(d) {
          return "translate(" + gridSize / 2 + "," + (5 / 6) * gridSize + ")";
        });
     
      
            legend.append("td")
        .html(d =>  d.research)
        .attr("class", d => "waffle-legend research" + " " + d.class);
        
            legend.append("td")
        .html(d =>  d.fourYear)
        .attr("class", d => "waffle-legend fourYear" + " " + d.class);
      
                legend.append("td")
        .html(d =>  d.twoYear)
        .attr("class", d => "waffle-legend twoYear" + " " + d.class);
      
            legend.append("td")
        .html(d =>  d.value)
        .attr("class", d => "waffle-legend total" + " " + d.class);

      function mouseover(d) {
        tooltip.style("opacity", 1)
                .style("display","block")

        el = data.filter(function(e) {
          return e.name == d.name;
        })[0];
        txt =
          "<b>" +
          el.name +
          "</b><br>" +
          d3.format(",")(el[type]) +
          "<br>(" +
          d3.format(".0%")(el.percent) +
          ")";
        tooltip.html(txt);
        d3.select("#" + vizContainer)
          .selectAll("rect")
          .style("opacity", 0.2);
           d3.select("#" + vizContainer)
          .selectAll("text")
          .style("opacity", 0.2);
        d3.select("#" + vizContainer)
          .selectAll("." + d.class)
          .style("opacity", 1);
      }

       function mouseover2(d) {
        el = data.filter(function(e) {
          return e.name == d.name;
        })[0];
        d3.select("#" + vizContainer)
          .selectAll("rect")
          .style("opacity", 0.2);
           d3.select("#" + vizContainer)
          .selectAll("text")
          .style("opacity", 0.2);
        d3.select("#" + vizContainer)
          .selectAll("." + d.class)
          .style("opacity", 0.9);
      }

      function mouseout(d) {
            tooltip.style("opacity", 0)
                .style("display","none")
        d3.select("#" + vizContainer)
          .selectAll("rect")
          .style("opacity", 0.9);
             d3.select("#" + vizContainer)
          .selectAll("text")
            .style("opacity", 1);
      }

      function mousemove(d) {
         var w = window.innerWidth;
    var h = window.innerHeight;
        
            if (d3.event.pageX < w / 2) {
      tooltip.style("left", d3.event.pageX + 20 + "px");
    } else {
      tooltip.style("left", d3.event.pageX - 80 + "px");
    } 
            if (d3.event.pageY < h / 3) {
      tooltip.style("top", d3.event.pageY + 20 + "px");
    } else {
      tooltip.style("top", d3.event.pageY - 70 + "px");
    }
      }
    });
  }

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.rows = function(_) {
    if (!arguments.length) return rows;
    rows = _;
    return chart;
  };
  
  chart.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return chart;
  };

  chart.colorscale = function(_) {
    if (!arguments.length) return colorscale;
    colorscale = _;
    return chart;
  };

  chart.appearancetimes = function(_) {
    if (!arguments.length) return appearancetimes;
    appearancetimes = _;
    return chart;
  };

  chart.adjust = function(_) {
    if (!arguments.length) return adjust;
    adjust = _;
    return chart;
  };

  return chart;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .trim(); // Trim - from end of text
}

function cartesianprod(paramArray) {
  function addTo(curr, args) {
    var i,
      copy,
      rest = args.slice(1),
      last = !rest.length,
      result = [];

    for (i = 0; i < args[0].length; i++) {
      copy = curr.slice();
      copy.push(args[0][i]);

      if (last) {
        result.push(copy);
      } else {
        result = result.concat(addTo(copy, rest));
      }
    }

    return result;
  }

  return addTo([], Array.prototype.slice.call(arguments));
}

var data = {
  oklahomaCity: [
        { name: "Capitol Hill",
      value: 60,
      research: 6,
      fourYear: 2,
      twoYear: 52,
      class: "capitolhill"
    },
    { name: "Classen School of Advanced Studies",
     value: 72,
      research: 37,
      fourYear: 18,
      twoYear: 17,
      class: "classenschool"
    },
    { name: "Douglass",
     value: 36,
      research: 1,
      fourYear: 10,
      twoYear: 25,
      class: "douglass"
    },
        { name: "Emerson",
     value: 30,
      research: 0,
      fourYear: 2,
      twoYear: 28,
      class: "emerson"
    },
            { name: "John Marshall",
     value: 26,
      research: 0,
      fourYear: 7,
      twoYear: 19,
      class: "jmarsh"
    },
                { name: "Northeast",
     value: 15,
      research: 2,
      fourYear: 5,
      twoYear: 8,
      class: "northeast"
    },
{ name: "Northwest Classen",
     value: 62,
      research: 5,
      fourYear: 3,
      twoYear: 54,
      class: "nwclassen"
    },
    { name: "Centennial",
     value: 12,
      research: 0,
      fourYear: 6,
      twoYear: 6,
      class: "centennial"
    },    { name: "Southeast",
     value: 84,
      research: 15,
      fourYear: 10,
      twoYear: 59,
      class: "southeast"
    },
        { name: "Star Spencer",
     value: 34,
      research: 0,
      fourYear: 1,
      twoYear: 33,
      class: "t15"
    },
            { name: "U.S. Grant",
     value: 126,
      research: 7,
      fourYear: 11,
      twoYear: 108,
      class: "usgrant"
    }
  ],
  edmond: [
    { name: "Memorial",
      value: 397,
      research: 153,
      fourYear: 179,
      twoYear: 65,
      class: "memorial"
    },
    { name: "North",
      value: 501,
      research: 217,
      fourYear: 232,
      twoYear: 52,
      class: "north"
    },
   { name: "Santa Fe",
     value: 408,
     research: 154,
     fourYear: 174,
     twoYear: 80,
     class: "santafe"
   }
],
  tulsa: [
  { name: "Booker T. Washington",
    value: 181,
    research: 75,
    fourYear:14,
    twoYear: 92,
    class: "btwashington" 
  },
  { name: "Central",
    value: 48,
    research: 4,
    fourYear: 13,
    twoYear: 31,
    class: "central" 
  },
  { name: "Daniel Webster",
    value: 37,
    research: 5,
    fourYear: 5,
    twoYear: 27,
    class: "danielwebster"
  },
  { name: "East Central",
    value: 73,
    research: 10,
    fourYear: 4,
    twoYear: 59,
    class: "eastcentral"
  },
  { name: "McLain",
    value: 34,
    research: 0,
    fourYear: 4,
    twoYear: 30,
    class: "mclain"
  },
  { name: "Memorial",
    value: 91,
    research: 14,
    fourYear: 1,
    twoYear: 76,
    class: "memorial"
  },
  { name: "Nathan Hale",
    value: 59,
    research: 0,
    fourYear: 7,
    twoYear: 52,
    class: "nathanhale"
  },
  { name: "Thomas Edison",
    value: 162,
    research: 47,
    fourYear: 27,
    twoYear: 88,
    class: "thomasedision"
  },
  { name: "Traice",
    value: 0,
    research: 0,
    fourYear: 0,
    twoYear: 0,
    class: "traice"
  },
  { name: "Tulsa Met",
    value: 7,
    research: 0,
    fourYear: 2,
    twoYear: 5,
    class: "tulsamet" },
  { name: "Will Rogers College",
    value: 81,
    research: 16,
    fourYear: 3,
    twoYear: 62,
    class: "willrodgers"
  },
  { name: "Tulsa Learning Academy",
    value: 18,
    research: 0,
    fourYear: 0,
    twoYear: 18,
    class: "tulsalearning"
  },
  { name: "Street School",
    value: 9,
    research: 0,
    fourYear: 0,
    twoYear: 9,
    class: "street"
  }
],
  moore: [
    { name: "Moore",
      value: 298,
      research: 67,
      fourYear: 35,
      twoYear: 196,
      class: "moore" 
  },
    { name: "Southmoore",
    value: 175,
    research: 41,
    fourYear: 42,
    twoYear: 92,
    class: "southmoore" 
  },
          { name: "Westmoore",
    value: 316,
    research: 102,
    fourYear:64,
    twoYear: 150,
    class: "westmoore" 
  }],
  putnamCity: [
        { name: "Putnam City",
      value: 153,
      research: 30,
      fourYear: 60,
      twoYear: 63,
      class: "putnmacity" 
  },    { name: "Putnam City North",
      value: 213,
      research: 50,
      fourYear: 83,
      twoYear: 80,
      class: "putnamcitynorth" 
  },    { name: "Putnam City West",
      value: 113,
      research: 20,
      fourYear: 33,
      twoYear: 60,
      class: "putnamcitywest" 
  },    { name: "Putnam City Academy",
      value: 2,
      research: 0,
      fourYear: 1,
      twoYear: 1,
      class: "putnamcityacademy" 
  }
  ],
  brokenArrow: [
     { name: "Broken Arrow",
      value: 523,
      research: 119,
      fourYear: 49,
      twoYear: 355,
      class: "brokenarrow" 
  }
  ],
  union: [
     { name: "Union",
      value: 571,
      research: 151,
      fourYear: 32,
      twoYear: 388,
      class: "union" 
  }
  ],
  norman: [
     { name: "Dimensions Academy",
      value: 1,
      research: 0,
      fourYear: 0,
      twoYear: 1,
      class: "dimensions" 
  },
     { name: "Norman",
      value: 258,
      research: 107,
      fourYear: 16,
      twoYear: 135,
      class: "norman" 
  },
     { name: "Norman North",
      value: 288,
      research: 172,
      fourYear: 38,
      twoYear: 78,
      class: "normannorth" 
  }
  ],
  lawton: [
       { name: "Eisenhower",
      value: 39,
      research: 18,
      fourYear: 6,
      twoYear: 15,
      class: "eisenhower" 
  },
       { name: "Lawton",
      value: 36,
      research: 12,
      fourYear: 16,
      twoYear: 8,
      class: "t1" 
  },
       { name: "MacArthur",
      value: 62,
      research: 23,
      fourYear: 24,
      twoYear: 15,
      class: "lawton" 
  }
  ],
  midDelDistrict: [
           { name: "Carl Albert",
      value: 297,
      research: 23,
      fourYear: 27,
      twoYear: 247,
      class: "carlalbert" 
  },       { name: "Del City",
      value: 237,
      research: 11,
      fourYear: 23,
      twoYear: 204,
      class: "delcity" 
  },           { name: "Midwest City",
      value: 272,
      research: 10,
      fourYear: 27,
      twoYear: 235,
      class: "mwcity" 
  }
  ],
  epic: [
          { name: "Epic Charter",
      value: 370,
      research: 34,
      fourYear: 81,
      twoYear: 255,
      class: "epic" 
  }
  ],
  homeschool: [
      { name: "Homeschooled",
      value: 412,
      research: 74,
      fourYear: 100,
      twoYear: 238,
      class: "homeschool" 
  }
  ]
};

var domain = (district) => data[district].sort((a,b) => b.value - a.value).map(function(d) {
  return slugify(d.value);
});

var chart = d3waffle();

const colorArr = {
  oklahomaCity: ["#693d40",
                "#7f3d58",
                "#9b3c77",
                "#a73c6b",
                "#b53b5d",
                "#cd3a46",
                "#d85f75",
                "#e997bd",
                "#efabc7",
                "#f7c6d5",
                "#ffe0e3"],
  tulsa: ["#272842",
         "#434e69",
         "#506880",
         "#64628a",
         "#8d81ac",
         "#9f8fc9",
         "#5597a3",
         "#6ab3ad",
         "#62d1c5",
         "#6ad4a4",
         "#8ce7d2",
         "#76f0e0",
         "#7cffff"],
  edmond: ["#8ca252",
              "#b5cf6b",
              "#cedb9c"],
  moore: ["#a55194",
         "#ce6dbd",
         "#de9ed6"],
  putnamCity: [
               "brown",
              "Chocolate",
              "coral",
  "lightcoral"],
  brokenArrow: ["lightblue"],
  union: ["Thistle"],
  norman: ["DarkSlateBlue",
           "CornflowerBlue",
          "DarkOrchid"
          ],
  lawton: ["#bd9e39",
          "#e7ba52",
          "#e7cb94"],
  midDelDistrict: ["LightSlateGrey",
                  "LightSeaGreen",
                  "LightGreen"],
  epic: ["sandybrown "],
  homeschool: ["MediumAquaMarine"]
};

const paletteTest = (district) => {
  return d3.scale
  .ordinal()
  .domain(domain(district))
  .range(colorArr[district]);
}

const chartTest = (district) =>  d3waffle('value').rows(43).colorscale(paletteTest(district));


Object.keys(data).map(district => {   
  return d3.select("#"+district+" svg svg")
  .datum(data[district])
  .call(chartTest(district));
}) 

function jumpto(anchor){
    window.location.href = "#"+anchor;
}

const fourYear = (district) => { return d3waffle('fourYear').rows(43).colorscale(paletteTest(district)); }
const twoYear = (district) => d3waffle('twoYear').rows(43).colorscale(paletteTest(district));
const research = (district) => d3waffle('research').rows(43).colorscale(paletteTest(district));
const total = (district) => d3waffle('value').rows(43).colorscale(paletteTest(district));

function filterTotal(district){
  selectFilter(district, ".totalSelector", "total");
  d3.select("#"+district+" svg svg")
    .datum(data[district])
    .call(total(district));
}

function filterResearch(district){
  selectFilter(district, ".researchSelector", "research");
  d3.select("#"+district+" svg svg")
    .datum(data[district])
    .call(research(district));
}

function filterFourYear(district){
  selectFilter(district, ".fourYearSelector", "fourYear");
  d3.select("#"+district+" svg svg")
    .datum(data[district])
    .call(fourYear(district));
}

function filterTwoYear(district){
  selectFilter(district, ".twoYearSelector", "twoYear");
  d3.select("#"+district+" svg svg")
  .datum(data[district])
  .call(twoYear(district));
}

function selectFilter(district,currentSelector, columnSelect) {
  var header = document.getElementById(district);
  var btns = header.querySelectorAll("button");
  var currentBtn = header.querySelector(currentSelector)
  btns.forEach(btn => btn.classList.remove("active"));
  currentBtn.classList.add("active")
  
  const allColumns = document.querySelectorAll(`#${district} table td`)
    allColumns.forEach(column => column.classList.remove('active'));

  const selectColumns = document.querySelectorAll(`#${district} table .${columnSelect}`)
  console.log(selectColumns)
  selectColumns.forEach(column => column.classList.add('active'));
}


const tablecolumns = document.querySelectorAll("table .total")
tablecolumns.forEach(column => column.classList.add('active'));


function myFunction(x) {
  var okcSVG = document.querySelector('#oklahomaCity svg');
  var tulsaSvg = document.querySelector('#tulsa svg');
  var edmondSvg = document.querySelector('#edmond svg');
  var mooreSvg = document.querySelector('#moore svg');
  var putnamCitySvg = document.querySelector('#putnamCity svg');
  var brokenArrowSvg = document.querySelector('#brokenArrow svg');
  var unionSvg = document.querySelector('#union svg');
  var normanSvg = document.querySelector('#norman svg');
  var lawtonSvg = document.querySelector('#lawton svg');
  var midDelDistrictSvg = document.querySelector('#midDelDistrict svg');
  var epicSvg = document.querySelector('#epic svg');
  var homeschoolSvg = document.querySelector('#homeschool svg');

  if (x.matches) {
    okcSVG.setAttribute("viewBox", "0 0 600 200");
    tulsaSvg.setAttribute("viewBox", "0 0 600 300");
    edmondSvg.setAttribute("viewBox", "0 0 600 430");
    mooreSvg.setAttribute("viewBox", "0 0 600 300");
    putnamCitySvg.setAttribute("viewBox", "0 0 600 200");
    brokenArrowSvg.setAttribute("viewBox", "0 0 600 200");
    unionSvg.setAttribute("viewBox", "0 0 600 200");
    normanSvg.setAttribute("viewBox", "0 0 600 200");
    lawtonSvg.setAttribute("viewBox", "0 0 600 100");
    midDelDistrictSvg.setAttribute("viewBox", "0 0 600 300");
    epicSvg.setAttribute("viewBox", "0 0 600 160");
    homeschoolSvg.setAttribute("viewBox", "0 0 600 180");

  } else {
    okcSVG.setAttribute("viewBox", "0 0 600 600");
    tulsaSvg.setAttribute("viewBox", "0 0 600 600");
    edmondSvg.setAttribute("viewBox", "0 0 600 600");
    mooreSvg.setAttribute("viewBox", "0 0 600 600");
    putnamCitySvg.setAttribute("viewBox", "0 0 600 600");
    brokenArrowSvg.setAttribute("viewBox", "0 0 600 600");
    unionSvg.setAttribute("viewBox", "0 0 600 600");
    normanSvg.setAttribute("viewBox", "0 0 600 600");
    lawtonSvg.setAttribute("viewBox", "0 0 600 600");
    midDelDistrictSvg.setAttribute("viewBox", "0 0 600 600");
    epicSvg.setAttribute("viewBox", "0 0 600 600");
    homeschoolSvg.setAttribute("viewBox", "0 0 600 600");
  }
}

var x = window.matchMedia("(max-width: 750px)")
myFunction(x) // Call listener function at run time
x.addListener(myFunction) // Attach listener function on state changes
