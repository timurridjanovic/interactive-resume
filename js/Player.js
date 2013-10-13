Player = Class.extend({

    frameY: {'down': 11, 'left': 59, 'up': 107, 'right': 155}, //+48
    
    frameX: [8, 56, 104, 152], //+48
    
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
            this.coordY--;
        }
        if (gInputEngine.actions['down'] == true) {
            this.direction = 'down';
            this.coordY++;
        }
        if (gInputEngine.actions['left'] == true) {
            this.direction = 'left';
            this.coordX--;
        }
        if (gInputEngine.actions['right'] == true) {
            this.direction = 'right';
            this.coordX++;
        }     
 
        gGameEngine.ctx.drawImage(gGameEngine.mainPlayerImg, 104, this.frameY[this.direction], 32, 32, this.coordX, this.coordY, 32, 32);
    
    }


});
