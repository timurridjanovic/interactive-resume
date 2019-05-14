GameEngine = Class.extend({
  tileSize: 32,
  tilesX: 50,
  tilesY: 50,
  timeAverage: [],
  time: 0,
  fps: 0,
  timePerFrame: 0,
  canvasWidth: 0,
  canvasHeight: 0,
  progressBarPercent: 0,
  tilesDrawn: false,

  mainPlayerImg: null,

  characterImgs: [],

  allCharacters: [],

  characterCollisions: {},

  tilesImgs: {},

  images: [],

  mapData: {},

  collision: [],

  talkedToAlice: false,

  menu: true,

  loadManifest: [{
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
  ],


  load: function() {
    this.canvas = document.getElementById('mainCanvas');
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');

    var queue = this.preloadImages();
    this.setupMap();
    gInputEngine.setup();
    mainPlayer = new Player();
    characterOne = new Character(576, 224, 'character_one', 'up', [704, 64]);
    characterTwo = new Character(850, 200, 'character_two', 'down', [608, 288]); //850 200
    characterThree = new Character(192, 148, 'character_three', 'up', [192, 148]);
    characterFour = new Character(320, 148, 'character_four', 'up', [320, 148]);
    characterFive = new Character(414, 244, 'character_five', 'up', [414, 244]);
    characterSix = new Character(182, 748, 'character_six', 'right', [400, 748]);
    characterSeven = new Character(1370, 1194, 'character_seven', 'right', [256, 1416]);
  },

  startMenu: function() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.ctx.fillStyle = '#FFFFFF'; //#66FF00
    this.ctx.font = '40px sans-serif';
    this.ctx.fillText("Press Enter to Play", this.canvasWidth / 4 + 10, this.canvasHeight / 2 - 10);
  },

  exitMenu: function() {
    this.menu = false;
    gInputEngine.removeListeners();

    //loading audio
    this.mainSoundTrack = new SoundManager();
    this.mainSoundTrack.loadAsync('music/honeybee.mp3', () => {
      //var volume = 1.0;
      this.mainSoundTrack.playSound(this.mainSoundTrack.clips['music/honeybee.mp3'].s.path, {
        looping: true
      });
    });

    gInputEngine.addListener('backspace', this.soundToggle.bind(this));
    gInputEngine.addListener('F1', this.restart.bind(this));
  },

  restart: function() {
    window.location.reload()
  },

  gameLoop: function() {
    //clearing contexts
    //this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    if (this.menu === true) {
      this.drawTilesFromCache();
      this.startMenu();
    } else {
      //translate context
      this.ctx.save();
      this.translateContext();

      //drawing tiles
      this.drawTilesFromCache();

      //drawing player and character sorted by Y axis
      var sorted = this.sortByYAxis();

      //loop drawing characters by sorted Y axis
      for (var i = 0; i < sorted.length; i++) {
        sorted[i]['name'].drawCharacter();
      }

      //drawing dialogue boxes for characters
      for (var i = 0; i < sorted.length; i++) {
        if (sorted[i]['name'] != mainPlayer) {
          if (sorted[i]['name'].dialogueBox == true) {
            sorted[i]['name'].drawDialogueBox();
          }
        }
      }


      //restoring context
      this.ctx.restore();

      //calculating frames per second
      this.framesPerSecond();

      //drawing minimap
      this.miniMap();
    }
    this.requestID = requestAnimationFrame(this.gameLoop.bind(this));
  },


  translateContext: function() {
    var minPointX = this.canvasWidth / 2;
    var minPointY = this.canvasHeight / 2;

    var maxPointX = this.tileSize * this.tilesX - this.canvasWidth / 2;
    var maxPointY = this.tileSize * this.tilesY - this.canvasHeight / 2;


    if (mainPlayer.coordX >= minPointX && mainPlayer.coordX <= maxPointX) {
      this.ctx.translate(-mainPlayer.coordX + minPointX, 0);

    }

    if (mainPlayer.coordX > maxPointX) {
      this.ctx.translate(-maxPointX + minPointX, 0);
    }

    if (mainPlayer.coordY >= minPointY && mainPlayer.coordY <= maxPointY) {
      this.ctx.translate(0, -mainPlayer.coordY + minPointY);

    }

    if (mainPlayer.coordY > maxPointY) {
      this.ctx.translate(0, -maxPointY + minPointY);

    }

  },

  preloadImages: function() {
    var that = this;
    var loadedItems = 0;

    //draw black background
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (var i = 0; i < this.loadManifest.length; i++) {
      this.images[i] = new Image();
      this.images[i].onload = function() {
        loadedItems++;
        that.progressBar(loadedItems);
      }

      this.images[i].src = this.loadManifest[i]['src'];
      this.images[i].alt = this.loadManifest[i]['name'];

    }
  },

  framesPerSecond: function() {
    var time = new Date();

    if (this.timePerFrame != 0) {
      this.timePerFrame = time - this.timePerFrame;
    }

    this.timeAverage.push(this.timePerFrame);

    this.timePerFrame = new Date();


    if (this.timeAverage.length >= 10) {
      var result = 0;
      for (var i = 0; i < 10; i++) {
        result += this.timeAverage[i]
      }

      result = result / this.timeAverage.length;
      this.fps = Math.round(1000 / result);
      this.timeAverage = [];
    }
    this.ctx.font = '10px sans-serif';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(this.fps, 0, 10);
  },

  progressBar: function(i) {

    var percentIndex = this.progressBarPercent;
    this.progressBarPercent = Math.floor((i / this.loadManifest.length) * 100);
    var percentToComplete = this.progressBarPercent;

    for (percentIndex; percentIndex <= this.progressBarPercent; percentIndex++) {
      this.ctx.fillStyle = 'green';
      this.ctx.strokeRect(1, this.canvasHeight / 2 - 25, this.canvasWidth - 2, 50);
      this.ctx.fillRect(2, this.canvasHeight / 2 - 25 + 1, this.canvasWidth * (percentIndex / 100) - 3, 50 - 2);
    }
    if (percentIndex >= 100) {
      //this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      gInputEngine.addListener('enter', this.exitMenu.bind(this));
      this.drawTiles();
      this.gameLoop();

    }

  },

  setupMap: function() {
    fetch('map/map.json')
      .then(response => response.json())
      .then(json => {
        this.mapData = json;

        //storing the imageID and image source into tilesImgs (for drawTiles() reference)
        for (var i = 0; i < this.mapData["tilesets"].length; i++) {
          var imageID = this.mapData["tilesets"][i]["firstgid"];
          var imageName = this.mapData["tilesets"][i]["name"];

          //going through images array (loaded images) and storing imageID and image source into tilesImgs
          for (var j = 0; j < this.images.length; j++) {
            if (this.images[j].alt == imageName) {
              this.tilesImgs[imageID] = this.images[j];
            }
          }
        }

        //creating non visible canvas to copy from (caching)
        this.osCanvas = document.createElement("canvas");
        this.osCanvas.width = this.tilesX * this.tileSize;
        this.osCanvas.height = this.tilesY * this.tileSize;
        this.osCtx = this.osCanvas.getContext('2d');
      })
      .catch(err => {
        throw new Error(`Impossible to load map: ${err}`);
      });
  },

  drawTilesFromCache: function() {
    this.ctx.drawImage(this.osCanvas, 0, 0);
  },

  drawTiles: function() {
    //for loop for the layers of tiles
    for (var layer = 0; layer < this.mapData["layers"].length; layer++) {
      //for loop for the y axis tiles
      for (var i = 0; i < this.tilesY; i++) {
        //for loop for the x axis tiles
        for (var j = 0; j < this.tilesX; j++) {
          var tileNumber = i * this.tilesX + j;
          MapX = j * this.tileSize;
          MapY = i * this.tileSize;
          var tileID = this.mapData["layers"][layer]['data'][tileNumber];
          var image = this.tilesImgs[tileID];

          //creating coordinates for tile object
          var tileCoords = {};
          tileCoords.top = MapY;
          tileCoords.bottom = MapY + this.tileSize;
          tileCoords.left = MapX;
          tileCoords.right = MapX + this.tileSize;

          //if tileID == 0, there is no tile...
          if (tileID != 0) {
            //collision detection
            if (this.mapData.layers[layer].properties.collision == 'true' && this.tilesDrawn == false) {
              this.collision.push(tileCoords);
            }
            //drawing tiles
            this.osCtx.beginPath();
            this.osCtx.drawImage(image, MapX, MapY);
            this.osCtx.closePath();
          }
        }
      }
    }
    this.tilesDrawn = true;
  },

  isTileOnCanvas: function(tileCoords) {
    var offset = this.translatedContext(0, 0);
    var offsetX = offset[0];
    var offsetY = offset[1];
    var distanceX = 0;
    var distanceY = 0;

    if (offsetX > 0 && offsetX < 800)
      distanceX = this.canvasWidth / 2 + this.tileSize;
    else
      distanceX = this.canvasWidth;

    if (offsetY > 0 && offsetY < 1200)
      distanceY = this.canvasHeight / 2 + this.tileSize;
    else
      distanceY = this.canvasHeight;

    if (tileCoords.left >= mainPlayer.coordX - distanceX &&
      tileCoords.right <= mainPlayer.coordX + distanceX) {

      if (tileCoords.top >= mainPlayer.coordY - distanceY &&
        tileCoords.bottom <= mainPlayer.coordY + distanceY) {
        return true;
      }
    }

    return false;
  },


  collisionHandler: function(collisionTiles, character, increment) {
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
  },

  intersectRect: function(collisionTiles, character) {

    for (var i = 0; i < collisionTiles.length; i++) {
      var tile = collisionTiles[i];
      var upGap = 12;

      if (tile.bottom > character.characterCoords.top + upGap && tile.top < character.characterCoords.bottom) {
        if (tile.left < character.characterCoords.right && tile.right > character.characterCoords.left) {
          return true;
        }
      }
    }
    return false;
  },


  sortByYAxis: function() {
    this.sorted = [];
    this.sorted.push({
      'name': mainPlayer,
      'coordY': mainPlayer.coordY
    });
    this.sorted.push({
      'name': characterOne,
      'coordY': characterOne.coordY
    });
    this.sorted.push({
      'name': characterTwo,
      'coordY': characterTwo.coordY
    });
    this.sorted.push({
      'name': characterThree,
      'coordY': characterThree.coordY
    });
    this.sorted.push({
      'name': characterFour,
      'coordY': characterFour.coordY
    });
    this.sorted.push({
      'name': characterFive,
      'coordY': characterFive.coordY
    });
    this.sorted.push({
      'name': characterSix,
      'coordY': characterSix.coordY
    });
    this.sorted.push({
      'name': characterSeven,
      'coordY': characterSeven.coordY
    });

    this.sorted.sort(function(obj1, obj2) {
      return obj1.coordY - obj2.coordY;
    });

    return this.sorted;
  },

  miniMap: function() {
    gGameEngine.ctx.beginPath();
    gGameEngine.ctx.fillStyle = 'rgba(225, 225, 225, 0.6)';
    gGameEngine.ctx.fillRect(gGameEngine.canvasWidth - 100, 0, 100, 100);



    var sorted = this.sorted;
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i]['name'] == mainPlayer) {
        var mainPlayerCoordX = sorted[i]['name'].coordX / 1600 * 100;
        var mainPlayerCoordY = sorted[i]['name'].coordY / 1600 * 100;
        gGameEngine.ctx.fillStyle = 'red';
        gGameEngine.ctx.fillRect(mainPlayerCoordX + gGameEngine.canvasWidth - 100, mainPlayerCoordY, 5, 5);
      } else {
        var characterCoordX = sorted[i]['name'].coordX / 1600 * 100;
        var characterCoordY = sorted[i]['name'].coordY / 1600 * 100;
        gGameEngine.ctx.fillStyle = 'blue';
        gGameEngine.ctx.fillRect(characterCoordX + gGameEngine.canvasWidth - 100, characterCoordY, 5, 5);
      }

    }

    gGameEngine.ctx.strokeStyle = 'black';
    gGameEngine.ctx.strokeRect(gGameEngine.canvasWidth - 101, 0, 101, 101);
  },

  translatedContext: function(offsetX, offsetY) {
    var minPointX = gGameEngine.canvasWidth / 2;
    var minPointY = gGameEngine.canvasHeight / 2;

    var maxPointX = gGameEngine.tileSize * gGameEngine.tilesX - gGameEngine.canvasWidth / 2;
    var maxPointY = gGameEngine.tileSize * gGameEngine.tilesY - gGameEngine.canvasHeight / 2;

    var translatedX = offsetX;
    var translatedY = offsetY;
    var width = 780;
    var height = 140;

    if (mainPlayer.coordX > minPointX && mainPlayer.coordX < maxPointX) {
      translatedX = mainPlayer.coordX - gGameEngine.canvasWidth / 2 + offsetX;

    }

    if (mainPlayer.coordY > minPointY && mainPlayer.coordY < maxPointY) {
      translatedY = mainPlayer.coordY - gGameEngine.canvasHeight / 2 + offsetY;
    }

    if (mainPlayer.coordX >= maxPointX) {
      translatedX = maxPointX - gGameEngine.canvasWidth / 2 + offsetX;
    }

    if (mainPlayer.coordY >= maxPointY) {
      translatedY = maxPointY - gGameEngine.canvasHeight / 2 + offsetY;
    }

    return [translatedX, translatedY];

  },


  soundToggle: function() {
    this.mainSoundTrack.togglemute();
  }
});

gGameEngine = new GameEngine();

