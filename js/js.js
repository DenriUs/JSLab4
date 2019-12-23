// useful to have them as global letiables
let canvas, ctx, w, h;
let mousePos;
let level = 0;

//Arrows on keyboard
let up = false;
let down = false;
let left = false;
let right = false;

let animationRequest;

const seconds = 3;

let pauseMenu;

let gameEnd = false;

let goodBallColor;
let goodBallsCount;
let ballNumber = 0;

//options
let ballsCount;
let speedMultipler;
let ballRadius;
let playerSize;

//Player image
const chaser = new Image();
chaser.src = "images/player.png";

let controlDevice = "";

// an empty array!
let balls = []; 

const player = {
  x: 10,
  y: 40,
  width: 0,
  height: 0,
  moveX: 0,
  moveY: 0,
  booster: 0.5,
  maxSpeed: 10,
  color: 'red'
}

function setOptions() {
  changeBallsCount();
  changeBallsSpeedMultipler();
  changeBallsSize();
  changePlayerSize();
}

function changeBallsCount() {
  ballsCount = Number.parseInt(document.getElementById("ballsCount").value);
}

function changeBallsSpeedMultipler() {
  speedMultipler = Number.parseInt(document.getElementById("ballsSpeed").value);
}

function changeBallsSize() {
  ballRadius = Number.parseInt(document.getElementById("ballsSize").value);
}

function changePlayerSize() {
  playerSize = Number.parseInt(document.getElementById("playerSize").value);
}

function printReady(seconds) {
  ctx.clearRect(0, 0, w, h);

  ctx.font = "bold 40px Candara";
  ctx.fillStyle = "#2CCCC3";

  ctx.fillText("Ready? " + seconds, 515, h/2);
  ctx.fillText("Chase balls with color: " + goodBallColor, 340, h/2 + 40);
}

function timer(seconds) {
  for (let i = 0; i < seconds; i++) {
    setTimeout(function() { 
      printReady(seconds - i);
    }, i * 1000);
  }
}

function setControlDevice() {
  controlDevice = document.querySelector('input[name="radio"]:checked').value;
}

function options() {
  closeMenu();
  document.getElementById("buttons").style.display = 'none';
  document.getElementById("options").style.display = 'flex';
}

function showMenu() {
  closeWelcome();
  document.getElementById("menu").style.display = 'flex';
}

function closeMenu() {
  document.getElementById("menu").style.display = 'none';
}

function showWelcome() {
  closeMenu();
  document.getElementById("welcome").style.display = 'flex';
}

function closeWelcome() {
  document.getElementById("welcome").style.display = 'none';
}

function init() {
  // called AFTER the page has been loaded
  canvas = document.querySelector("#myCanvas");
  canvas.style.display = 'block';

  document.getElementById("bg").style.display = 'none';
  document.getElementById("buttons").style.display = 'none';
  document.getElementById("options").style.display = 'none';

  player.x = 10;
  player.y = 40;
  player.moveX = 0;
  player.moveY = 0;

  // often useful
  w = canvas.width;
  h = canvas.height;
  
  // important, we will draw with this object
  ctx = canvas.getContext('2d');

  if (animationRequest) {
    cancelAnimationFrame(animationRequest);
    gameEnd = false;
  }
  else {
    setOptions();
  }

  player.width = playerSize;
  player.height = playerSize;
  
  // create 10 balls
  balls = createBalls(ballsCount);

  goodBallColor = balls[ballNumber].color;

  ballsCount++;
  level++;
  
  // add a mousemove event listener to the canvas
  canvas.addEventListener('mousemove', mouseMoved);
  
  // ready to go !
  timer(seconds);
  
  setTimeout(() => {
    mainLoop();
  }, 3000);
};

function mouseMoved(evt) {
  mousePos = getMousePos(canvas, evt);
}

