let backgroundArt; // To store the generated background

// --- Helper functions from the background sketch (adapted) ---
let randInt = (a, b) => floor(random(a, b));

function createCompo_bg(pg, N_val) {
  let margin = 0;
  let iMin = margin, iMax = N_val - margin, jMin = margin, jMax = N_val - margin;
  let siMax = N_val;
  let sjMax = N_val;
  let rectangles = createComposition_bg(iMin, iMax, jMin, jMax, siMax, sjMax, 1000, N_val);

  let u = pg.width / N_val;
  let isWebGL = pg._renderer.drawingContext instanceof WebGLRenderingContext;
  for (let recta of rectangles) {
    let x = recta.i * u;
    let y = recta.j * u;
    let w = recta.si * u, h = recta.sj * u;
    let col1 = 255, col2 = [0, 0];
    if (random() < 1 / 2) [col1, col2] = [col2, col1];

    pg.beginShape();
    pg.fill(col1);
    if (isWebGL) {
      // Centered for WEBGL
      pg.vertex(x - pg.width / 2, y - pg.height / 2);
    } else {
      pg.vertex(x, y);
    }
    if (random() < 1 / 2) {
      if (isWebGL) {
        pg.vertex(x + w - pg.width / 2, y - pg.height / 2);
        pg.fill(col2);
        pg.vertex(x + w - pg.width / 2, y + h - pg.height / 2);
        pg.vertex(x - pg.width / 2, y + h - pg.height / 2);
      } else {
        pg.vertex(x + w, y);
        pg.fill(col2);
        pg.vertex(x + w, y + h);
        pg.vertex(x, y + h);
      }
    } else {
      if (isWebGL) {
        pg.vertex(x - pg.width / 2, y + h - pg.height / 2);
        pg.fill(col2);
        pg.vertex(x + w - pg.width / 2, y + h - pg.height / 2);
        pg.vertex(x + w - pg.width / 2, y - pg.height / 2);
      } else {
        pg.vertex(x, y + h);
        pg.fill(col2);
        pg.vertex(x + w, y + h);
        pg.vertex(x + w, y);
      }
    }
    pg.endShape(CLOSE);
  }
  dithering_bg(pg); // Apply dithering to the generated pattern
}

function createComposition_bg(iMin, iMax, jMin, jMax, siMax, sjMax, nRects, N_val) {
  let rectangles = [];
  for (let i = 0; i < nRects; i++) {
    let newRecta = generateRectangle_bg(rectangles, iMin, iMax, jMin, jMax, siMax, sjMax, N_val);
    if (
      ((newRecta.si > 1 || newRecta.sj > 1) && random() < 1 / 2) ||
      (newRecta.si > 1 && newRecta.sj > 1)
    ) {
      rectangles.push(newRecta);
    }
  }
  for (let i = iMin; i < iMax; i++) {
    for (let j = jMin; j < jMax; j++) {
      let newRecta = { i: i, j: j, si: 1, sj: 1 };
      let canAdd = true;
      for (let recta of rectangles) {
        if (rectanglesIntersect_bg(newRecta, recta)) {
          canAdd = false;
          break;
        }
      }
      if (canAdd) {
        rectangles.push(newRecta);
      }
    }
  }
  return rectangles;
}

function rectanglesIntersect_bg(recta1, recta2) {
  return (
    ((recta1.i <= recta2.i && recta1.i + recta1.si > recta2.i) ||
      (recta2.i <= recta1.i && recta2.i + recta2.si > recta1.i)) &&
    ((recta1.j <= recta2.j && recta1.j + recta1.sj > recta2.j) ||
      (recta2.j <= recta1.j && recta2.j + recta2.sj > recta1.j))
  );
}

