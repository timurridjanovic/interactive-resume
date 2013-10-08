GameEngine = Class.extend({
    tileSize: 32,
    tilesX: 50,
    tilesY: 50,
    size: {},
    fps: 50,

    stage: null,
    
    tiles: [],
    
    mainPlayerImg: null,
    
    tilesImgs: {},
    
    mapData: {},
    
    
    load: function() {
        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver();
        
        var queue = new createjs.LoadQueue();
        
        queue.addEventListener("complete", function() {
            this.mainPlayer = queue.getResult("mainPlayer");
            this.tilesImgs.carpet = queue.getResult("tile_carpet");
            this.tilesImgs.wall = queue.getResult("tile_wall");
            this.tilesImgs.wood = queue.getResult("tile_wood");
            this.tilesImgs.carpetone = queue.getResult("carpetone");
            this.tilesImgs.chest = queue.getResult("chest");
            this.tilesImgs.cupboard = queue.getResult("cupboard");
            this.tilesImgs.desk = queue.getResult("desk");
            this.tilesImgs.pot = queue.getResult("pot");
            
            this.setup();
        });
        
        queue.loadManifest([
            {id: "mainPlayer", src: "/img/mainPlayer.png"},
            {id: "tile_carpet", src: "img/tile_carpet.png"},
            {id: "tile_wall", src: "img/tile_wall.png"},
            {id: "tile_wood", src: "img/tile_wood.png"},
            {id: "carpetone", src: "img/carpetone.png"},
            {id: "chest", src: "img/chest.png"},
            {id: "cupboard", src: "img/cupboard.png"},
            {id: "desk", src: "img/desk.png"},
            {id: "pot", src: "img/pot.png"}
            
        ]);

    },
    
    setup: function() {
        if (!gInputEngine.Bindings.length) {
            gInputEngine.setup();
        }
        
        this.setupMap()
        
        this.tiles = [];
        
        this.drawTiles();
        
        this.drawCharacters();
    
   },
   
   setupMap: function() {
        var xhr = getXMLHttpRequest();
		
	    // Loading of file
	    xhr.open("GET", './map/map.json', false);
	    xhr.send(null);
	    if(xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 0)) // Code == 0 for local
		    throw new Error("Impossible to load map:" + " (code HTTP : " + xhr.status + ").");
	    
	    var mapJsonData = xhr.responseText;
	
	    // Data analysis
	    this.mapData = JSON.parse(mapJsonData);
	
   },
   
   drawTiles: function() {
        console.log(this.mapData);
        for (var i = 0; i < this.tilesY; i++) {
            for (var j = 0; j < this.tilesX; j++) {
                var tile = new Tile({x:j, y:i});
                this.stage.addChild(tile.bmp);
                this.tiles.push(tile);
            }
    
   
        }
   }
   
});

gGameEngine = new GameEngine();
