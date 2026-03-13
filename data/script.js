var margin = { top: 20, right: 0, bottom: 50, left: 0 },
  width = 1400;

// Append main SVG
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + 25)
  .attr("height", 0)
  .append("g")
  .attr("transform", `translate(0,${margin.top})`);

// SVG Shapes
const defs = svg.append("defs");

// Left Right Half
function defineHalfPattern(id, colorA, colorB, angle = 0) {
  const p = defs
    .append("pattern")
    .attr("id", id)
    .attr("patternUnits", "objectBoundingBox")
    .attr("patternContentUnits", "objectBoundingBox")
    .attr("width", 1)
    .attr("height", 1);

  p.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 0.5)
    .attr("height", 1)
    .attr("fill", colorA);

  p.append("rect")
    .attr("x", 0.5)
    .attr("y", 0)
    .attr("width", 0.5)
    .attr("height", 1)
    .attr("fill", colorB);
}

// Top Bottom Half
function defineHalfTopPattern(id, colorA, colorB, angle = 0) {
  const p = defs
    .append("pattern")
    .attr("id", id)
    .attr("patternUnits", "objectBoundingBox")
    .attr("patternContentUnits", "objectBoundingBox")
    .attr("width", 1)
    .attr("height", 1);

  p.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1)
    .attr("height", 0.5)
    .attr("fill", colorA);

  p.append("rect")
    .attr("x", 0)
    .attr("y", 0.5)
    .attr("width", 1)
    .attr("height", 0.5)
    .attr("fill", colorB);
}

function defineQuarterPattern(id, c1, c2, c3, c4) {
  const p = defs
    .append("pattern")
    .attr("id", id)
    .attr("patternUnits", "objectBoundingBox")
    .attr("patternContentUnits", "objectBoundingBox")
    .attr("width", 1)
    .attr("height", 1);

  p.append("rect").attr("x", 0).attr("y", 0).attr("width", 0.5).attr("height", 0.5).attr("fill", c1);
  p.append("rect").attr("x", 0.5).attr("y", 0).attr("width", 0.5).attr("height", 0.5).attr("fill", c2);
  p.append("rect").attr("x", 0).attr("y", 0.5).attr("width", 0.5).attr("height", 0.5).attr("fill", c3);
  p.append("rect").attr("x", 0.5).attr("y", 0.5).attr("width", 0.5).attr("height", 0.5).attr("fill", c4);
}

// Type of Purchase
defineHalfPattern("achat", "#ffffff", "#c51130");
defineHalfTopPattern("acquisition", "#ffffff", "#231f20");
defineQuarterPattern("attribution", "#241f21", "#fcba2f", "#ca1131", "#012d6e");
defineQuarterPattern("dation", "#ffffff", "#ca1131", "#ca1131", "#ffffff");
defineHalfPattern("depot", "#ca1131", "#fcba2f");
defineQuarterPattern("don", "#012d6e", "#fcba2f", "#fcba2f", "#012d6e");
defineHalfPattern("donation", "#012d6e", "#fcba2f");
defineHalfTopPattern("etat", "#012d6e", "#ffffff");
defineQuarterPattern("fonds", "#ffffff", "#012d6e", "#012d6e", "#ffffff");
defineHalfPattern("inscription", "#241f21", "#c51130");
defineHalfPattern("legs", "#012d6e", "#fcba2f");
defineQuarterPattern("autre", "#241f21", "#ffffff", "#ffffff", "#241f21");

// Gender
defineQuarterPattern("man", "#012d6e", "#0a60c6", "#0a60c6", "#012d6e");
defineQuarterPattern("woman", "#c51130", "#70061d", "#70061d", "#c51130");
defineQuarterPattern("group", "#fc5832", "#fcba2f", "#fcba2f", "#fc5832");
defineQuarterPattern("unknown", "#aaaaaa", "#ffffff", "#ffffff", "#aaaaaa");

// Fixed row spacing
const rowSpacing = 26;
function yPos(d, i) {
  return i * rowSpacing;
}

// Store original data
let originalData;

// Color scales
var colorDesignType = d3
  .scaleOrdinal()
  .domain([
    "Architecture/ Design d'Intérieur",
    "Mobilier",
    "Design Graphique/ Illustration",
    "Design d'Objet",
    "Design Industriel",
    "Design des Technologies",
    "Design Vestimentaire ",
  ])
  .range([
    "#91a879",
    "#c6bca2",
    "#da3035",
    "#8d2438",
    "#e7a02c",
    "#83b7ca",
    "#1a4d8b",
  ]);

const colorAcquisitionType = d3
  .scaleOrdinal()
  .domain([
    "Achat",
    "Acquisition",
    "Attribution",
    "Dation",
    "Dépôt",
    "Don",
    "Donation",
    "Etat",
    "Fonds",
    "Inscription",
    "Legs",
    "Autre",
  ])
  .range([
    "url(#achat)",
    "url(#acquisition)",
    "url(#attribution)",
    "url(#dation)",
    "url(#depot)",
    "url(#don)",
    "url(#donation)",
    "url(#etat)",
    "url(#fonds",
    "url(#inscription)",
    "url(#legs)",
    "url(#autre)",
  ])
  .unknown("url(#autre)");

