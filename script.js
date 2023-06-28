let fieldCount = 1;

function addField() {
  if (fieldCount < 10) {
    fieldCount++;
    const inputFields = document.getElementById("input-fields");
    const newField = document.createElement("div");
    newField.classList.add("row", "g-3", "my-2");
    newField.setAttribute("id", `row-${fieldCount}`);
    newField.innerHTML = `

    <div class="col-auto">
      <button type="button" onclick="deleteField(${fieldCount})" class="btn btn-danger">
        <i class="bi bi-x-circle"></i>
      </button>
    </div>
    <div class="col">
      <input type="text" class="form-control" id="statement-${fieldCount}" name="statement-${fieldCount}" placeholder="Statement" aria-label="Statement">
    </div>
      <div class="col-auto">
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

  const width = 1400;
  const height = 1400;
  const innerRadius = 40;
  const outerRadius = Math.min(width, height) / 6;
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
    .attr("fill", (d, i) => {
      const color = d3.schemeCategory10[i % 10];
      return color === "#ffffff" ? d3.schemeCategory10[(i + 1) % 10] : color;
    });

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

function exportAsJPEG() {
  const svgElement = document.getElementById("pie-chart");
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBase64 = btoa(svgData);
  const imageData = `data:image/svg+xml;base64,${svgBase64}`;

  const canvas = document.createElement("canvas");
  canvas.width = svgElement.clientWidth;
  canvas.height = svgElement.clientHeight;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff"; // Set canvas background color to white
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const image = new Image();
  image.onload = function () {
    ctx.drawImage(image, 0, 0);
    canvas.toBlob(function (blob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "wheel_" + Date.now() + ".jpg";
      link.click();
    }, "image/jpeg");
  };
  image.src = imageData;
}

document
  .querySelector(".btn.btn-success")
  .addEventListener("click", function () {
    const wheelPanel = document.getElementById("wheel-pannel");
    wheelPanel.classList.toggle("d-none");
  });

function deleteField(event) {
  const row = event.target.closest(".row");
  row.remove();
}

function deleteField(fieldIndex) {
  const field = document.getElementById(`row-${fieldIndex}`);
  field.remove();
}
