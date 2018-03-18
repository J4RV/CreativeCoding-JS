// Idea from https://www.youtube.com/watch?v=BV9ny785UNc

const WIDTH = 512;
const HEIGHT = 512;
const FRAMES_TO_CALCULATE = 60 * 30;

const DIFFUSION_RATE_A = 1;
const DIFFUSION_RATE_B = 0.5;

const CORAL_RATES =   { feed: 0.055,  kill: 0.062  };
const MITOSIS_RATES = { feed: 0.0367, kill: 0.0649 };
const CUSTOM_RATES =  { 
                        feed: 0.036,
                        kill: 0.058
                      };
const SELECTED_RATES = CORAL_RATES;

const FEED = SELECTED_RATES.feed;
const KILL = SELECTED_RATES.kill;
const FEED_PLUS_KILL = FEED + KILL

const A = 0;
const B = 1;

var grid;
var next;
var frame = 0;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  pixelDensity(1);
  loadPixels();
  initAlphaChannel();
  initGrids();
}

function initAlphaChannel() {
  for (var x = 3; x < width*4; x+=4){
    for (var y = 3; y < height*4; y+=4){
      var pixelIndex = (x + y * width);
      pixels[pixelIndex] = 255;
    }
  }
}

function initGrids() {
  grid = [];
  next = [];
  
  for (var x = 0; x < width; x++){
    grid[x] = [];
    next[x] = [];
    for (var y = 0; y < height; y++){
      grid[x][y] = [1, 0];
      next[x][y] = [0, 0];
    }
  }
  
  // Sparkle some more B
  for (var i = 0; i < width * height * 0.02; i++) {
    grid[floor(random(width))][floor(random(height))][B] = 1;
  }
}

function draw() {
  updateGrids();
  if(frame++ > FRAMES_TO_CALCULATE) {
    noLoop();
  }
}

function updateGrids() {
  // don't consider corners to prevent null pointers in laplacian
  // we could detect if a pixel is outside the image and consider its A and B to be zero, but this is faster
  for (var x = 1; x < width - 1; x++){
    for (var y = 1; y < height - 1; y++){
      var a = grid[x][y][A];
      var b = grid[x][y][B];
      var abb = a * b * b;
      
      // --- Draw pixels
      var pixelIndex = (x + y * width) * 4;      
      var luminosity = 
      (a > 0.5) ? 10 : 256; // pixelated
      //a * 256;        // smooth
      
      pixels[pixelIndex+0] = luminosity; // R
      pixels[pixelIndex+1] = luminosity; // G
      pixels[pixelIndex+2] = luminosity; // B
      
      // --- Calculate next state
      
      next[x][y][A] = a + (DIFFUSION_RATE_A * laplacian(x, y, A)) -
                      (abb) +
                      (FEED * (1 - a));
      
      next[x][y][B] = b + (DIFFUSION_RATE_B * laplacian(x, y, B)) +
                      (abb) -
                      (FEED_PLUS_KILL * b);
      
    }
  }
  swapGridAndNext();
  updatePixels();
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
  return grid[x-1][y-1][field] * DIAGONALS_WEIGHT +
         grid[x-1][y  ][field] * ADJACENTS_WEIGHT +
         grid[x-1][y+1][field] * DIAGONALS_WEIGHT +
         grid[x  ][y-1][field] * ADJACENTS_WEIGHT +
         grid[x]  [y]  [field] * CENTER_WEIGHT    +
         grid[x  ][y+1][field] * ADJACENTS_WEIGHT +
         grid[x+1][y-1][field] * DIAGONALS_WEIGHT +
         grid[x+1][y  ][field] * ADJACENTS_WEIGHT +
         grid[x+1][y+1][field] * DIAGONALS_WEIGHT;
}
