Player = Class.extend({
    
    init: function() {
        for (var i = 0; i < gGameEngine.images.length; i++) {
            if (gGameEngine.images[i].alt == "mainPlayer") {
                gGameEngine.mainPlayerImg = gGameEngine.images[i];
              
            }
        }
    
    },
    
    drawPlayer: function() {
        gGameEngine.ctx.drawImage(gGameEngine.mainPlayerImg, 0, 0, 32, 32, 90, 100, 32, 32);
    
    }


});
