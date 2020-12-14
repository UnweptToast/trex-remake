var PLAY = 1;
var END = 0;
var gameState = PLAY;
var is_spawning = true;

var checkpointSound, dieSound, jumpSound;

var trex, trex_running, trex_collided;
var ground, invisibleGround, groundImage;

var cloudsGroup, cloudImage, cloud;
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4, obstacle5, obstacle6, obstacle;

var score=0;

var gameOver, restart;
var grounds = []
var i;

var database, highScore;


function preload(){
  trex_running =  loadAnimation("trex1-2.png","trex3-2.png","trex4-2.png");
  trex_collided = loadAnimation("trex_collided.png");
  
  groundImage = loadImage("ground2.png");
  
  cloudImage = loadImage("cloud.png");
  
  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png");
  obstacle6 = loadImage("obstacle6.png");
  
  gameOverImg = loadImage("gameOver.png");
  restartImg = loadImage("restart.png");

  checkpointSound = loadSound("checkPoint.mp3");
  dieSound = loadSound("die.mp3");
  jumpSound = loadSound("jump.mp3");



}

function setup() {
  database = firebase.database();
  createCanvas(600, 200);

  var highScoreRef = database.ref('highscore');
  highScoreRef.on("value", function(data) {
    highScore = data.val();
  })
  
  trex = createSprite(50,180,20,50);
  
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.scale = 0.5;

  ground = createSprite(0,180,400,20);
  ground.addImage("ground",groundImage);
  ground.x = ground.width /2;
  
  gameOver = createSprite(300,80);
  gameOver.addImage(gameOverImg);
  
  restart = createSprite(300,120);
  restart.addImage(restartImg);
  
  gameOver.scale = 0.5;
  restart.scale = 0.5;

  gameOver.visible = false;
  restart.visible = false;
  
  invisibleGround = createSprite(width/2,190,width,10);
  invisibleGround.visible = false;
  
  cloudsGroup = new Group();
  obstaclesGroup = new Group();
  
  score = 0;

  i = ground.x + ground.width/2

}
function draw() {
  if(highScore !== undefined) {
  trex.debug = false
  trex.setCollider("obb", 0, 0, 40, 80, 30)
  camera.position.x = trex.x + 250
  background("white");

  text("Score: " + score, trex.x + 400, 30)

  if(gameState === PLAY) {
    score = score + Math.round(getFrameRate()/60);
    trex.velocityY += 3;
    trex.collide(invisibleGround);
    trex.velocityX = 15;
    invisibleGround.x = trex.x;
    invisibleGround.visible = false;

    if(highScore <= score) {
      changeHighScore(score);
    }

    if(frameCount % 10 === 0) {
      var temp = createSprite(i, 180)
      temp.addImage("ground", groundImage);
      grounds.push(temp);
      i += temp.y + temp.width/2;
    }
  
    if(keyWentDown("space") && trex.y > 150) {
      trex.velocityY = -21
      jumpSound.play();
    }

    if(trex.isTouching(obstaclesGroup)) {
    trex.changeAnimation("collided")
    trex.velocityX = 0;
    is_spawning = false;
    gameState = END;
    dieSound.play();
  }
  }
  else if(gameState === END) {
    trex.velocityX = 0;
    trex.velocityY = 0;

    restart.visible = true;
    gameOver.visible = true;

    restart.x = trex.x + 250;
    gameOver.x = trex.x + 250;

    if(mousePressedOver(restart)) {
      reset();
    } // 285, 105 && 315, 105 && 285, 130 && 315, 130
  }

  text("High score: " + highScore, trex.x - 30, 30)

  createObstacles();
  createClouds();
  drawSprites();
  console.log(highScore);
  if(keyWentDown("UP_ARROW")) {
    highScore = 0
    database.ref('/').set({
      highscore: highScore
    })
  }

  if(score % 500 === 0) {
    checkpointSound.play();
  }

  }
  else {
    textSize(40);
    text("Game will start shortly... ", 30, 100)
  }
}

