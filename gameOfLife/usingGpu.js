const gpu = new GPU();

var matrix;

var WIDTH = 512;
var HEIGHT = 512;


const initMatrix = gpu.createKernel(function(value) {  
  return value;
})
.setOutput([HEIGHT, WIDTH]);

const render = gpu.createKernel(function(matrix) {
  var i = matrix[this.thread.y][this.thread.x];
  this.color(i, i, i, 1);
})
.setOutput([HEIGHT, WIDTH])
.setGraphical(true);

function calcNeighbors(matrix, x, y, width, height) {
  var up =    (y+1)%height;
  var down =  (y-1)%height;
  var right = (x+1)%width;
  var left =  (x-1)%width;
  return matrix[left ][up  ] + matrix[left ][y] + matrix[left ][down] + 
         matrix[x    ][up  ]          +           matrix[x    ][down] +
         matrix[right][up  ] + matrix[right][y] + matrix[right][down];
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

const canvas = render.getCanvas();
var body;
function gameOfLifeUpdate() {
  matrix = lifeGame(matrix);
  render(matrix);
  setTimeout(gameOfLifeUpdate, 16);
}

$(document).ready(function() {
  matrix = initMatrix(0);
  render(matrix);
  body = document.getElementsByTagName('body')[0];
  body.appendChild(canvas);
  console.log(canvas);
  
  /*matrix[0][2] = 1;
  matrix[1][1] = 1;
  matrix[0][0] = 1;
  matrix[2][2] = 1;
  console.log(matrix);
  */
  
  matrix[10+0][10+0] = 1;
  matrix[10+0][10+1] = 1;
  matrix[10+0][10+2] = 1;
  matrix[10+4][10+2] = 1;
  matrix[10+1][10+2] = 1;
  matrix[10+2][10+1] = 1;
  matrix[10+3][10+1] = 1;
  matrix[10+4][10+1] = 1;
  matrix[10+4][10+2] = 1;
  matrix[10+3][10+3] = 1;
  var i = 20000;
  while(i-- > 0){
	  let x = Math.floor(Math.random() * HEIGHT);
	  let y = Math.floor(Math.random() * WIDTH);
	  matrix[x][y] = 1;
  }
  console.log(matrix);
  
  
  console.log(calcNeighbors(matrix, 1, 1, WIDTH, HEIGHT));
  //matrix = lifeGame(matrix);
  console.log(matrix);
  console.log(calcNeighbors(matrix, 1, 1, WIDTH, HEIGHT));
  
  
  setTimeout(gameOfLifeUpdate, 16);
});