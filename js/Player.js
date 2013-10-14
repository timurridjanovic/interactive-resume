Player = Class.extend({

    frameY: {'down': 11, 'left': 59, 'up': 107, 'right': 155}, //+48
    
    frameX: {1:8, 2:56, 3:104, 4:152}, //+48
    
    currentFrame: 1,
    
    movementTime: 0,
    
    direction: 'down',
    
    coordX: 90,
    
    coordY: 100,
    
    init: function() {
        for (var i = 0; i < gGameEngine.images.length; i++) {
            if (gGameEngine.images[i].alt == "mainPlayer") {
                gGameEngine.mainPlayerImg = gGameEngine.images[i];
              
            }
        }
    
    },
    
    drawPlayer: function() {
        if (gInputEngine.actions['up'] == true) {
            this.direction = 'up';
            
            //check next tile
            this.nextTile = [Math.round(this.coordX/32), Math.round(this.coordY/32)];
            //collision detection
            if (gGameEngine.collision[this.nextTile] != true) {
                this.coordY--;
            }
            
            //animation when moving
            this.movementTime++;
        
            if (this.movementTime >= 6) {
                this.currentFrame = (this.currentFrame%4) + 1;
                this.movementTime = 0;
            }
        }
        
        else if (gInputEngine.actions['down'] == true) {
            this.direction = 'down'
            
            //check next tile
            this.nextTile = [Math.round(this.coordX/32), Math.round(this.coordY/32)];
            
            if (gGameEngine.collision[this.nextTile] != true) {
                this.coordY++;
            }

            //console.log(gInputEngine.actions);
            this.movementTime++;
        
            if (this.movementTime >= 6) {
                this.currentFrame = (this.currentFrame%4) + 1;
                this.movementTime = 0;
            }            
        }
        
        else if (gInputEngine.actions['left'] == true) {
            this.direction = 'left';
            
            //check next tile
            this.nextTile = [Math.round(this.coordX/32), Math.round(this.coordY/32)];
            
            //collision detection
            if (gGameEngine.collision[this.nextTile] != true) {
                this.coordX--;
            }

            
            this.movementTime++;
        
            if (this.movementTime >= 6) {
                this.currentFrame = (this.currentFrame%4) + 1;
                this.movementTime = 0;
            }             
        }
        
        
        else if (gInputEngine.actions['right'] == true) {
            this.direction = 'right';
            
            //check next tile
            this.nextTile = [Math.round(this.coordX/32), Math.round(this.coordY/32)];
            
            //collision detection
            if (gGameEngine.collision[this.nextTile] != true) {
                this.coordX++;
            }         
            
            this.movementTime++;
        
            if (this.movementTime >= 6) {
                this.currentFrame = (this.currentFrame%4) + 1;
                this.movementTime = 0;
            }             
        }     
        
        gGameEngine.ctx.drawImage(gGameEngine.mainPlayerImg, this.frameX[this.currentFrame], this.frameY[this.direction], 32, 32, this.coordX, this.coordY, 32, 32);
       
    }


});
