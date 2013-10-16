Character = Class.extend({

    frameY: {'down': 11, 'left': 59, 'up': 107, 'right': 155}, //+48
    
    frameX: {1:8, 2:56, 3:104, 4:152}, //+48
    
    currentFrame: 1,
    
    movementTime: 0,
    
    direction: null,
    
    coordX: 0,
    
    coordY: 0,
    
    positionTimeOne: 0,
    
    positionTimeTwo: 0,
    
    characterCoords: {},
    
    directionFlag: {'up': true, 'down': true, 'right': true, 'left': true},
    
    init: function(x, y, name, direction) {
        this.coordX = x;
        this.coordY = y;
        this.direction = direction;
        this.imgName = name;
        for (var i = 0; i < gGameEngine.images.length; i++) {
            if (gGameEngine.images[i].alt == name) {
                gGameEngine.characterImgs.push(gGameEngine.images[i]);
              
            }
        }
        
        //keeping track of all object names in a list
        gGameEngine.allCharacters.push(name);
    
    },
    
    drawCharacter: function() {  
    	var randomNumber = Math.random() * 200 + 100;
    	
    	this.characterCoords.top = this.coordY;
    	this.characterCoords.bottom = this.coordY + gGameEngine.tileSize;
    	this.characterCoords.left = this.coordX;
    	this.characterCoords.right = this.coordX + gGameEngine.tileSize;
    	
    	//storing coordinates in a collision dict
    	gGameEngine.characterCollisions[this.imgName] = this.characterCoords;
    	
    	//collision with mainPlayer
        if (!gGameEngine.intersectRect([mainPlayer.characterCoords], this)) {
    		this.directionFlag.up = true;
    		this.directionFlag.down = true;
    		this.directionFlag.left = true;
    		this.directionFlag.right = true;        
        }
       	
    	
    	//collision with collision tiles
        if (!gGameEngine.intersectRect(gGameEngine.collision, this)) {
    		this.directionFlag.up = true;
    		this.directionFlag.down = true;
    		this.directionFlag.left = true;
    		this.directionFlag.right = true;         
        }
        
    	
    
        if (this.direction == 'down' && this.directionFlag.down == true) {
            this.coordY++;
            this.positionTimeOne++;
        }
            
        if (this.direction == 'up' && this.directionFlag.up == true) {
        	this.coordY--;
        	this.positionTimeTwo++;
        }   
        
        if (this.positionTimeOne >= randomNumber) {
        	this.direction = 'up';
        	this.positionTimeOne = 0;
        }
        
        if (this.positionTimeTwo >= randomNumber) {
        	this.direction = 'down';
        	this.positionTimeTwo = 0;
        }
                
        //animation when moving
 
        this.movementTime++;
    
        if (this.movementTime >= 6) {
            this.currentFrame = (this.currentFrame%4) + 1;
            this.movementTime = 0;
        }        
       

        for (var i = 0; i < gGameEngine.characterImgs.length; i++) {
            if (gGameEngine.characterImgs[i].alt == this.imgName) {
                var image = gGameEngine.characterImgs[i];
            }
        }
        
        gGameEngine.ctx.drawImage(image, this.frameX[this.currentFrame], 
        	this.frameY[this.direction], 32, 32, this.coordX, this.coordY, 32, 32);
       
    }


});