function generateRectangle_bg(rectangles, iMin, iMax, jMin, jMax, siMax, sjMax, N_val) {
  let i = randInt(iMin, iMax);
  let j = randInt(jMin, jMax);
  let si, sj;
  if (rectangles.length == 0) {
    si = min(siMax, iMax - i);
    sj = min(sjMax, jMax - j);
  } else {
    let si1 = biggestPossibleWidth_bg(rectangles, iMax, siMax, i, j, 1, 1, N_val);
    let sj1 = biggestPossibleHeight_bg(rectangles, jMax, sjMax, i, j, si1, 1, N_val);
    let sj2 = biggestPossibleHeight_bg(rectangles, jMax, sjMax, i, j, 1, 1, N_val);
    let si2 = biggestPossibleWidth_bg(rectangles, iMax, siMax, i, j, 1, sj2, N_val);
    if (si1 * sj1 > si2 * sj2) {
      si = si1;
      sj = sj1;
    } else {
      si = si2;
      sj = sj2;
    }
  }
  return { i: i, j: j, si: si, sj: sj };
}

function biggestPossibleWidth_bg(rectangles, iMax, siMax, i, j, si, sj, N_val) {
  let s = si;
  let intersects = false;
  while (!intersects) {
    s++;
    for (let recta of rectangles) {
      if (
        i + s > iMax ||
        s > siMax ||
        rectanglesIntersect_bg({ i: i, j: j, si: s, sj: sj }, recta)
      ) {
        intersects = true;
        break;
      }
    }
  }
  return s - 1;
}

function biggestPossibleHeight_bg(rectangles, jMax, sjMax, i, j, si, sj, N_val) {
  let s = sj;
  let intersects = false;
  while (!intersects) {
    s++;
    for (let recta of rectangles) {
      if (
        j + s > jMax ||
        s > sjMax ||
        rectanglesIntersect_bg({ i: i, j: j, si: si, sj: s }, recta)
      ) {
        intersects = true;
        break;
      }
    }
  }
  return s - 1;
}

function dithering_bg(pg) {
  pg.loadPixels();
  for (let i = 0; i < pg.pixels.length; i += 4) {
      if (random() < 0.02) { // 2% of pixels
          pg.pixels[i] = random(180);     // R
          pg.pixels[i+1] = random(180);   // G
          pg.pixels[i+2] = random(180);   // B
      }
  }
  pg.updatePixels();
}

function getPixel_bg(pg, x, y) {
  return pg.pixels[4 * (round(y) * pg.width + round(x))];
}

function setPixel_bg(pg, x, y, col) {
  let idx = 4 * (round(y) * pg.width + round(x));
  pg.pixels[idx] = col;
  pg.pixels[idx + 1] = col;
  pg.pixels[idx + 2] = col;
  pg.pixels[idx + 3] = 200; // Ensure alpha is opaque
}
// --- End of helper functions from the background sketch ---

function generateBackgroundArt(w = windowWidth, h = windowHeight) {
  let pg = createGraphics(w, h);
  pg.noLoop();
  pg.noStroke();
  pg.background(150);
  pg.blendMode(DIFFERENCE, EXCLUSION);

  let N_bg = random([4, 5, 6, 7]);
  function createDitheredLayer() {
    let layer = createGraphics(w, h);
    layer.background(200);
    createCompo_bg(layer, N_bg);
    dithering_bg(layer);
    return layer;
  }

  let tints = [
    [5, 7, 29],
    [55, 56, 86],
    [191, 105, 150],
    [28, 28, 30],
  ];

  let blendModes = [DIFFERENCE, EXCLUSION, MULTIPLY];
  for (let i = 0; i < tints.length; i++) {
    let layer = createDitheredLayer();
    pg.push();
    pg.blendMode(random(blendModes));
    let tintArr = tints[i].map(c => c + random(-120, 120));
    pg.tint(...tintArr);
    let dx = int(random(-w * 0.3, w * 0.3));
    let dy = int(random(-h * 0.3, h * 0.3));
    let dw = w + int(random(-w * 0.3, w * 0.3));
    let dh = h + int(random(-h * 0.3, h * 0.3));
    pg.image(layer, dx, dy, dw, dh);
    pg.pop();
    layer.remove();
  }

  // Add random translucent rectangles for texture
  for (let i = 0; i < 10; i++) {
    pg.push();
    pg.noStroke();
    pg.fill(random(255), random(255), random(255), random(80, 180));
    let rx = random(pg.width);
    let ry = random(pg.height);
    let rw = random(10, pg.width / 2);
    let rh = random(1, 30);
    pg.rect(rx, ry, rw, rh);
    pg.pop();
  }

  pg.noTint();
  pg.resetMatrix();
  return pg;
}