function createObstacles() {

  var frame;
  frame = 80

  if(frameCount %  frame === 0 && is_spawning) {
    obstacle = createSprite(trex.x + 600 ,160);

    var rand = Math.round(random(1, 6));

    var image = "obstacle" + rand + ".png";
    var imageLoad = loadImage(image);
    obstacle.addImage(imageLoad)
    obstacle.scale = 0.6;

    obstaclesGroup.add(obstacle);
  }
}

function createClouds() {
  var frameCloud = 120;

  if(frameCount %  frameCloud === 0 && is_spawning) {
    cloud = createSprite(trex.x + 600 ,Math.round(random(20, 100)));

    cloud.addImage(cloudImage)
    cloud.scale = random(0.6, 1);
    cloud.depth = trex.depth - 1

    cloudsGroup.add(cloud);
  }
}

function reset() {
  score = 0
  gameState = PLAY;
  trex.x = 50;
  is_spawning = true;
  restart.visible = false;
  gameOver.visible = false;
  trex.changeAnimation("running")
  obstaclesGroup.destroyEach();
}


function changeHighScore(value) {
  database.ref('/').update({
    highscore: value
  })
  highscore = value
}

















/*function draw() {
  camera.position.x = trex.x  + 200
  trex.debug = false;
  trex.setCollider("obb",10,-10,35,70,35);
  background("white");
  text("Score: "+ score, trex.x - 300,20);
  
  if (gameState===PLAY){
    trex.velocityX = 10
    score = score + Math.round(getFrameRate()/60);

    if(highScore<=score){
      highScore = highScore + Math.round(getFrameRate()/60);

    }
  
    if(keyDown("space") && trex.y >= 159) {
      trex.velocityY = -22;
      jumpSound.play();
    }
  
    trex.velocityY = trex.velocityY + 2.2;
  
  
    trex.collide(invisibleGround);
    spawnClouds();
    spawnObstacles();
  
    if(obstaclesGroup.isTouching(trex)){
        gameState = END;
        dieSound.play();
    }
  }
  else if (gameState === END) {
    gameOver.visible = true;
    restart.visible = true;

    gameOver.depth = gameOver.depth + 0.1;
    restart.depth = gameOver.depth;
    
    //set velcity of each game object to 0
    ground.velocityX = 0;
    trex.velocityY = 0;
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);
    
    //change the trex animation
    trex.changeAnimation("collided",trex_collided);
    
    //set lifetime of the game objects so that they are never destroyed
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);

    if(mousePressedOver(restart)) {
      reset();
    }
  }

  if(score % 100 === 0 && score>0){
    checkpointSound.play();
  }
  
  drawSprites();
}

function spawnClouds() {
  //write code here to spawn the clouds
  if (frameCount % 60 === 0) {
    var cloud = createSprite(600,120,40,10);
    cloud.y = Math.round(random(80,120));
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    
     //assign lifetime to the variable
    cloud.lifetime = 200;
    
    //adjust the depth
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //add each cloud to the group
    cloudsGroup.add(cloud);
  }
  
}

function spawnObstacles() {
  if(frameCount % 60 === 0) {
    var obstacle = createSprite(1000,165,10,40);
    //obstacle.debug = true;
    
    //generate random obstacles
    var rand = Math.round(random(1,6));
    switch(rand) {
      case 1: obstacle.addImage(obstacle1);
              break;
      case 2: obstacle.addImage(obstacle2);
              break;
      case 3: obstacle.addImage(obstacle3);
              break;
      case 4: obstacle.addImage(obstacle4);
              break;
      case 5: obstacle.addImage(obstacle5);
              break;
      case 6: obstacle.addImage(obstacle6);
              break;
      default: break;
    }
    
    //assign scale and lifetime to the obstacle           
    obstacle.scale = 0.5;
    obstacle.lifetime = 300;
    //add each obstacle to the group
    obstaclesGroup.add(obstacle);
  }
}

function reset(){
  gameState = PLAY;
  gameOver.visible = false;
  restart.visible = false;
  
  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();
  
  trex.changeAnimation("running",trex_running);
  
  score = 0;
  
}
*/
