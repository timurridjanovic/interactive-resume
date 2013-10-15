Player = Class.extend({

    frameY: {'down': 11, 'left': 59, 'up': 107, 'right': 155}, //+48
    
    frameX: {1:8, 2:56, 3:104, 4:152}, //+48
    
    currentFrame: 1,
    
    movementTime: 0,
    
    direction: 'down',
    
    coordX: 90,
    
    coordY: 100,
    
    playerCoords: {},
    
    collisionTile: {},
    
    init: function() {	
        for (var i = 0; i < gGameEngine.images.length; i++) {
            if (gGameEngine.images[i].alt == "mainPlayer") {
                gGameEngine.mainPlayerImg = gGameEngine.images[i];
              
            }
        }
    
    },
    
    drawPlayer: function() {
        var movingFlag = false;
        
        this.playerCoords.top = this.coordY;
    	this.playerCoords.bottom = this.coordY + gGameEngine.tileSize;
    	this.playerCoords.left = this.coordX;
    	this.playerCoords.right = this.coordX + gGameEngine.tileSize;
    	
            
        if (gInputEngine.actions['up'] == true) {
            this.direction = 'up';
            this.coordY -= 1;
            movingFlag = true;
                    
        }
        
        else if (gInputEngine.actions['down'] == true) {
            this.direction = 'down';
            this.coordY += 1;
            movingFlag = true;
                            
        }        
 
        else if (gInputEngine.actions['left'] == true) {
            this.direction = 'left'; 
            this.coordX -= 1;
            movingFlag = true;
                        
        }
        
        else if (gInputEngine.actions['right'] == true) {
            this.direction = 'right';     
            this.coordX += 1;
            movingFlag = true;                      
        }    
        
        //collision detection with collision tiles
    	if (this.intersectRect(gGameEngine.collision)) {
    		//console.log('collision');

    	}   
                      
       
            
        //animation when moving
        if (movingFlag == true) {
            this.movementTime++;
        
            if (this.movementTime >= 6) {
                this.currentFrame = (this.currentFrame%4) + 1;
                this.movementTime = 0;
            }        
        }

       
        gGameEngine.ctx.drawImage(gGameEngine.mainPlayerImg, this.frameX[this.currentFrame], this.frameY[this.direction], 32, 32, this.coordX, this.coordY, 32, 32);
        
        
        //testing rectangle
        //gGameEngine.ctx.strokeRect(this.coordX, this.coordY, 32, 32);
       
    },
    
    
    intersectRect: function(collisionTiles) {
    	
    	for (var i = 0; i < collisionTiles.length; i++) {
    		var tile = collisionTiles[i]
   
			if (tile.bottom > this.playerCoords.top && tile.top < this.playerCoords.bottom) {
				if (tile.left < this.playerCoords.right && tile.right > this.playerCoords.left) {
					if (this.playerCoords.top > tile.top && this.direction == 'up') {
						if (this.playerCoords.bottom > tile.bottom-30)
							this.coordY = tile.bottom;
					}
					if (this.playerCoords.bottom < tile.bottom && this.direction == 'down') {
						if (this.playerCoords.top < tile.top - 10) {
							this.coordY = tile.top-32;
							console.log('collision down');
						}
					}
					if (this.playerCoords.right < tile.right && this.direction == 'right') {
						//if (this.playerCoords.right <=)
						this.coordX = tile.left-32;
						console.log('collision right');
					}
					if (this.playerCoords.right > tile.right && this.direction == 'left') {
						this.coordX = tile.right;
						console.log('collision left');
					}
					this.collisionTile = tile;
					return true;
		
				}
		
			}

    	
    	}
    	
    	return false;	
    
    }


});
