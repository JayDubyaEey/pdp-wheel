let fieldCount = 1;

function addField() {
  if (fieldCount < 10) {
    fieldCount++;
    const inputFields = document.getElementById("input-fields");
    const newField = document.createElement("div");
    newField.classList.add("row", "g-3", "my-2");
    newField.innerHTML = `
      <div class="col-10">
        <input type="text" class="form-control" id="statement-${fieldCount}" name="statement-${fieldCount}" placeholder="Statement" aria-label="Statement">
      </div>
      <div class="col-2">
        <input type="number" class="form-control" id="score-${fieldCount}" name="score-${fieldCount}" min="1" max="10" placeholder="1" aria-label="Score">
      </div>
    `;
    inputFields.appendChild(newField);
  }
}

document.getElementById("form").addEventListener("submit", function (event) {
  event.preventDefault();

  const data = [];
  for (let i = 1; i <= fieldCount; i++) {
    const subject = document.getElementById(`statement-${i}`).value;
    const value = document.getElementById(`score-${i}`).value;
    data.push({ subject, value: +value });
  }

  const width = 1200;
  const height = 1200;
  const innerRadius = 10;
  const outerRadius = Math.min(width, height) / 3;
  const fullCircle = 2 * Math.PI;

  d3.select("#pie-chart").html("");

  const svg = d3
    .select("#pie-chart")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const x = d3
    .scaleBand()
    .range([0, fullCircle])
    .align(0)
    .domain(data.map((d) => d.subject));

  const y = d3.scaleLinear().range([innerRadius, outerRadius]).domain([0, 10]);

  const arc = d3
    .arc()
    .innerRadius((d) => y(0))
    .outerRadius((d) => y(d.value))
    .startAngle((d) => x(d.subject))
    .endAngle((d) => x(d.subject) + x.bandwidth())
    .padAngle(0.01)
    .padRadius(innerRadius);

  svg
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => color(i));

  const ticks = svg
    .append("g")
    .selectAll("g")
    .data(y.ticks(10).slice(1))
    .enter()
    .append("g");

  ticks
    .append("circle")
    .attr("r", y)
    .attr("stroke", "#ccc")
    .attr("fill", "none");

  svg
    .append("circle")
    .attr("r", outerRadius)
    .attr("stroke", "black")
    .attr("fill", "none");

  const labelArc = d3
    .arc()
    .innerRadius(outerRadius + 50)
    .outerRadius(outerRadius + 50)
    .startAngle((d) => x(d.subject))
    .endAngle((d) => x(d.subject) + x.bandwidth());

  const labels = svg.selectAll(".label").data(data).enter().append("g");

  labels
    .append("line")
    .attr("x1", function (d) {
      return arc.centroid(d)[0];
    })
    .attr("y1", function (d) {
      return arc.centroid(d)[1];
    })
    .attr("x2", function (d) {
      return labelArc.centroid(d)[0];
    })
    .attr("y2", function (d) {
      return labelArc.centroid(d)[1];
    })
    .style("stroke", "black")
    .style("stroke-width", "1px");

  labels
    .append("rect")
    .attr("x", function (d) {
      const midpoint_angle = (x(d.subject) + x(d.subject) + x.bandwidth()) / 2;
      return midpoint_angle > Math.PI
        ? labelArc.centroid(d)[0]
        : labelArc.centroid(d)[0] - 50;
    })
    .attr("y", function (d) {
      return labelArc.centroid(d)[1] - 10;
    })
    .attr("width", 50)
    .attr("height", 20)
    .style("fill", "white");

  labels
    .append("text")
    .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", function (d) {
      const midpoint_angle = (x(d.subject) + x(d.subject) + x.bandwidth()) / 2;
      return midpoint_angle > Math.PI ? "end" : "start";
    })
    .attr("dy", ".35em")
    .text((d) => d.subject);
});
