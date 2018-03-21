const gpu = new GPU();
const WIDTH = 720;
const HEIGHT = 720;
const MS_BETWEEN_FRAMES = 16.67;
const INITIAL_LIFE = WIDTH * HEIGHT * 0.2;

var matrix;
var body;

const initMatrix = gpu.createKernel(function(value) {  
  return value;
})
.setOutput([HEIGHT, WIDTH]);

const render = gpu.createKernel(function(matrix) {
  var i = matrix[this.thread.y][this.thread.x] + 0.1; // +0.1 to not use pure black
  this.color(i, i, i, 1);
})
.setOutput([HEIGHT, WIDTH])
.setGraphical(true);

const CANVAS = render.getCanvas();

function calcNeighbors(matrix, x, y, width, height) {
  var up =    (y+1)%height;
  var down =  (y-1)%height;
  var right = (x+1)%width;
  var left =  (x-1)%width;
  return matrix[left ][up] + matrix[left ][y] + matrix[left ][down] + 
         matrix[  x  ][up]          +           matrix[  x  ][down] +
         matrix[right][up] + matrix[right][y] + matrix[right][down];
}
gpu.addFunction(calcNeighbors);

const lifeGame = gpu.createKernel(function(matrix) {
  var x = this.thread.y;
  var y = this.thread.x;
  var alive = matrix[x][y];
  var neighbors = calcNeighbors(matrix, x, y, width, height);
  return alive * float(neighbors == 2) + float(neighbors == 3);
})
.setConstants({
  width: WIDTH,
  height: HEIGHT
})
.setOutput([HEIGHT, WIDTH])
.setOutputToTexture(true);

function gameOfLifeUpdate() {
  matrix = lifeGame(matrix);
  render(matrix);
  setTimeout(gameOfLifeUpdate, MS_BETWEEN_FRAMES);
}


$(document).ready(function() {
  matrix = initMatrix(0);
  body = document.getElementsByTagName('body')[0];
  body.appendChild(CANVAS);
  
  let i = INITIAL_LIFE;
  while(i --> 0){
	  let x = Math.floor(Math.random() * HEIGHT);
	  let y = Math.floor(Math.random() * WIDTH);
	  matrix[x][y] = 1;
  }
  
  gameOfLifeUpdate();
});