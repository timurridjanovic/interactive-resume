class GameEngine {
  tileSize = 32;
  #tilesX = 50;
  #tilesY = 50;
  #timeAverage = [];
  #time = 0;
  #fps = 0;
  #timePerFrame = 0;
  #canvas;
  #canvasWidth = 0;
  #canvasHeight = 0;
  ctx;
  #osCanvas;
  #osCtx;
  #progressBarPercent = 0;
  #tilesDrawn = false;
  #mainPlayerImg;
  characterImgs = [];
  allCharacters = [];
  characterCollisions = {};
  #tilesImgs = {};
  images = [];
  #mapData = {};
  collision = [];
  talkedToAlice = false;
  #menu = true;
  mainPlayer;
  characterOne;
  characterTwo;
  characterThree;
  characterFour;
  characterFive;
  characterSix;
  characterSeven;
  #mainSoundTrack;
  #requestID;
  #sorted;
  #loadManifest = [
    {
      name: "mainPlayer",
      src: "img/mainPlayer.png"
    },
    {
      name: "tile_carpet",
      src: "img/tile_carpet.png"
    },
    {
      name: "tile_wall",
      src: "img/tile_wall.png"
    },
    {
      name: "tile_wood",
      src: "img/tile_wood.png"
    },
    {
      name: "carpetone",
      src: "img/carpetone.png"
    },
    {
      name: "chest",
      src: "img/chest.png"
    },
    {
      name: "cupboard",
      src: "img/cupboard.png"
    },
    {
      name: "desk",
      src: "img/desk.png"
    },
    {
      name: "pot",
      src: "img/pot.png"
    },
    {
      name: "character_one",
      src: "img/character_one.png"
    },
    {
      name: "character_two",
      src: "img/character_two.png"
    },
    {
      name: "character_three",
      src: "img/character_one.png"
    },
    {
      name: "character_four",
      src: "img/character_two.png"
    },
    {
      name: "character_five",
      src: "img/character_two.png"
    },
    {
      name: "character_six",
      src: "img/character_one.png"
    },
    {
      name: "character_seven",
      src: "img/character_one.png"
    }
  ];

  constructor() {
    this.#canvas = document.getElementById('mainCanvas');
    this.#canvasWidth = this.#canvas.width;
    this.#canvasHeight = this.#canvas.height;
    this.ctx = this.#canvas.getContext('2d');
  }

  async load() {
    try {
      const response = await fetch('map/map.json');
      const json = await response.json();
      console.log('MAP RESPONSE: ', json)
      this.#mapData = json;
      this.#preloadImages();
      gInputEngine.setup();
      this.mainPlayer = new Player();
      this.characterOne = new Character(576, 224, 'character_one', 'up', [704, 64]);
      this.characterTwo = new Character(850, 200, 'character_two', 'down', [608, 288]);
      this.characterThree = new Character(192, 148, 'character_three', 'up', [192, 148]);
      this.characterFour = new Character(320, 148, 'character_four', 'up', [320, 148]);
      this.characterFive = new Character(414, 244, 'character_five', 'up', [414, 244]);
      this.characterSix = new Character(182, 748, 'character_six', 'right', [400, 748]);
      this.characterSeven = new Character(1370, 1194, 'character_seven', 'right', [256, 1416]);

      //storing the imageID and image source into tilesImgs (for drawTiles() reference)
      for (var i = 0; i < this.#mapData["tilesets"].length; i++) {
        var imageID = this.#mapData["tilesets"][i]["firstgid"];
        var imageName = this.#mapData["tilesets"][i]["name"];

        //going through images array (loaded images) and storing imageID and image source into tilesImgs
        for (var j = 0; j < this.images.length; j++) {
          if (this.images[j].alt == imageName) {
            this.#tilesImgs[imageID] = this.images[j];
          }
        }
      }

      //creating non visible canvas to copy from (caching)
      this.#osCanvas = document.createElement("canvas");
      this.#osCanvas.width = this.#tilesX * this.tileSize;
      this.#osCanvas.height = this.#tilesY * this.tileSize;
      this.#osCtx = this.#osCanvas.getContext('2d');
    } catch (err) {
      throw new Error(`Impossible to load map: ${err}`);
    }
  }


  #preloadImages() {
    let loadedItems = 0;

    //draw black background
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.#canvasWidth, this.#canvasHeight);

    for (var i = 0; i < this.#loadManifest.length; i++) {
      this.images[i] = new Image();
      this.images[i].onload = () => {
        loadedItems++;
        this.#progressBar(loadedItems);
      };

      this.images[i].src = this.#loadManifest[i]['src'];
      this.images[i].alt = this.#loadManifest[i]['name'];
    }
  }

  #progressBar(i) {
    let percentIndex = this.#progressBarPercent;
    this.#progressBarPercent = Math.floor((i / this.#loadManifest.length) * 100);
    const percentToComplete = this.#progressBarPercent;

    for (percentIndex; percentIndex <= this.#progressBarPercent; percentIndex++) {
      this.ctx.fillStyle = 'green';
      this.ctx.strokeRect(1, this.#canvasHeight / 2 - 25, this.#canvasWidth - 2, 50);
      this.ctx.fillRect(2, this.#canvasHeight / 2 - 25 + 1, this.#canvasWidth * (percentIndex / 100) - 3, 50 - 2);
    }
    if (percentIndex >= 100) {
      gInputEngine.addListener('enter', this.#exitMenu.bind(this));
      this.#drawTiles();
      this.#gameLoop();
    }
  }

  #startMenu() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.#canvasWidth, this.#canvasHeight);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '40px sans-serif';
    this.ctx.fillText("Press Enter to Play", this.#canvasWidth / 4 + 10, this.#canvasHeight / 2 - 10);
  }

  #exitMenu() {
    this.#menu = false;
    gInputEngine.removeListeners();
    //loading audio
    this.#mainSoundTrack = new SoundManager();
    this.#mainSoundTrack.loadAsync('music/honeybee.mp3', () => {
      //var volume = 1.0;
      this.#mainSoundTrack.playSound(this.#mainSoundTrack.clips['music/honeybee.mp3'].s.path, {
        looping: true
      });
    });

    gInputEngine.addListener('backspace', this.#soundToggle.bind(this));
    gInputEngine.addListener('F1', this.#restart.bind(this));
  }

  #restart() {
    window.location.reload()
  }

  #gameLoop() {
    if (this.#menu === true) {
      this.#drawTilesFromCache();
      this.#startMenu();
    } else {
      // translate context
      this.ctx.save();
      this.#translateContext();

      // drawing tiles
      this.#drawTilesFromCache();

      // drawing player and character sorted by Y axis
      const sorted = this.#sortByYAxis();

      //loop drawing characters by sorted Y axis
      for (var i = 0; i < sorted.length; i++) {
        sorted[i]['name'].drawCharacter();
      }

      //drawing dialogue boxes for characters
      for (var i = 0; i < sorted.length; i++) {
        if (sorted[i]['name'] != this.mainPlayer) {
          if (sorted[i]['name'].dialogueBox == true) {
            sorted[i]['name'].drawDialogueBox();
          }
        }
      }

      // restoring context
      this.ctx.restore();

      //calculating frames per second
      this.#framesPerSecond();

      //drawing minimap
      this.#miniMap();
    }

    this.#requestID = requestAnimationFrame(this.#gameLoop.bind(this));
  }

  #translateContext() {
    const minPointX = this.#canvasWidth / 2;
    const minPointY = this.#canvasHeight / 2;

    const maxPointX = this.tileSize * this.#tilesX - this.#canvasWidth / 2;
    const maxPointY = this.tileSize * this.#tilesY - this.#canvasHeight / 2;


    if (this.mainPlayer.coordX >= minPointX && this.mainPlayer.coordX <= maxPointX) {
      this.ctx.translate(-this.mainPlayer.coordX + minPointX, 0);

    }

    if (this.mainPlayer.coordX > maxPointX) {
      this.ctx.translate(-maxPointX + minPointX, 0);
    }

    if (this.mainPlayer.coordY >= minPointY && this.mainPlayer.coordY <= maxPointY) {
      this.ctx.translate(0, -this.mainPlayer.coordY + minPointY);
    }

    if (this.mainPlayer.coordY > maxPointY) {
      this.ctx.translate(0, -maxPointY + minPointY);
    }
  }

  #framesPerSecond() {
    const time = new Date();

    if (this.#timePerFrame != 0) {
      this.#timePerFrame = time - this.#timePerFrame;
    }

    this.#timeAverage.push(this.#timePerFrame);

    this.#timePerFrame = new Date();


    if (this.#timeAverage.length >= 10) {
      let result = 0;
      for (let i = 0; i < 10; i++) {
        result += this.#timeAverage[i]
      }

      result = result / this.#timeAverage.length;
      this.#fps = Math.round(1000 / result);
      this.#timeAverage = [];
    }
    this.ctx.font = '10px sans-serif';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(this.#fps, 0, 10);
  }

  #drawTilesFromCache() {
    this.ctx.drawImage(this.#osCanvas, 0, 0);
  }

  #drawTiles() {
    //for loop for the layers of tiles
    console.log('DRAWING TILES')
    for (var layer = 0; layer < this.#mapData["layers"].length; layer++) {
      //for loop for the y axis tiles
      for (var i = 0; i < this.#tilesY; i++) {
        //for loop for the x axis tiles
        for (var j = 0; j < this.#tilesX; j++) {
          var tileNumber = i * this.#tilesX + j;
          const MapX = j * this.tileSize;
          const MapY = i * this.tileSize;
          var tileID = this.#mapData["layers"][layer]['data'][tileNumber];
          var image = this.#tilesImgs[tileID];

          //creating coordinates for tile object
          const tileCoords = {};
          tileCoords.top = MapY;
          tileCoords.bottom = MapY + this.tileSize;
          tileCoords.left = MapX;
          tileCoords.right = MapX + this.tileSize;

          //if tileID == 0, there is no tile...
          if (tileID != 0) {
            //collision detection
            if (this.#mapData.layers[layer].properties.collision == 'true' && this.#tilesDrawn == false) {
              this.collision.push(tileCoords);
            }
            //drawing tiles
            this.#osCtx.beginPath();
            this.#osCtx.drawImage(image, MapX, MapY);
            this.#osCtx.closePath();
          }
        }
      }
    }
    this.#tilesDrawn = true;
  }

  isTileOnCanvas(tileCoords) {
    const offset = this.translatedContext(0, 0);
    const offsetX = offset[0];
    const offsetY = offset[1];
    let distanceX = 0;
    let distanceY = 0;

    if (offsetX > 0 && offsetX < 800)
      distanceX = this.#canvasWidth / 2 + this.tileSize;
    else
      distanceX = this.#canvasWidth;

    if (offsetY > 0 && offsetY < 1200)
      distanceY = this.#canvasHeight / 2 + this.tileSize;
    else
      distanceY = this.#canvasHeight;

    if (tileCoords.left >= this.mainPlayer.coordX - distanceX &&
      tileCoords.right <= this.mainPlayer.coordX + distanceX) {

      if (tileCoords.top >= this.mainPlayer.coordY - distanceY &&
        tileCoords.bottom <= this.mainPlayer.coordY + distanceY) {
        return true;
      }
    }

    return false;
  }

  collisionHandler(collisionTiles, character, increment) {
    character.movingFlag = false;
    for (var i = 0; i < collisionTiles.length; i++) {
      var tile = collisionTiles[i];
      var gap = 2;
      var upGap = 12;
      if (tile.bottom > character.characterCoords.top + upGap && tile.top <
        character.characterCoords.bottom) {
        if (tile.left < character.characterCoords.right && tile.right > character.characterCoords.left) {
          //collision up
          if (character.characterCoords.top + upGap > tile.top && character.direction == 'up') {
            character.directionFlag.up = false;
            character.directionFlag.down = true;
            character.directionFlag.right = true;
            character.directionFlag.left = true;
            character.coordY += increment;
          }
          //collision down
          if (character.characterCoords.bottom < tile.bottom && character.direction == 'down') {
            character.directionFlag.down = false;
            character.directionFlag.up = true;
            character.directionFlag.right = true;
            character.directionFlag.left = true;
            character.coordY -= increment;
          }
          //collision right
          if (character.characterCoords.right < tile.right + gap && character.direction == 'right') {
            character.directionFlag.right = false;
            character.directionFlag.up = true;
            character.directionFlag.down = true;
            character.directionFlag.left = true;
            character.coordX -= increment;
          }
          //collision left
          if (character.characterCoords.left > tile.left && character.direction == 'left') {
            character.directionFlag.left = false;
            character.directionFlag.right = true;
            character.directionFlag.up = true;
            character.directionFlag.down = true;
            character.coordX += increment;
          }
        }
      }
    }
  }

  intersectRect(collisionTiles, character) {
    for (var i = 0; i < collisionTiles.length; i++) {
      const tile = collisionTiles[i];
      const upGap = 12;

      if (tile.bottom > character.characterCoords.top + upGap && tile.top < character.characterCoords.bottom) {
        if (tile.left < character.characterCoords.right && tile.right > character.characterCoords.left) {
          return true;
        }
      }
    }
    return false;
  }

  #sortByYAxis() {
    this.#sorted = [];
    const mainPlayer = this.mainPlayer;
    const characterOne = this.characterOne;
    const characterTwo = this.characterTwo;
    const characterThree = this.characterThree;
    const characterFour = this.characterFour;
    const characterFive = this.characterFive;
    const characterSix = this.characterSix;
    const characterSeven = this.characterSeven;
    this.#sorted.push({
      'name': mainPlayer,
      'coordY': mainPlayer.coordY
    });
    this.#sorted.push({
      'name': characterOne,
      'coordY': characterOne.coordY
    });
    this.#sorted.push({
      'name': characterTwo,
      'coordY': characterTwo.coordY
    });
    this.#sorted.push({
      'name': characterThree,
      'coordY': characterThree.coordY
    });
    this.#sorted.push({
      'name': characterFour,
      'coordY': characterFour.coordY
    });
    this.#sorted.push({
      'name': characterFive,
      'coordY': characterFive.coordY
    });
    this.#sorted.push({
      'name': characterSix,
      'coordY': characterSix.coordY
    });
    this.#sorted.push({
      'name': characterSeven,
      'coordY': characterSeven.coordY
    });

    this.#sorted.sort((obj1, obj2) => {
      return obj1.coordY - obj2.coordY;
    });

    return this.#sorted;
  }

  #miniMap() {
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(225, 225, 225, 0.6)';
    this.ctx.fillRect(this.#canvasWidth - 100, 0, 100, 100);

    const sorted = this.#sorted;
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i]['name'] == this.mainPlayer) {
        const mainPlayerCoordX = sorted[i]['name'].coordX / 1600 * 100;
        const mainPlayerCoordY = sorted[i]['name'].coordY / 1600 * 100;
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(mainPlayerCoordX + this.#canvasWidth - 100, mainPlayerCoordY, 5, 5);
      } else {
        const characterCoordX = sorted[i]['name'].coordX / 1600 * 100;
        const characterCoordY = sorted[i]['name'].coordY / 1600 * 100;
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(characterCoordX + this.#canvasWidth - 100, characterCoordY, 5, 5);
      }
    }

    this.ctx.strokeStyle = 'black';
    this.ctx.strokeRect(this.#canvasWidth - 101, 0, 101, 101);
  }

  translatedContext(offsetX, offsetY) {
    const minPointX = this.#canvasWidth / 2;
    const minPointY = this.#canvasHeight / 2;

    const maxPointX = this.tileSize * this.#tilesX - this.#canvasWidth / 2;
    const maxPointY = this.tileSize * this.#tilesY - this.#canvasHeight / 2;

    let translatedX = offsetX;
    let translatedY = offsetY;
    const width = 780;
    const height = 140;

    if (this.mainPlayer.coordX > minPointX && this.mainPlayer.coordX < maxPointX) {
      translatedX = this.mainPlayer.coordX - this.#canvasWidth / 2 + offsetX;

    }

    if (this.mainPlayer.coordY > minPointY && this.mainPlayer.coordY < maxPointY) {
      translatedY = this.mainPlayer.coordY - this.#canvasHeight / 2 + offsetY;
    }

    if (this.mainPlayer.coordX >= maxPointX) {
      translatedX = maxPointX - this.#canvasWidth / 2 + offsetX;
    }

    if (this.mainPlayer.coordY >= maxPointY) {
      translatedY = maxPointY - this.#canvasHeight / 2 + offsetY;
    }

    return [translatedX, translatedY];
  }

  #soundToggle() {
    this.#mainSoundTrack.togglemute();
  }
}

let gGameEngine;
window.onload = () => {
  gGameEngine = new GameEngine();
  gGameEngine.load();
};