class Board {
  constructor() {
    // Board initialization logic can go here if needed
  }
}

// p5.js setup function
function setup() {
    pixelDensity(displayDensity()); // or just pixelDensity() for auto
    createCanvas(windowWidth, windowHeight);
    backgroundArt = generateBackgroundArt(width, height);

    
    // Generate a unique background for each tile
    let tileArtSize = 50;
    tileArts = [];
    for (let i = 0; i < tilePositions.length; i++) {
        tileArts.push(generateBackgroundArt(tileArtSize, tileArtSize));
    }

    // Start door animation automatically
    doorAnimPlaying = true;
    doorAnimStartTime = millis();
    doorFrameIndex = 0;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Optionally, regenerate or reposition elementsrep if needed
}

function draw() {
    // Wait for floormap and at least the first door frame to load
    if (!floormapImg || !doorFrames.length || !doorFrames[0]) {
        background(20);
        fill(200);
        textSize(TextSize);
        textAlign(LEFT, TOP);
        text("Loading...", 10, 10);
        return;
    }
    noTint();
    blendMode(BLEND);
    background(20);
    imageMode(CORNER);
    image(backgroundArt, 0, 0, windowWidth, windowHeight);
    image(backgroundArt, 0, 0, windowWidth, windowWidth);
    image(backgroundArt, 5, 4, windowWidth, windowHeight);
    image(backgroundArt, 6, 9, windowWidth, windowHeight);
    image(backgroundArt, 1, 9, windowWidth, windowHeight);
    image(backgroundArt, 10, 0.1, windowWidth, windowHeight);
    image(backgroundArt, 1, 1, windowWidth, windowHeight);
    image(backgroundArt, 7, 8, windowWidth, windowHeight);
    image(backgroundArt, 10, 3, windowWidth, windowHeight);

    // Board boundary calculations
    let boardW = width * 0.75;
    let boardH = height * 0.85;
    let boardX = (width - boardW) / 2;
    let boardY = (height - boardH) / 2;

    // Responsive text and doorframe sizing
    let TextSize = boardW * 0.025;
    let doorFrameSize = min(boardW, boardH) * 0.30;

    // Draw the floormap image with transparency
    if (floormapImg) {
        push();
        imageMode(CORNER);
        let sx = 0;
        let sy = 0;
        let sw = floormapImg.width;
        let sh = floormapImg.height;
        image(floormapImg, boardX, boardY, boardW, boardH, sx, sy, sw, sh);
        pop();
    }

    // Draw the board boundary
    push();
    fill(50, 50, 50, 150);
    stroke(0, 0, 0, 255);
    strokeWeight(boardW * 0.06);
    rect(boardX, boardY, boardW, boardH, 0);
    pop();

    // Draw a text on the upper side of the board frame
    push();
    textFont('monospace'); // Use a terminal-like font
    textAlign(CENTER, TOP);
    textSize(TextSize);
    fill(173, 255, 47); // Radiation green
    noStroke();
    let textStr = "welcome to museum schloss fechenbach";
    let textX = boardX + boardW / 2;
    let textY = boardY - TextSize * 0.55; // Position above the board
    text(textStr, textX, textY);

    // Draw very thin vertical stripes over the text
    let textWidthPx = TextSize * 25; // Width of the text area
    let stripeSpacing = 2.5; // pixels between stripes
    let stripeW = 0.75; // stripe width in pixels
    let stripeH = TextSize * 1.25; // height of the stripes, adjust as needed
    let stripeAlpha = 100; // transparency of stripes

    for (let sx = -textWidthPx / 2; sx < textWidthPx / 2; sx += stripeSpacing) {
        fill(173, 255, 47, stripeAlpha); // same green, semi-transparent
        noStroke();
        rect(textX + sx, textY, stripeW, stripeH);
    }
    pop();

    // --- Door animation drawing ---
    let doorSize = boardH * 0.20;
    let doorX, doorY;

    if (floating && floatPath.length > 1) {
        // Calculate which step we're on and interpolate between positions
        let now = millis();
        let stepElapsed = now - floatStartTime;
        let totalSteps = floatPath.length - 1;
        let rawStep = stepElapsed / floatStepDuration;
        let currentStep = floor(rawStep);
        let t = rawStep - currentStep;

        if (currentStep >= totalSteps) {
            // Stay at the last tile
            currentStep = totalSteps - 1;
            t = 1;
        }

        // Get from/to positions
        let fromIdx = floatPath[currentStep];
        let toIdx = floatPath[currentStep + 1];

        let fromPos, toPos;
        if (fromIdx === -1) {
            // Default position
            fromPos = {
                x: boardX - doorSize * -0.33,
                y: boardY + boardH / 1.64
            };
        } else {
            let pos = tilePositions[fromIdx];
            fromPos = {
                x: boardX + pos.x * boardW,
                y: boardY + pos.y * boardH
            };
        }
        if (toIdx === -1) {
            toPos = {
                x: boardX - doorSize * -0.33,
                y: boardY + boardH / 1.64
            };
        } else {
            let pos = tilePositions[toIdx];
            toPos = {
                x: boardX + pos.x * boardW,
                y: boardY + pos.y * boardH
            };
        }

        // Remove the glitch jitter:
        let glitchX = 0;
        let glitchY = 0;

        // --- Random 15ms freeze logic ---
        let doFreeze = false;
        if (t > 0 && t < 1 && !floatReturning) {
            // 20% chance per frame to trigger a 25ms freeze
            if (glitchFreezeUntil < millis() && random() < 0.25) {
                glitchFreezeUntil = millis() + 15 + random(0, 15);
                doFreeze = true;
            } else if (glitchFreezeUntil > millis()) {
                doFreeze = true;
            }

            if (!doFreeze) {
                lastDoorX = lerp(fromPos.x, toPos.x, t);
                lastDoorY = lerp(fromPos.y, toPos.y, t);
            }
        }

        // Use lastDoorX/Y if freezing, otherwise update as normal
        if (doFreeze && lastDoorX !== undefined && lastDoorY !== undefined) {
            doorX = lastDoorX;
            doorY = lastDoorY;
        } else {
            doorX = lerp(fromPos.x, toPos.x, t);
            doorY = lerp(fromPos.y, toPos.y, t);
        }

        // If finished floating to target, pause, then open URL and regenerate, then float back
        if (!floatReturning && currentStep >= totalSteps - 1 && t >= 1) {
            floating = false;
            bounceSettling = true;
            setTimeout(() => {
                window.open(tileUrls[bounceTargetTile], '_blank');
                // Regenerate background and tile patterns IMMEDIATELY
                backgroundArt = generateBackgroundArt(windowWidth, windowHeight);
                tileArts = [];
                let tileArtSize = 128;
                for (let i = 0; i < tilePositions.length; i++) {
                    tileArts.push(generateBackgroundArt(tileArtSize, tileArtSize));
                }
                // Now start floating back to default position
                floatPath = [bounceTargetTile, -1];
                floatStep = 0;
                floatStartTime = millis();
                floating = true;
                floatReturning = true;
                bounceSettling = false;
            }, floatPauseAtTarget);
        }

        // If finished floating back to default, just reset state (NO regeneration here)
        if (floatReturning && currentStep >= totalSteps - 1 && t >= 1) {
            floating = false;
            floatReturning = false;
            bounceTargetTile = -1;
            bounceCurrentTile = -1;
        }
    } else if (bounceTargetTile >= 0 && !floating && !floatReturning) {
        // After float, stay on the target tile
        let pos = tilePositions[bounceTargetTile];
        doorX = boardX + pos.x * boardW;
        doorY = boardY + pos.y * boardH;
    } else {
        // Default door position
        doorX = boardX - doorSize * -0.33;
        doorY = boardY + boardH / 1.64;
    }

    // --- Door animation update (put this before drawing the doorframe) ---
    if (doorAnimPlaying) {
        let elapsed = millis() - doorAnimStartTime;
        let frame = floor((elapsed / 1000) * doorAnimFPS);
        let loops = floor(frame / doorFrames.length);

        // Blink 3 times after every loop
        if (loops > doorLoopCount) {
            doorLoopCount = loops;
            doorBlinking = true;
            doorBlinkStart = millis();
        }

        // Handle multi-blink
        if (doorBlinking) {
            let blinkElapsed = millis() - doorBlinkStart;
            let blinkPhase = floor(blinkElapsed / doorBlinkDuration);
            if (blinkPhase >= doorBlinkTotal * 2) {
                doorBlinking = false;
            } else {
                doorBlinkCount = blinkPhase;
            }
        }

        frame = frame % doorFrames.length;
        doorFrameIndex = frame;
    }

    // --- Bounce animation logic ---
    if (bouncing) {
        let elapsed = millis() - bounceStartTime;
        let steps = Math.floor(bounceDuration / bounceInterval);
        let step = Math.floor(elapsed / bounceInterval);
        if (step < bounceSequence.length) {
            bounceCurrentTile = bounceSequence[step];
        }
        if (elapsed >= bounceDuration) {
            bounceCurrentTile = bounceTargetTile;
            bouncing = false;
            bounceSettling = true;
            setTimeout(() => {
                bounceSettling = false;
                window.open(tileUrls[bounceTargetTile], '_blank');
                // Reset door to default position
                bounceTargetTile = -1;
                bounceCurrentTile = -1;
                // Regenerate background and tile patterns
                backgroundArt = generateBackgroundArt(windowWidth, windowHeight);
                tileArts = [];
                let tileArtSize = 128;
                for (let i = 0; i < tilePositions.length; i++) {
                    tileArts.push(generateBackgroundArt(tileArtSize, tileArtSize));
                }
            }, 1000);
        }
    }

    // --- Tile and player size (independent from board size) ---
    let tileSize = min(boardW, boardH) * 0.08;

    // Draw each tile at its normalized position
    for (let i = 0; i < tilePositions.length; i++) {
        let pos = tilePositions[i];
        let x = boardX + pos.x * boardW;
        let y = boardY + pos.y * boardH;
        push();
        rectMode(CENTER);

        // Highlight tile if bouncing or settling and this is the current/target tile
        if ((bouncing && i === bounceCurrentTile) || (bounceSettling && i === bounceTargetTile)) {
            stroke(185, 255, 50, 140);
            strokeWeight(tileSize * 0.26);
            fill(185, 255, 50, 160);
            rect(x, y, tileSize * 1.2, tileSize * 1.2, 0);
        }

        // Set stroke for the tile
        stroke(0);
        strokeWeight(tileSize * 0.175);
        rect(x, y, tileSize, tileSize, 6);

        // Draw the generated art as the tile background
        if (tileArts[i]) {
            imageMode(CENTER);
            image(tileArts[i], x, y, tileSize, tileSize);
            noFill();
            rect(x, y, tileSize, tileSize, 0);
        }

        // Draw tile number
        fill(255);
        stroke(0, 0, 0, 250);
        strokeWeight(tileSize * 0.125);
        textAlign(CENTER, CENTER);
        textSize(tileSize / 4);
        pop();
    }

    // --- Drawing the doorframe (always on top) ---
    if (doorFrames.length > 0 && doorFrames[doorFrameIndex]) {
        // Only draw if not in an "invisible" blink phase (odd phases are invisible)
        if (!(doorBlinking && (doorBlinkCount % 2 === 1))) {
            imageMode(CENTER);
            image(doorFrames[doorFrameIndex], doorX, doorY, doorFrameSize, doorFrameSize);
        }
    } else {
        // Draw a placeholder ellipse where the door should be
        fill(255, 0, 0, 150);
        ellipse(doorX, doorY, doorSize, doorSize);
    }
}