function getMousePos(canvas, evt) {
  // necessary work in the canvas coordinate system
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function checkKeyStatus() {
	if (up) {
		if (player.moveY > -player.maxSpeed) {
			player.moveY -= player.booster;	
    } 
    else {
			player.moveY = -player.maxSpeed;
		}
  } 
  else {
		if (player.moveY < 0) {
      player.moveY += player.booster;
      
      if (player.moveY > 0) {
        player.moveY = 0;	
      }
		}
  }
  
	if (down) {
		if (player.moveY < player.maxSpeed) {
			player.moveY += player.booster;	
    } 
    else {
			player.moveY = player.maxSpeed;
		}
  } 
  else {
		if (player.moveY > 0) {
      player.moveY -= player.booster;
      
      if(player.moveY < 0) {
        player.moveY = 0;
      }
		}
  }
  
	if (left) {
		if (player.moveX > -player.maxSpeed) {
			player.moveX -= player.booster;	
    } 
    else {
			player.moveX = -player.maxSpeed;
		}
  } 
  else {
		if (player.moveX < 0) {
      player.moveX += player.booster;
      
      if (player.moveX > 0) {
        player.moveX = 0;
      }
		}
  }
  
	if (right) {
		if (player.moveX < player.maxSpeed) {
			player.moveX += player.booster;	
    } 
    else {
			player.moveX = player.maxSpeed;
		}
  } 
  else {
		if (player.moveX > 0) {
      player.moveX -= player.booster;
      
      if (player.moveX < 0) {
        player.moveX = 0;
      }
		}
  }
}

function movePlayerWithMouse() {
  if(mousePos !== undefined) {
    player.x = mousePos.x;
    player.y = mousePos.y;
  }
}

function movePlayerWithKeyboard() {
  player.x += player.moveX;
  player.y += player.moveY;
}

function permanentMove(e) {
  switch(e.key) {
    case 'ArrowLeft':
      left = true;
      break;
    case 'ArrowRight':
      right = true;
      break;
    case 'ArrowUp':
      up = true;
      break;
    case 'ArrowDown':
      down = true;
      break; 
  }
}

function stopMove(e) {
  switch(e.key) {
    case 'ArrowLeft':
      left = false;
      break;
    case 'ArrowRight':
      right = false;
      break;
    case 'ArrowUp':
      up = false;
      break;
    case 'ArrowDown':
      down = false;
      break; 
  }
}

function mainLoop() {
  // 1 - clear the canvas
  ctx.clearRect(0, 0, w, h);
  
  // draw the ball and the player
  drawFilledRectangle(player);
  drawAllBalls(balls);
  drawNumberOfBallsAlive(balls);

  // animate the ball that is bouncing all over the walls
  moveAllBalls(balls);

  setControlDevice();

  if (controlDevice === "mouse") {
    movePlayerWithMouse();
  }
  else if (controlDevice === "keyboard") {
    onkeydown = permanentMove;
    onkeyup = stopMove;

    checkKeyStatus();
    movePlayerWithKeyboard();
  }

  if (gameEnd === false) {
    showPauseMenuButtons();
  }

  testCollisionPlayerWithWalls();
  
  // ask for a new animation frame
  if (gameEnd === false) {
    animationRequest = requestAnimationFrame(mainLoop);
  }
}

function showPauseMenuButtons() {
  pauseMenu = document.getElementById("pauseMenu");
  pauseMenu.style.display = 'flex';

  document.getElementById("pause").style.display = 'block';
  document.getElementById("resume").style.display = 'none';
}

function hidePauseMenuButtons() {
  pauseMenu.style.display = 'none';

  document.getElementById("pause").style.display = 'none';
  document.getElementById("resume").style.display = 'none';
}

function pauseGame() {
  cancelAnimationFrame(animationRequest);

  document.getElementById("pause").style.display = 'none';
  document.getElementById("resume").style.display = 'block';
}

function resumeGame() {
  animationRequest = requestAnimationFrame(mainLoop);

  document.getElementById("pause").style.display = 'block';
  document.getElementById("resume").style.display = 'none';
}

// Collisions between rectangle and circle
function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
  let testX = cx;
  let testY = cy;
  if (testX < x0) testX = x0;
  if (testX > (x0 + w0)) testX = (x0 + w0);
  if (testY < y0) testY = y0;
  if (testY > (y0 + h0)) testY = (y0 + h0);
  return (((cx - testX) * (cx - testX) + (cy - testY) * (cy - testY)) <  r * r);
}

function createBalls(n) {
  // empty array
  const ballArray = [];
  
  // create n balls
  for(let i = 0; i < n; i++) {
    const b = {
      x: w/2,
      y: h/2,
      radius: ballRadius, // between 5 and 35
      speedX: -5 + 10 * Math.random(), // between -5 and + 5
      speedY: -5 + 10 * Math.random(), // between -5 and + 5
      color: getARandomColor(),
    };

    // add ball b to the array
     ballArray.push(b);
  }
  // returns the array full of randomly created balls
  return ballArray;
}

function getARandomColor() {
  const colors = ['red', 'blue', 'cyan', 'purple', 'pink', 'green', 'yellow', 'orange'];
  // a value between 0 and color.length-1
  // Math.round = rounded value
  // Math.random() a value between 0 and 1
  let colorIndex = Math.round((colors.length - 1) * Math.random()); 
  let c = colors[colorIndex];
  
  // return the random color
  return c;
}

