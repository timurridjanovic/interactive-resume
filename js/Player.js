Player = Class.extend({

    frameY: {'down': 11, 'left': 59, 'up': 107, 'right': 155}, //+48
    
    frameX: {1:8, 2:56, 3:104, 4:152}, //+48
    
    currentFrame: 1,
    
    movementTime: 0,
    
    direction: 'down',
    
    coordX: 90,
    
    coordY: 100,
    
    characterCoords: {},
    
	characterCoordsList: [],
	
	directionFlag: {'up': true, 'down': true, 'right': true, 'left': true},
    
    init: function() {	
        for (var i = 0; i < gGameEngine.images.length; i++) {
            if (gGameEngine.images[i].alt == "mainPlayer") {
                gGameEngine.mainPlayerImg = gGameEngine.images[i];
              
            }
        }
    
    },
    
    drawPlayer: function() {
        var movingFlag = false;
        
        this.characterCoords.top = this.coordY;
    	this.characterCoords.bottom = this.coordY + gGameEngine.tileSize;
    	this.characterCoords.left = this.coordX;
    	this.characterCoords.right = this.coordX + gGameEngine.tileSize;
    	
    	
    	if (gInputEngine.actions['up'] == true || gInputEngine.actions['down'] == true ||
    		gInputEngine.actions['right'] == true || gInputEngine.actions['left'] == true) {
    		
    		movingFlag = true;
    		
			//collision with other characters
			this.characterCollision();
			
			//collision detection with collision tiles
			if (!gGameEngine.intersectRect(gGameEngine.collision, this)) {
				this.directionFlag.up = true;
				this.directionFlag.down = true;
				this.directionFlag.left = true;
				this.directionFlag.right = true;
			}    		
    		
    	}    	

        if (gInputEngine.actions['up'] == true) {
        	this.direction = 'up';
        	if (this.directionFlag.up == true) {
		        this.coordY -= 1;       	
        	}        
        }
        
        else if (gInputEngine.actions['down'] == true) {
        	this.direction = 'down';
        	if (this.directionFlag.down == true) {
            	this.coordY += 1;        	
        	}                 
        }        
 
        else if (gInputEngine.actions['left'] == true) {
        	this.direction = 'left';
        	if (this.directionFlag.left == true) {
				this.coordX -= 1;        	
        	}
        }
        
        else if (gInputEngine.actions['right'] == true) {
        	this.direction = 'right';   
        	if (this.directionFlag.right == true) {     
		        this.coordX += 1;        	
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

       
        gGameEngine.ctx.drawImage(gGameEngine.mainPlayerImg, 
        	this.frameX[this.currentFrame], this.frameY[this.direction], 32, 32, 
        		this.coordX, this.coordY, 32, 32);
        
       
    },
    
    
    characterCollision: function() {
    	for (var i = 0; i < gGameEngine.allCharacters.length; i++) {
    		var name = gGameEngine.allCharacters[i];
    		var character = gGameEngine.characterCollisions[name];
    		if (!gGameEngine.intersectRect([character], this)) {
				this.directionFlag.up = true;
				this.directionFlag.down = true;
				this.directionFlag.left = true;
				this.directionFlag.right = true;
    		}
    	}
    
    		

    	
    	
    }


});
