class Player {
  frameY = { down: 11, left: 59, up: 107, right: 155 };
  frameX = { 1: 8, 2: 56, 3: 104, 4: 152 };
  currentFrame = 1;
  movementTime = 0;
  direction = 'down';
  coordX = 72;
  coordY = 168;
  characterCoords = {};
  characterCoordsList = [];
  directionFlag = { up: true, down: true, right: true, left: true };

  constructor() {
    for (let i = 0; i < gGameEngine.images.length; i++) {
      if (gGameEngine.images[i].alt == 'mainPlayer') {
        gGameEngine.mainPlayerImg = gGameEngine.images[i];
      }
    }
  }

  drawCharacter() {
    let movingFlag = false;
    this.characterCoords.top = this.coordY;
    this.characterCoords.bottom = this.coordY + gGameEngine.tileSize;
    this.characterCoords.left = this.coordX;
    this.characterCoords.right = this.coordX + gGameEngine.tileSize;

    //collision detection happens only when player is moving
    if (gInputEngine.actions['up'] == true || gInputEngine.actions['down'] == true ||
      gInputEngine.actions['right'] == true || gInputEngine.actions['left'] == true) {

      movingFlag = true;

      //collision with other characters
      this.characterCollision();

      //collision detection with collision tiles
      if (!gGameEngine.collisionHandler(gGameEngine.collision, this, 2)) {
        this.directionFlag.up = true;
        this.directionFlag.down = true;
        this.directionFlag.left = true;
        this.directionFlag.right = true;
      }
    }

    if (gInputEngine.actions['up'] == true) {
      this.direction = 'up';
      if (this.directionFlag.up == true) {
        this.coordY -= 2;
      }
    }

    else if (gInputEngine.actions['down'] == true) {
      this.direction = 'down';
      if (this.directionFlag.down == true) {
        this.coordY += 2;
      }
    }

    else if (gInputEngine.actions['left'] == true) {
      this.direction = 'left';
      if (this.directionFlag.left == true) {
        this.coordX -= 2;
      }
    }

    else if (gInputEngine.actions['right'] == true) {
      this.direction = 'right';
      if (this.directionFlag.right == true) {
        this.coordX += 2;
      }
    }

    //animation when moving
    if (movingFlag == true) {
      this.movementTime++;

      if (this.movementTime >= 6) {
        this.currentFrame = (this.currentFrame%4) + 1;
        this.movementTime = 0;
      }
    }

    gGameEngine.ctx.beginPath();

    gGameEngine.ctx.drawImage(
      gGameEngine.mainPlayerImg,
      this.frameX[this.currentFrame],
      this.frameY[this.direction],
      32,
      32,
      this.coordX,
      this.coordY,
      32,
      32
    );

    gGameEngine.ctx.closePath();
  }

  characterCollision() {
    for (let i = 0; i < gGameEngine.allCharacters.length; i++) {
      const name = gGameEngine.allCharacters[i];
      const character = gGameEngine.characterCollisions[name];
      gGameEngine.collisionHandler([character], this, 2);
    }
  }
}