const colorGendre = d3
  .scaleOrdinal()
  .domain(["Homme", "Femme", "Studio/ Group", "Unknown"])
  .range(["url(#man)", "url(#woman)", "url(#group)", "url(#unknown)"]);

// Tooltip
const tooltip = d3
  .select(".MainBody")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("pointer-events", "none");

// X axis scale
var x = d3.scaleLinear().domain([1897, 2025]).range([0, width]);

// Groups
var lineInfo = svg.append("g");
var cercleLeft = svg.append("g");
var cercleRight = svg.append("g");

var strokeWidthMouseOff = 10;
var strokeWidthMouseOn = 27;
var radiusOn = 12;
var radiusOff = 8;
var duration = 100;

// Tooltip functions
function showTooltip(d) {
  tooltip.html(`
    <div class="tooltip-column">
      <div class="image">
        <img src="image/${d.Image}" width="200" height="150">
      </div>
      <div class="type"><strong>${d.TypeDesign}</strong> </div>
    </div>
    <div class="tooltip-column">
      <strong>Creation:</strong> ${d.DCU}<br>
      <strong>Acquisition:</strong> ${d.DAU}<br>
      ${d.Acquisition}<div class="rondplein"></div>
    </div>
    <div class="tooltip-column">
      <strong>${d.Titre}</strong><br>
      ${d.TypeDesign}
      <div class="rondbarre">
        <div class="rond"></div><div class="barre"></div><div class="rond"></div>
      </div>
      ${d.MST}
      ${d.Dimensions}
    </div>
    <div class="tooltip-column">
      <div class="designer">
        <strong>${d.Nom}</strong><div class="rondplein"></div>
      </div>
      <div class="flag"><img src="image/${d.flag}" width="auto" height="25" border="0zpx black solid"></div>
      <div>${d.Nationalite}</div>
      _____ <br>
      ${d.DDN}
    </div>
  `);

  const frameHeight = document.querySelector(".frame").offsetHeight;
  tooltip.style("top", frameHeight + "px");
  tooltip.transition().duration(200).style("opacity", 1);
}

function hideTooltip() {
  tooltip.transition().duration(0).style("opacity", 1).style("border");
}

// Highlight/reset
function highlight(d) {
  cercleLeft.selectAll("circle").filter((e) => e.Group === d.Group).transition().duration(duration).attr("r", radiusOn);
  cercleRight.selectAll("circle").filter((e) => e.Group === d.Group).transition().duration(duration).attr("r", radiusOn);
  lineInfo.selectAll("line").filter((e) => e.Group === d.Group).transition().duration(duration).attr("stroke-width", strokeWidthMouseOn);
}

function resetHighlight(d) {
  cercleLeft.selectAll("circle").filter((e) => e.Group === d.Group).transition().duration(duration).attr("r", radiusOff);
  cercleRight.selectAll("circle").filter((e) => e.Group === d.Group).transition().duration(duration).attr("r", radiusOff);
  lineInfo.selectAll("line").filter((e) => e.Group === d.Group).transition().duration(duration).attr("stroke-width", strokeWidthMouseOff);
}

// Load CSV
d3.csv("data/proto.csv", function (data) {
  originalData = data;

  // Populate nationality filter
  const nationalities = Array.from(new Set(data.map((d) => d.Nationalite).filter((d) => d && d !== ""))).sort();
  const natSelect = d3.select("#nationaliteFilter");
  natSelect.selectAll("option.nat").data(nationalities).enter().append("option").attr("class", "nat").attr("value", (d) => d).text((d) => d);

  updateGraph(originalData);

  d3.select("#typeDesignFilter").on("change", updateFilters);
  d3.select("#genderFilter").on("change", updateFilters);
  d3.select("#nomSearch").on("input", updateFilters);
  d3.select("#nationaliteFilter").on("change", updateFilters);

  // SHOW TOOLTIP FOR FIRST ROW ON PAGE LOAD
  if (originalData.length > 0) {
    showTooltip(originalData[0]);
  }
});

// updateFilters() and updateGraph() remain unchanged

function updateFilters() {
  const selectedType = d3.select("#typeDesignFilter").property("value");
  const selectedGender = d3.select("#genderFilter").property("value");
  const selectedNat = d3.select("#nationaliteFilter").property("value");
  const searchValue = d3.select("#nomSearch").property("value").toLowerCase();

  const filtered = originalData.filter((d) => {
    const typeMatch = selectedType === "All" || d.TypeDesign === selectedType;

    const genderMatch =
      selectedGender === "All" ||
      (selectedGender === "Groupe/Studio" && d.Sexe === "Studio/ Group") ||
      (selectedGender === "Inconnue" && d.Sexe === "Unknown") ||
      d.Sexe === selectedGender;

    const natMatch = selectedNat === "All" || d.Nationalite === selectedNat;

    const nameMatch =
      searchValue === "" || d.Nom.toLowerCase().includes(searchValue);

    return typeMatch && genderMatch && natMatch && nameMatch;
  });

  updateGraph(filtered);
}

