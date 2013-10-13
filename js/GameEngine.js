GameEngine = Class.extend({
    tileSize: 32,
    tilesX: 50,
    tilesY: 50,
    size: {},
    fps: 50,
    canvasWidth: 0,
    canvasHeight: 0,
    progressBarPercent: 0,

    stage: null,
    
    tiles: [],
    
    mainPlayerImg: null,
    
    tilesImgs: {},
    
    images: [],
    
    mapData: {},
    
    loadManifest: [ {name: "mainPlayer", src: "/img/mainPlayer.png"},
                    {name: "tile_carpet", src: "img/tile_carpet.png"},
                    {name: "tile_wall", src: "img/tile_wall.png"},
                    {name: "tile_wood", src: "img/tile_wood.png"},
                    {name: "carpetone", src: "img/carpetone.png"},
                    {name: "chest", src: "img/chest.png"},
                    {name: "cupboard", src: "img/cupboard.png"},
                    {name: "desk", src: "img/desk.png"},
                    {name: "pot", src: "img/pot.png"}],
    
    
    load: function() {
        var canvas = document.getElementById('canvas');
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
	    this.ctx = canvas.getContext('2d');
	    
        var queue = this.preloadImages();
        this.setupMap();
        gInputEngine.setup();
        gMainPlayer = new Player();
        this.gameLoop();
        
            

    },
    
    gameLoop: function() {
        this.drawTiles();
        gMainPlayer.drawPlayer();
        requestAnimationFrame(this.gameLoop.bind(this));
    },
    
    preloadImages: function() {
        var that = this;
        var loadedImages = 0;
        for (var i = 0; i < this.loadManifest.length; i++) {
            this.images[i] = new Image();
            this.images[i].onload = function() {
                ++loadedImages;
                that.progressBar(loadedImages);
                
            }
            
            this.images[i].src = this.loadManifest[i]['src'];
            this.images[i].alt = this.loadManifest[i]['name'];
     
        }
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
                    var MapX = j * this.tileSize;
                    var MapY = i * this.tileSize;
                    var tileID = this.mapData["layers"][layer]['data'][tileNumber];
                    var image = this.tilesImgs[tileID];
                    
                    //if tileID == 0, there is no tile...
                    if (tileID != 0) {
                        this.ctx.drawImage(image, MapX, MapY);
                    }
                    
                
                
                
                }
            }
        }
    }
});

gGameEngine = new GameEngine();