// --- Tile URLs (update as needed) ---
const tileUrls = [
    "https://sose25.medienkultur.eu/harmony-distorted/",
    "https://sose25.medienkultur.eu/senses-out-of-sync/",
    "https://sose25.medienkultur.eu/echoes-of-distinction/",
    "https://sose25.medienkultur.eu/what-thread-remains-from-what-we-weave-each-day/",
    "https://sose25.medienkultur.eu/the-egg/",
    "https://sose25.medienkultur.eu/the-sound-of-family/",
    "https://sose25.medienkultur.eu/what-we-dont-post-where-does-it-go/",
    "https://sose25.medienkultur.eu/ive-had-a-dream/",
    "https://sose25.medienkultur.eu/a-full-place-that-is-now-empty/",
    "https://sose25.medienkultur.eu/eye-of-the-beholder/",
    "https://sose25.medienkultur.eu/beneath-the-feet/",
    "https://sose25.medienkultur.eu/dianas-poem/",
    "https://sose25.medienkultur.eu/promise-and-exploit/"
];

// --- Door animation frames from cloud ---
const doorFrameUrls = [];
for (let i = 1; i <= 89; i++) {
  doorFrameUrls.push(
    `https://raw.githubusercontent.com/mobypop/imcpngloop/refs/heads/main/imcloop/Poster_design_loop.0.${i}.png`
  );
}
let doorFrames = [];
let doorFrameIndex = 0;
let doorAnimPlaying = false;
let doorAnimStartTime = 0;
let doorAnimDuration = 1000; // ms
let doorAnimFPS = 20; // frames per second

