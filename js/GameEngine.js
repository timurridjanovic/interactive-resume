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
    
    loadManifest: [ {id: "mainPlayer", src: "/img/mainPlayer.png"},
                    {id: "tile_carpet", src: "img/tile_carpet.png"},
                    {id: "tile_wall", src: "img/tile_wall.png"},
                    {id: "tile_wood", src: "img/tile_wood.png"},
                    {id: "carpetone", src: "img/carpetone.png"},
                    {id: "chest", src: "img/chest.png"},
                    {id: "cupboard", src: "img/cupboard.png"},
                    {id: "desk", src: "img/desk.png"},
                    {id: "pot", src: "img/pot.png"}],
    
    
    load: function() {
        var canvas = document.getElementById('canvas');
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
	    var ctx = canvas.getContext('2d');
        
        var queue = this.preloadImages(ctx);
            

    },
    
    preloadImages: function(ctx) {
        var that = this;
        var loadedImages = 0;
        for (var i = 0; i < this.loadManifest.length; i++) {
            this.images[i] = new Image();
            this.images[i].onload = function() {
                ++loadedImages;
                that.progressBar(ctx, loadedImages);
                
            }
            
            this.images[i].src = this.loadManifest[i]['src'];
     
        }
    },
    
    progressBar: function(ctx, i) {
        var percentIndex = this.progressBarPercent;
        this.progressBarPercent = Math.floor((i/this.loadManifest.length)*100);
        var percentToComplete = this.progressBarPercent;
        
        for (percentIndex; percentIndex <= this.progressBarPercent; percentIndex++) {
            ctx.fillStyle = 'green';
            ctx.strokeRect(1, this.canvasHeight/2-25, this.canvasWidth-2, 50);
            ctx.fillRect(2, this.canvasHeight/2-25+1, this.canvasWidth*(percentIndex/100)-3, 50-2);
            debugger
        }
        
        if (percentIndex >= 100) {
            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.setup();
        }
       
    },
    
    setup: function() {
        if (!gInputEngine.bindings.length) {
            gInputEngine.setup();
        }
        
        this.setupMap()
        
        
        //this.drawCharacters();
    
   },
   
   setupMap: function() {
        var xhr = new XMLHttpRequest(); 
		
	    // Loading of file
	    xhr.open("GET", 'map/map.json', false);
	    xhr.send(null);
	    if(xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 0)) // Code == 0 for local
		    throw new Error("Impossible to load map:" + " (code HTTP : " + xhr.status + ").");
	    
	    var mapJsonData = xhr.responseText;
	
	    // Data analysis
	    this.mapData = JSON.parse(mapJsonData);
	    
	    this.drawTiles();
	    console.log(this.mapData["layers"][0]['data'].length);
	
   },
   
   drawTiles: function() {
        for (var i = 0; i < this.tilesY; i++) {
            for (var j = 0; j < this.tilesX; j++) {
                var tileID = this.mapData["layers"][0]['data'][i+j];
                console.log(tileID);
            }
    
   
        }
   }
   
});

gGameEngine = new GameEngine();
