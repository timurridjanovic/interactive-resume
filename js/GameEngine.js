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
    
    loadManifest: [ {name: "mainPlayer", src: "img/mainPlayer.png"},
                    {name: "tile_carpet", src: "img/tile_carpet.png"},
                    {name: "tile_wall", src: "img/tile_wall.png"},
                    {name: "tile_wood", src: "img/tile_wood.png"},
                    {name: "carpetone", src: "img/carpetone.png"},
                    {name: "chest", src: "img/chest.png"},
                    {name: "cupboard", src: "img/cupboard.png"},
                    {name: "desk", src: "img/desk.png"},
                    {name: "pot", src: "img/pot.png"},
                    {name: "character_one", src: "img/character_one.png"},
                    {name: "character_two", src: "img/character_two.png"},
                    {name: "character_three", src: "img/character_three.png"},
                    {name: "character_four", src: "img/character_four.png"},
                    {name: "multi_characters", src: "img/multi_characters.png"}
                    ],
    
    
    load: function() {
        this.canvas = document.getElementById('canvas');
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
	    this.ctx = this.canvas.getContext('2d');
	    
        var queue = this.preloadImages();
        this.setupMap();
        gInputEngine.setup();
        mainPlayer = new Player();
        characterOne = new Character(640, 150, 'character_one', 'down');
        characterTwo = new Character(850, 200, 'character_two', 'down');
        
        this.gameLoop();
        
            

    },
    
    gameLoop: function() {   
        //clearing context
        this.ctx.clearRect(0, 0, 30, 30); 
         
        //translate context
        this.ctx.save();
        this.translateContext();
       
        //drawing tiles and player        
        this.drawTiles();
        characterOne.drawCharacter();
        characterTwo.drawCharacter();
        mainPlayer.drawPlayer();

        
        //restoring context
        this.ctx.restore();
        
        //calculating frames per second
        this.framesPerSecond();
       
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    
    translateContext: function() {
        var minPointX = this.canvasWidth/2;
        var minPointY = this.canvasHeight/2;
        
        var maxPointX = this.tileSize * this.tilesX - this.canvasWidth/2;
        var maxPointY = this.tileSize * this.tilesY - this.canvasHeight/2;
        
        
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
        var loadedImages = 0;
        for (var i = 0; i < this.loadManifest.length; i++) {
            this.images[i] = new Image();
            this.images[i].onload = function() {
                loadedImages++; //++ before?
                that.progressBar(loadedImages);
                
            }
            
            this.images[i].src = this.loadManifest[i]['src'];
            this.images[i].alt = this.loadManifest[i]['name'];
     
        }
    },
    
    framesPerSecond: function () {
        var time = new Date();
        
        if (this.timePerFrame != 0) {this.timePerFrame = time - this.timePerFrame;}
        
        this.timeAverage.push(this.timePerFrame);
        
        this.timePerFrame = new Date();
      
        
        if (this.timeAverage.length >= 10) {
            var result = 0;
            for (var i = 0; i < 10; i++) {
                result += this.timeAverage[i]
            }
            
            result = result/this.timeAverage.length;
            this.fps = Math.round(1000/result);
            this.timeAverage = [];
        }    
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(this.fps, 0, 10);
    },
    
    progressBar: function(i) {
        var percentIndex = this.progressBarPercent;
        this.progressBarPercent = Math.floor((i/this.loadManifest.length)*100);
        var percentToComplete = this.progressBarPercent;
        
        for (percentIndex; percentIndex <= this.progressBarPercent; percentIndex++) {
            this.ctx.fillStyle = 'green';
            this.ctx.strokeRect(1, this.canvasHeight/2-25, this.canvasWidth-2, 50);
            this.ctx.fillRect(2, this.canvasHeight/2-25+1, this.canvasWidth*(percentIndex/100)-3, 50-2);
        }
        if (percentIndex >= 100) {
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        }
       
    },
    
    setupMap: function() {
        var xhr = new XMLHttpRequest(); 
		
	    // Loading of file
	    xhr.open("GET", 'map/map.json', false);
	    xhr.send(null);
	    if(xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 0)) // Code == 0 for local
		    throw new Error("Impossible to load map:" + " (code HTTP : " + xhr.status + ").");
	    
	    var mapJsonData = xhr.responseText;
	
	    // parsing JSON map and storing it into mapData
	    this.mapData = JSON.parse(mapJsonData);
	    
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
                    

                    
                    //if tileID == 0, there is no tile...
                    if (tileID != 0) {
                        //collision detection
                        if (this.mapData.layers[layer].properties.collision == 'true' && this.tilesDrawn == false) {
                        	var tileCoords = {};
                        	tileCoords.top = MapY;
                        	tileCoords.bottom = MapY + this.tileSize;
                        	tileCoords.left = MapX;
                        	tileCoords.right = MapX + this.tileSize;
                            this.collision.push(tileCoords);
                          
                        }
                        
                        this.ctx.drawImage(image, MapX, MapY);
                        
                        
                    }
                }
            }
        }
        this.tilesDrawn = true;
    },
    
    
    collisionHandler: function(collisionTiles, character) {
    	
    	for (var i = 0; i < collisionTiles.length; i++) {
    		var tile = collisionTiles[i];
    		var gap = 2;
    		var upGap = 12;
    		if (tile.bottom > character.characterCoords.top + upGap && tile.top < character.characterCoords.bottom) {
				if (tile.left < character.characterCoords.right && tile.right > character.characterCoords.left) {
					//collision up
					if (character.characterCoords.top + upGap > tile.top && character.direction == 'up') {
						character.directionFlag.up = false;
						character.directionFlag.down = true;
						character.directionFlag.right = true;
						character.directionFlag.left = true;
						character.coordY++;
						console.log('collision up');
					}
					//collision down
					if (character.characterCoords.bottom < tile.bottom && character.direction == 'down') {
						character.directionFlag.down = false;
						character.directionFlag.up = true;
						character.directionFlag.right = true;
						character.directionFlag.left = true;
						character.coordY--;
						console.log('collision down');
					}
					//collision right
					if (character.characterCoords.right < tile.right + gap && character.direction == 'right') {
						character.directionFlag.right = false;
						character.directionFlag.up = true;
						character.directionFlag.down = true;
						character.directionFlag.left = true;
						character.coordX--;
						console.log('collision right');
					}
					//collision left
					if (character.characterCoords.left > tile.left && character.direction == 'left') {
						character.directionFlag.left = false;
						character.directionFlag.right = true;
						character.directionFlag.up = true;
						character.directionFlag.down = true;
						character.coordX++;
						console.log('collision left');
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
    }  
    
});

gGameEngine = new GameEngine();
