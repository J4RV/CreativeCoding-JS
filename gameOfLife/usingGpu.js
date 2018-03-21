const gpu = new GPU();

// IDK LOL

var frame = 0;
var i = 0;

const WIDTH = 1280;
const HEIGHT = 720;

gpu.addFunction(function noise(v) {
  return (
            sin(v) +
            sin((v)*2+10.2)*0.5 +
            sin((v)*4+3.6)*0.25 +
            sin((v)*8+8.5)*0.125 +
            sin((v)*16+2.45)/16
          )*0.5+0.3;          
});

gpu.addFunction(calcNeighbors);

const initMatrix = gpu.createKernel(function(value) {  
  return value;
}).setOutput([WIDTH, HEIGHT]);

const render = gpu.createKernel(function(matrix) {
  var i = matrix[this.thread.x][this.thread.y];
  this.color(i, i, i, 1);
})
.setOutput([WIDTH, HEIGHT])
.setGraphical(true);

function calcNeighbors(matrix, x, y, width, height) {
  var up =    (x-1)%width;
  var down =  (x+1)%width;
  var left =  (y+1)%height;
  var right = (x-1)%height;
  return matrix[up  ][left] + matrix[up  ][y] + matrix[up  ][right] + 
         matrix[x   ][left] + matrix[x   ][y] + matrix[x   ][right] +
         matrix[down][left] + matrix[down][y] + matrix[down][right];
}

const lifeGame = gpu.createKernel(function(matrix) {
  var x = this.thread.x;
  var y = this.thread.y;
  var alive = matrix[x][y];
  var neighbors = calcNeighbors(matrix, x, y, width, height);
  return alive * float(neighbors == 2) + float(neighbors == 3);
})
.setConstants({
  width: WIDTH,
  height: HEIGHT,
})
.setOutput([WIDTH, HEIGHT]);

const canvas = render.getCanvas();
var body;
function gameOfLifeUpdate() {
  var matrix = lifeGame(matrix);
  render(matrix);
  body.appendChild(canvas);
}

$(document).ready(function() {
  console.log(canvas);
  body = document.getElementsByTagName('body')[0];
  var matrix = initMatrix(0);
  console.log(matrix);
  matrix[0][0] = 1;
  matrix[2][0] = 1;
  matrix[2][2] = 1;
  setInterval(gameOfLifeUpdate, 18);
});