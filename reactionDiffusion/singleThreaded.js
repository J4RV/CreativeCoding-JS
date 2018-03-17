const WIDTH = 200
const HEIGHT = 200

const DIFFUSION_RATE_A = 1;
const DIFFUSION_RATE_B = 0.5;
const FEED_RATE = 0.055;
const KILL_RATE = 0.062;

var grid
var next

function setup() {
  createCanvas(WIDTH, HEIGHT);
  pixelDensity(1);
  loadPixels();
  initGrids();
}

function initGrids() {
  grid = [];
  next = [];
  
  for (var x = 0; x < width; x++){
    grid[x] = [];
    next[x] = [];
    for (var y = 0; y < height; y++){
      grid[x][y] = {a: 1, b:0};
      next[x][y] = {a: 0, b:0};
    }
  }
  
  // Sparkle some B
  for (var i = 0; i < width * height * 0.02; i++) {
    grid[floor(random(width))][floor(random(height))].b = 1;
  }
}

function draw() {
  drawPixelsFromGrid();
  calculateNext();
}

function drawPixelsFromGrid() {
  for (var x = 0; x < width; x++){
    for (var y = 0; y < height; y++){
      var pixelIndex = (x + y * width)*4;
      var point = grid[x][y];
      var luminosity = constrain(point.a - point.b, 0, 1)*256;
      pixels[pixelIndex+0] = luminosity;
      pixels[pixelIndex+1] = luminosity;
      pixels[pixelIndex+2] = luminosity;
      pixels[pixelIndex+3] = 255;
    }
  }
  updatePixels();
}

function calculateNext() {
  for (var x = 0; x < width; x++){
    for (var y = 0; y < height; y++){
      var a = grid[x][y].a;
      var b = grid[x][y].b;
      var abb = a * b * b;
      
      var nextA = a + (DIFFUSION_RATE_A * laplacian(x, y, "a")) -
                      (abb) +
                      (FEED_RATE * (1 - a));
      
      var nextB = b + (DIFFUSION_RATE_B * laplacian(x, y, "b")) +
                      abb -
                      ((KILL_RATE + FEED_RATE) * b);
      
      nextA = constrain(nextA, 0, 1);
      nextB = constrain(nextB, 0, 1);
      
      next[x][y].a = nextA;
      next[x][y].b = nextB;
    }
  }
  swapGridAndNext();
}

function swapGridAndNext() {
  var temp = next;
  next = grid;
  grid = temp;
}

// Laplacian code
const CENTER_WEIGHT = -1;
const ADJACENTS_WEIGHT = 0.2;
const DIAGONALS_WEIGHT = 0.05;

function laplacian(x, y, field) {
  return grid[x][y][field]           * CENTER_WEIGHT    +
    safeGetFromGrid(x-1, y  , field) * ADJACENTS_WEIGHT +
    safeGetFromGrid(x+1, y  , field) * ADJACENTS_WEIGHT +
    safeGetFromGrid(x  , y-1, field) * ADJACENTS_WEIGHT +
    safeGetFromGrid(x  , y+1, field) * ADJACENTS_WEIGHT +
    safeGetFromGrid(x+1, y+1, field) * DIAGONALS_WEIGHT +
    safeGetFromGrid(x+1, y-1, field) * DIAGONALS_WEIGHT +
    safeGetFromGrid(x-1, y+1, field) * DIAGONALS_WEIGHT +
    safeGetFromGrid(x-1, y-1, field) * DIAGONALS_WEIGHT;
}

function safeGetFromGrid(x, y, field) {
  var res = 0;
  var xContent = grid[x];
  if(xContent){
    var point = xContent[y];
    if(point){
      res = point[field];
    }
  }
  return res;
}