// --- Door bounce state ---
let bouncing = false;
let bounceSettling = false;
let bounceStartTime = 0;
let bounceDuration = 3000;
let bounceInterval = 100;
let bounceCurrentTile = -1;
let bounceTargetTile = -1;
let tileArts = [];
let bounceSequence = [];

// --- Floating animation state ---
let floating = false;
let floatPath = [];
let floatStep = 0;
let floatStartTime = 0;
let floatFPS = 10; // frames per second for floating animation
let floatStepDuration = 7000 / floatFPS; // ms per step, calculated from FPS
let floatReturning = false;
let floatPauseAtTarget = 1000; // ms to pause on target tile

// --- Mouse click handler ---
function mousePressed() {
    // Ensure we have a valid floormap image
    if (!floormapImg) {
        console.error("Floormap image not loaded yet.");
        return;
    }
    // Check if mouse is within canvas bounds
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        console.warn("Mouse click outside canvas bounds.");
        return;
    }
    // If bouncing, ignore clicks
    if (bouncing) {
        console.log("Bouncing in progress, ignoring click.");
        return;
    }
    // If door frames are not loaded, skip door click check
    if (!doorFrames.length || !doorFrames[0]) {
        console.error("Door frames not loaded yet.");
        return;
    }
    // If the bounce animation has finished and we're on the target tile, ignore clicks on the door
    if (bounceSettling) {
      console.log("Target tile reached, ignoring door click.");
      return;
    }
    // --- Prevent any tile clicks while floating or returning ---
    if (floating || floatReturning) {
        console.log("Doorframe is floating, ignoring all clicks.");
        return;
    }
    // Board boundary calculations (must match draw)
    let boardW = width * 0.75;
    let boardH = height * 0.85;
    let boardX = (width - boardW) / 2;
    let boardY = (height - boardH) / 2;
    let tileSize = 56;

    // Door position (must match draw)
    let doorSize = boardH * 0.20;
    let doorX = boardX - doorSize * -0.33;
    let doorY = boardY + boardH / 1.64;

    // Check if door is clicked
    if (
        doorFrames.length > 0 &&
        doorFrames[0] &&
        dist(mouseX, mouseY, doorX, doorY) < doorSize / 2 &&
        !floating &&
        !bounceSettling
    ) {
        // Start door animation
        doorAnimPlaying = true;
        doorAnimStartTime = millis();
        doorFrameIndex = 0;

        // Start floating animation
        floating = true;
        floatReturning = false;
        floatStartTime = millis();
        floatStep = 0;

        // Build float path: default position -> random tiles -> target tile
        let steps = 6 + floor(random(3, 6));
        let targetIdx = floor(random(tilePositions.length));
        bounceTargetTile = targetIdx;
        floatPath = [];

        // Start from default position (use -1 as a marker)
        floatPath.push(-1);
        let idx = floor(random(tilePositions.length));

        // Track how many times each tile-to-tile pair is used
        let pairCounts = {};
        function pairKey(a, b) {
            return a < b ? `${a}_${b}` : `${b}_${a}`;
        }

        for (let i = 0; i < steps - 1; i++) {
            let dir = random([1, -1]);
            let nextIdx = (idx + dir + tilePositions.length) % tilePositions.length;
            let key = pairKey(idx, nextIdx);
            if (!pairCounts[key]) pairCounts[key] = 0;

            // If this pair has occurred 4 times, pick a different direction
            let attempts = 0;
            while (pairCounts[key] >= 3 && attempts < tilePositions.length) {
                dir = -dir; // Try the other direction
                nextIdx = (idx + dir + tilePositions.length) % tilePositions.length;
                key = pairKey(idx, nextIdx);
                if (!pairCounts[key]) pairCounts[key] = 0;
                attempts++;
            }

            pairCounts[key]++;
            idx = nextIdx;
            floatPath.push(idx);
        }
        floatPath.push(targetIdx); // End at target tile
        return;
    }

    // If not bouncing, check if a tile is clicked
    if (!bouncing) {
        for (let i = 0; i < tilePositions.length; i++) {
            let pos = tilePositions[i];
            let x = boardX + pos.x * boardW;
            let y = boardY + pos.y * boardH;
            if (
                abs(mouseX - x) < tileSize / 2 &&
                abs(mouseY - y) < tileSize / 2
            ) {
                window.open(tileUrls[i], '_blank');
                return;
            }
        }
    }
}

