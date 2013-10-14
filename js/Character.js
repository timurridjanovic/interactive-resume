Character = Class.extend({

    frameY: {'down': 11, 'left': 59, 'up': 107, 'right': 155}, //+48
    
    frameX: {1:9, 2:57, 3:105, 4:153}, //+48
    
    currentFrame: 1,
    
    movementTime: 0,
    
    direction: null,
    
    coordX: 0,
    
    coordY: 0,
    
    positionTimeOne: 0,
    
    positionTimeTwo: 0,
    
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
    
    },
    
    drawCharacter: function() {  
        if (this.direction == 'down') {
            this.coordY++;
            this.positionTimeOne++;
        }
            
        if (this.direction == 'up') {
        	this.coordY--;
        	this.positionTimeTwo++;
        }   
        
        if (this.positionTimeOne >= 100) {
        	this.direction = 'up';
        	this.positionTimeOne = 0;
        }
        
        if (this.positionTimeTwo >= 100) {
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
        
        gGameEngine.ctx.drawImage(image, this.frameX[this.currentFrame], this.frameY[this.direction], 32, 32, this.coordX, this.coordY, 32, 32);
       
    }


});
