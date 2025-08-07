// Points & Circles Interactive App
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');
const resetBtn = document.getElementById('resetBtn');
const aboutBtn = document.getElementById('aboutBtn');
const aboutDiv = document.getElementById('about');

let points = [];
let draggingIdx = null;

canvas.addEventListener('mousedown', (e) => {
  const {x, y} = getMousePos(e);
  // Check if dragging existing point
  for (let i = 0; i < points.length; i++) {
    if (distance(points[i], {x, y}) < 5) {
      draggingIdx = i;
      return;
    }
  }
  // Add new point if less than 4
  if (points.length < 4) {
    points.push({x, y});
    draggingIdx = points.length - 1;
    draw();
    updateInfo();
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (draggingIdx !== null) {
    const {x, y} = getMousePos(e);
    points[draggingIdx] = {x, y};
    draw();
    updateInfo();
  }
  else {
    // useful: Show cursor as pointer when hovering over existing points
    const {x, y} = getMousePos(e);
    const isOverPoint = points.some(p => distance(p, {x, y}) < 5);
    canvas.style.cursor = isOverPoint ? 'pointer' : 'default';
  }
});

canvas.addEventListener('mouseup', () => {
  draggingIdx = null;
});

resetBtn.addEventListener('click', () => {
  points = [];
  draw();
  updateInfo();
});

aboutBtn.addEventListener('click', () => {
  aboutDiv.style.display = aboutDiv.style.display === 'none' ? 'block' : 'none';
});

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function distance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw points
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.font = '12px Arial';
    ctx.fillText(String.fromCharCode(65 + i), p.x + 6, p.y - 6);
  });
  // Draw circles
  if (points.length >= 2) {
    drawCircle(points[0], distance(points[0], points[1]), 'blue');
  }
  if (points.length >= 4) {
    drawCircle(points[2], distance(points[2], points[3]), 'yellow');
    // Draw intersection points
    const inters = circleIntersections(
      points[0], distance(points[0], points[1]),
      points[2], distance(points[2], points[3])
    );
    if (inters) {
      inters.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
    }
  }
}

function drawCircle(center, radius, color) {
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function updateInfo() {
  let html = '';
  points.forEach((p, i) => {
    html += `${String.fromCharCode(65 + i)}: (${p.x.toFixed(1)}, ${p.y.toFixed(1)})<br>`;
  });
  if (points.length === 4) {
    const inters = circleIntersections(
      points[0], distance(points[0], points[1]),
      points[2], distance(points[2], points[3])
    );
    if (inters) {
      html += '<b>Intersection points:</b><br>';
      inters.forEach((pt, idx) => {
        html += `P${idx + 1}: (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})<br>`;
      });
    } else {
      html += '<b>No intersection points</b>';
    }
  }
  info.innerHTML = html;
}

// Returns array of intersection points or null
function circleIntersections(c1, r1, c2, r2) {
  const d = distance(c1, c2);
  if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) return null;
  const a = (r1 ** 2 - r2 ** 2 + d ** 2) / (2 * d);
  const h = Math.sqrt(r1 ** 2 - a ** 2);
  const x2 = c1.x + a * (c2.x - c1.x) / d;
  const y2 = c1.y + a * (c2.y - c1.y) / d;
  const rx = -(c2.y - c1.y) * (h / d);
  const ry = (c2.x - c1.x) * (h / d);
  return [
    { x: x2 + rx, y: y2 + ry },
    { x: x2 - rx, y: y2 - ry }
  ];
}

draw();
updateInfo();