function calculateGoodballsCount() {
  let counter = 0;

  for (let i = 0; i < balls.length; i++) {
    if (balls[i].color === goodBallColor) {
      counter++;
    }
  }
  
  return counter;
}

function drawNumberOfBallsAlive(balls) {
  ctx.save();
  ctx.font = "bold 40px Candara";
  ctx.fillStyle = "#2CCCC3";

  goodBallsCount = calculateGoodballsCount();
  console.log(goodBallColor, goodBallsCount);
  
  if (goodBallsCount === 0) {
    ctx.fillText("YOU WIN!", 515, h/2);

    gameEnd = true;

    hidePauseMenuButtons();
    showEndGameButtons();
  } 
  else {
    ctx.fillText("Balls left: " + goodBallsCount, 20, 35);
    ctx.fillText("Level: " + level, 1050, 35);
  }

  ctx.restore();
}

function drawAllBalls(ballArray) {
  ballArray.forEach(function(b) {
    drawFilledCircle(b);
  });
}

function moveAllBalls(ballArray) {
  // iterate on all balls in array
  ballArray.forEach(function(b, index) {
    // b is the current ball in the array
    b.x += b.speedX * speedMultipler;
    b.y += b.speedY * speedMultipler;

    testCollisionBallWithWalls(b); 
    testCollisionWithPlayer(b, index);
  });
}

function testCollisionWithPlayer(b, index) {
  if(circRectsOverlap(player.x, player.y,
                     player.width, player.height,
                     b.x, b.y, b.radius)) {
    // we remove the element located at index
    // from the balls array
    // splice: first parameter = starting index
    // second parameter = number of elements to remove
    if (balls[index].color !== goodBallColor) {
      loseGame();
    }

    balls.splice(index, 1);
  }
}

function loseGame() {
  canvas.style.display = 'none';
  
  gameEnd = true;

  document.getElementById("loseText").style.display = 'flex';

  hidePauseMenuButtons();
  showEndGameButtons();

  document.getElementById("reload").style.display = 'none';
} 


function testCollisionBallWithWalls(b) {
  // COLLISION WITH VERTICAL WALLS ?
  if((b.x + b.radius) > w) {
    // the ball hit the right wall
    // change horizontal direction
    b.speedX = -b.speedX;
    
    // put the ball at the collision point
    b.x = w - b.radius;
  } else if((b.x - b.radius) < 0) {
    // the ball hit the left wall
    // change horizontal direction
    b.speedX = -b.speedX;
    
    // put the ball at the collision point
    b.x = b.radius;
  }
 
  // COLLISIONS WTH HORIZONTAL WALLS ?
  // Not in the else as the ball can touch both
  // vertical and horizontal walls in corners
  if((b.y + b.radius) > h) {
    // the ball hit the right wall
    // change horizontal direction
    b.speedY = -b.speedY;
    
    // put the ball at the collision point
    b.y = h - b.radius;
  } else if((b.y -b.radius) < 0) {
    // the ball hit the left wall
    // change horizontal direction
    b.speedY = -b.speedY;
    
    // put the ball at the collision point
    b.Y = b.radius;
  }  
}

function testCollisionPlayerWithWalls() {
  if (player.x + player.width > w) {
		player.x = canvas.width - player.width;
  }

  if (player.x - 1 < 0) {
    player.x = 1;
	}
  
	if (player.y + player.height > h) {
		player.y = canvas.height - player.height;
  }

  if(player.y - 1 < 0){
		player.y = 1;
	}
}

function drawFilledRectangle(r) {
  // GOOD practice: save the context, use 2D trasnformations
  ctx.save();

  // translate the coordinate system, draw relative to it
  ctx.translate(r.x, r.y);
  
  ctx.fillStyle = "blueviolet";
  // (0, 0) is the top left corner of the monster.
  ctx.fillRect(0, 0, r.width, r.height);
  ctx.drawImage(chaser, 0, 0, playerSize, playerSize);
  
  // GOOD practice: restore the context
  ctx.restore();
}

function drawFilledCircle(c) {
  // GOOD practice: save the context, use 2D trasnformations
  ctx.save();
  
  // translate the coordinate system, draw relative to it
  ctx.translate(c.x, c.y);
  
  ctx.fillStyle = c.color;
  // (0, 0) is the top left corner
  ctx.beginPath();
  ctx.arc(0, 0, c.radius, 0, 2 * Math.PI);
  ctx.fill();
 
  // GOOD practice: restore the context
  ctx.restore();
}

function relaodGame() {
  init();
}

function showEndGameButtons() {
  document.getElementById("buttons").style.display = 'flex';
}

function reloadPage() {
  document.location.reload(true);
}