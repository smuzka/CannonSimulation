width = "800";
height = "500";
const shotAngle = document.getElementById("shotAngle");
const shotSpeed = document.getElementById("speed");

const c = document.getElementById("myCanvas");
// set width and height
c.setAttribute("width", `${width}px`);
c.setAttribute("height", `${height}px`);
c.style.width = `${width}px`;
c.style.height = `${height}px`;
const ctx = c.getContext("2d");

// starting angle (45 deg)
var angle = 0.7853981633974483;
function getCursorPosition(canvas, event) {
  // get where you clicked
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // calculates angle in radian
  angle = (Math.atan2(height - y, x) * 180) / 180;
  shotAngle.innerHTML = angle;
}
// on click
const canvas = document.querySelector("canvas");
canvas.addEventListener("mousedown", function (e) {
  getCursorPosition(canvas, e);
  balls.push(new Circle());
});

function Circle() {
  this.x = 0;
  this.y = height;
  this.r = 10;
  this.c = "red";

  this.dx = speed.value * Math.cos(angle);
  this.dy = speed.value * Math.sin(angle);

  this.draw = function () {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  };

  this.animate = function () {
    this.x += this.dx;
    this.y -= this.dy;
    this.dy -= gravity.value;

    this.draw();
  };
}

const balls = [];

function Update() {
  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  // rotate gun
  ctx.translate(0, height);
  ctx.rotate(-angle);
  ctx.translate(0, -height);

  // create gun
  ctx.fillStyle = "black";
  ctx.fillRect(0, height - 10, 80, 20);

  // rotate back
  ctx.translate(0, height);
  ctx.rotate(angle);
  ctx.translate(0, -height);
  for (let i = 0; i < balls.length; i++) {
    let ball = balls[i];
    if (ball.dx != 0) {
      ball.animate();
    }
  }

  requestAnimationFrame(Update);
}

Update();
