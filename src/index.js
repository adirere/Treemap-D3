import "./styles.css";
import * as d3 from "d3";

const app = document.getElementById("app");

const moviesURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";
const videoGamesURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
const kickstarterURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

getDataBuildTree("movies");

const selection = document.getElementById("dataset");
selection.addEventListener("change", (e) => getDataBuildTree(e.target.value));

async function getDataBuildTree(type) {
  document.getElementById("app").innerHTML = "";
  const legendEl = document.getElementById("legend");
  if (legendEl) legendEl.parentNode.removeChild(legendEl);
  const tooltipEl = document.getElementById("tooltip");
  if (tooltipEl) tooltipEl.parentNode.removeChild(tooltipEl);

  if (type === "movies") {
    const data = await d3.json(moviesURL);
    //title
    d3.select("#app")
      .append("div")
      .attr("id", "title")
      .text("Highest Grossing Movies");

    //description
    d3.select("#app")
      .append("div")
      .attr("id", "description")
      .text("Top 95 Highest Grossing Movies Sorted by Revenue");

    buildTree(data);
  }
  if (type === "videogames") {
    const data = await d3.json(videoGamesURL);
    //title
    d3.select("#app")
      .append("div")
      .attr("id", "title")
      .text("Video Game Sales");

    //description
    d3.select("#app")
      .append("div")
      .attr("id", "description")
      .text("Top 100 Most Sold Video Games Grouped by Platform");

    buildTree(data);
  }

  if (type === "kickstarter") {
    const data = await d3.json(kickstarterURL);
    //title
    d3.select("#app")
      .append("div")
      .attr("id", "title")
      .text("Kickstarter Pledges");

    //description
    d3.select("#app")
      .append("div")
      .attr("id", "description")
      .text("Top Kickstarter Pledges Sorted by Founding");

    buildTree(data);
  }
}

const buildTree = (data) => {
  const hierarchy = d3
    .hierarchy(data, (d) => d.children)
    .sum((d) => d.value)
    .sort((d1, d2) => d2.value - d1.value);

  const createTreemap = d3.treemap().size([1000, 600]).paddingInner(1);
  //set coordonates for each leaf
  createTreemap(hierarchy);

  const hierarchyName = hierarchy.children.map((d) => {
    return d.data.name;
  });

  //build svg
  const canvas = d3
    .select("#app")
    .append("svg")
    .attr("id", "canvas")
    .attr("width", 1000)
    .attr("height", 600);

  //color scale
  const colors = d3
    .scaleLinear()
    .domain([1, hierarchyName.length])
    .range([d3.rgb("#FF006D"), d3.rgb("#00FF92")]);

  //tooltip
  const tooltip = d3.select("body").append("div").attr("id", "tooltip");

  //rectangles
  let rectangleGroup = d3
    .select("#canvas")
    .selectAll("g")
    .data(hierarchy.leaves())
    .enter()
    .append("g")
    .attr("transform", (d) => {
      return "translate(" + d.x0 + ", " + d.y0 + ")";
    })
    .attr("width", (d) => d.x1 - d.x0);

  rectangleGroup
    .append("rect")
    .attr("class", "tile")
    .attr("fill", (d) => {
      const category = d.data.category;
      return colors(hierarchyName.indexOf(category) + 1);
    })
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .on("mouseover", (d, i) => {
      tooltip.transition().style("visibility", "visible");
      tooltip.html(`Name: ${i.data.name}<br>
      Category: ${i.data.category}<br>
      Value: ${i.data.value
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}`);
      tooltip.style("top", d.clientY + "px");
      tooltip.style("left", d.clientX + "px");
      tooltip.attr("data-value", i.data.value);
    })
    .on("mousemove", (d, i) => {
      tooltip.style("top", d.clientY + "px");
      tooltip.style("left", d.clientX + "px");
    })
    .on("mouseout", (d) => {
      tooltip.transition().style("visibility", "hidden");
    });

  rectangleGroup
    .append("text")
    .attr("id", "rectText")
    .text((d) => d.data.name)
    .attr("x", 5)
    .attr("y", 20)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("shape", "square");

  //legend
  const legend = d3
    .select("body")
    .append("svg")
    .attr("id", "legend")
    .attr("height", (hierarchyName.length + 1) * 40);

  legend
    .selectAll("g")
    .data(hierarchyName)
    .enter()
    .append("g")
    .attr("id", "legendG");

  d3.selectAll("#legendG")
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", 10)
    .attr("y", (d, i) => (i + 1) * 40)
    .attr("height", 40)
    .attr("width", 40)
    .attr("fill", (d, i) => colors(i + 1));

  d3.selectAll("#legendG")
    .append("text")
    .attr("x", 60)
    .attr("y", (d, i) => 60 + i * 40)
    .text((d, i) => hierarchyName[i]);
};