let floormapImg;

function preload() {
    // Load floormap as before
    loadImage('src/floormap.png', img => {
        let pg = createGraphics(img.width, img.height);
        pg.image(img, 0, 0, img.width, img.height);
        pg.loadPixels();
        for (let i = 0; i < pg.pixels.length; i += 1) {
            let r = pg.pixels[i];
            let g = pg.pixels[i + 1];
            let b = pg.pixels[i + 2];
            // Make white transparent as before
            if (r > 250 && g > 250 && b > 250) {
                pg.pixels[i + 2] = 0;
            }
            // Make black (walls) pure white and fully opaque
            else if (r < 30 && g < 20 && b < 30) {
                pg.pixels[i] = 255;
                pg.pixels[i + 1] = 255;
                pg.pixels[i + 2] = 255;
                pg.pixels[i + 3] = 255;
            }
        }
        pg.updatePixels();
        floormapImg = pg.get();
    });

    // Correct way to load all door frames
    doorFrames = new Array(89);
    for (let i = 1; i <= 89; i++) {
        doorFrames[i - 1] = loadImage(
            `https://raw.githubusercontent.com/mobypop/imcpngloop/refs/heads/main/imcloop/Poster_design_loop.0.${i}.png`,
            () => {}, // success
            () => { console.error("Failed to load frame", i); } // error
        );
    }
}