// Update graph
function updateGraph(data) {
  const newHeight = data.length * rowSpacing + margin.top + margin.bottom;
  d3.select("#my_dataviz svg").attr("height", newHeight);

  svg.selectAll(".x-grid").remove();
  svg
    .insert("g", ":first-child")
    .attr("class", "x-grid")
    .call(d3.axisBottom(x).ticks(40).tickSize(newHeight).tickFormat(""))
    .attr("transform", `translate(0,-50)`)
    .call((g) => g.select(".domain").remove())
    .selectAll("line")
    .attr("stroke", "#252541ff")
    .attr("stroke-width", 1)
    .attr("fill", "none");

  d3.select("#scale svg").remove();
  var g = d3
    .select("#scale")
    .append("svg")
    .attr("width", width)
    .attr("height", 50)
    .append("g")
    .call(
      d3
        .axisBottom(x)
        .ticks(40)
        .tickSize(50)
        .tickFormat((d) => d)
    );

  g.select(".domain").remove();

  g.selectAll("text")
    .attr("x", 22)
    .attr("y", -14)
    .attr("transform", "rotate(90)")
    .style("font-size", "15px")
    .style("font-family", "Jost")
    .attr("fill", "beige");

  const lines = lineInfo.selectAll("line").data(data, (d) => d.Group);
  lines.exit().remove();
  lines
    .enter()
    .append("line")
    .merge(lines)
    .attr("x1", (d) => x(d.DCU))
    .attr("x2", (d) => x(d.DAU))
    .attr("y1", (d, i) => yPos(d, i))
    .attr("y2", (d, i) => yPos(d, i))
    .attr("stroke", (d) => colorDesignType(d.TypeDesign))
    .attr("stroke-width", strokeWidthMouseOff)
    .on("mouseover", (d) => {
      highlight(d);
      showTooltip(d);
    })
    .on("mouseout", (d) => {
      resetHighlight(d);
      hideTooltip();
    });

  const leftCircles = cercleLeft.selectAll("circle").data(data, (d) => d.Group);
  leftCircles.exit().remove();
  leftCircles
    .enter()
    .append("circle")
    .merge(leftCircles)
    .attr("cx", (d) => x(d.DAU))
    .attr("cy", (d, i) => yPos(d, i))
    .attr("r", radiusOff)
    .attr("fill", (d) => colorGendre(d.Sexe))
    .attr("stroke", (d) => colorDesignType(d.TypeDesign))
    .style("stroke-width", 3)
    .style("vector-effect", "non-scaling-stroke")
    .on("mouseover", (d) => {
      highlight(d);
      showTooltip(d);
    })
    .on("mouseout", (d) => {
      resetHighlight(d);
      hideTooltip();
    });

  const rightCircles = cercleRight
    .selectAll("circle")
    .data(data, (d) => d.Group);
  rightCircles.exit().remove();
  rightCircles
    .enter()
    .append("circle")
    .merge(rightCircles)
    .attr("cx", (d) => x(d.DCU))
    .attr("cy", (d, i) => yPos(d, i))
    .attr("r", radiusOff)
    .attr("fill", (d) => colorAcquisitionType(d.TypeAcquisition))
    .attr("stroke", (d) => colorDesignType(d.TypeDesign))
    .style("stroke-width", 3)
    .style("vector-effect", "non-scaling-stroke")
    .on("mouseover", (d) => {
      highlight(d);
      showTooltip(d);
    })
    .on("mouseout", (d) => {
      resetHighlight(d);
      hideTooltip();
    });

  // Apply JS-defined colors/patterns to the legend circles
  d3.selectAll(".element_rond").each(function () {
    const type = d3.select(this).attr("data-acquisition");
    const fill = colorAcquisitionType(type);
    d3.select(this).selectAll("*").remove();
    d3.select(this)
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "center")
      .style("height", "40px")
      .style("margin-top", "14px");
        const svg = d3
      .select(this)
      .append("svg")
      .attr("width", 20)
      .attr("height", 20);
    svg
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 8)
      .attr("fill", fill)
      .attr("stroke", "#000")
      .attr("stroke-width", 2);
  });

  // Gender legend circles
  d3.selectAll(
    ".element_rond12, .element_rond13, .element_rond14, .element_rond15"
  ).each(function () {
    const gender = d3.select(this).attr("data-gender");
    const fill = colorGendre(gender);
    d3.select(this).selectAll("*").remove();
    d3.select(this)
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "center")
      .style("gap", "20px")
      .style("margin-top", "14px");
    const svg = d3
      .select(this)
      .append("svg")
      .attr("width", 20)
      .attr("height", 20);
    svg
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 8)
      .attr("fill", fill)
      .attr("stroke", "#000")
      .attr("stroke-width", 2);
  });
}