// Example: tilePositions = [{x: 0.12, y: 0.34}, ...]
const tilePositions = [
    {x: 0.15, y: 0.39}, // 1  Harmony Distorted
    {x: 0.43, y: 0.24}, // 2  Senses of Sync
    {x: 0.24, y: 0.41}, // 3  Echoes of Distinction
    {x: 0.72, y: 0.54}, // 4  What thread remains from what we weave each day?
    {x: 0.40, y: 0.43}, // 5  The Egg
    {x: 0.58, y: 0.46}, // 6  The Sound of Familly
    {x: 0.86, y: 0.44}, // 7  What we don't post, where does it go?
    {x: 0.17, y: 0.80}, // 8  I've had a Dream
    {x: 0.36, y: 0.78}, // 9  A full Place that is now empty
    {x: 0.58, y: 0.74}, // 10 The Eye of the Beholder
    // Bottom right group (3 stacked vertically)
    {x: 0.86, y: 0.65}, // 11 Beneath the Feet
    {x: 0.86, y: 0.80}, // 12 Diana's Poem
    {x: 0.76, y: 0.80}  // 13 Promise and Exploit
];

// --- New door blinking state ---
let doorLoopCount = 0;
let doorBlinking = false;
let doorBlinkStart = 0;
let doorBlinkDuration = 103; // ms for each fast blink
let doorBlinkTotal = 4;      // number of blinks
let doorBlinkCount = 0;

// --- Glitch strength (for float movement) ---
let currentGlitchStrength = 8;

// --- Glitch freeze state ---
let glitchFreezeUntil = 0;
let lastDoorX, lastDoorY;