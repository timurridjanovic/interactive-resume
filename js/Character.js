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
    
    init: function(x, y, name, direction, destination) {
        //making x and y coords divisible by the tileSize
        this.coordX = Math.floor(x / gGameEngine.tileSize) * gGameEngine.tileSize;
        this.coordY = Math.floor(y / gGameEngine.tileSize) * gGameEngine.tileSize;
        
        this.direction = direction;
        this.imgName = name;
        this.destination = [Math.floor(destination[0] / gGameEngine.tileSize) * gGameEngine.tileSize,
                            Math.floor(destination[1] / gGameEngine.tileSize) * gGameEngine.tileSize];
                            
        this.startingPoint = [this.coordX, this.coordY];
        for (var i = 0; i < gGameEngine.images.length; i++) {
            if (gGameEngine.images[i].alt == name) {
                gGameEngine.characterImgs.push(gGameEngine.images[i]);
              
            }
        }
        
        //keeping track of all object names in a list
        gGameEngine.allCharacters.push(name);
        
        // Index for path finding algo
        this.path = [];
        this.pathIndex = 0;
        this.pathSet = false;
    
    },
    
    drawCharacter: function() { 
    	
        this.characterCoords.top = this.coordY;
        this.characterCoords.bottom = this.coordY + gGameEngine.tileSize;
        this.characterCoords.left = this.coordX;
        this.characterCoords.right = this.coordX + gGameEngine.tileSize;

        //storing coordinates in a collision dict
        gGameEngine.characterCollisions[this.imgName] = this.characterCoords;

        //checking to see if character is stuck in between 2 tiles
        if (gGameEngine.intersectRect([mainPlayer.characterCoords], this) && gGameEngine.intersectRect(gGameEngine.collision, this)) {
            console.log('stuck');
            this.directionFlag.up = false;
            this.directionFlag.down = false;
            this.directionFlag.left = false;
            this.directionFlag.right = false;    
        }
        //if the character is not stuck, we can do normal collision detection...
        else {
            //collision with mainPlayer
            if (this.movingFlag == true) { //collision detection with player happens only if bot is moving
                if (!gGameEngine.collisionHandler([mainPlayer.characterCoords], this)) {
                    this.directionFlag.up = true;
                    this.directionFlag.down = true;
                    this.directionFlag.left = true;
                    this.directionFlag.right = true; 
                    this.movingFlag = true;
                }
            }    
            

            //collision with collision tiles
            if (!gGameEngine.collisionHandler(gGameEngine.collision, this)) {
                this.directionFlag.up = true;
                this.directionFlag.down = true;
                this.directionFlag.left = true;
                this.directionFlag.right = true;
                this.movingFlag = true;			
            }
        }

        
        //a* path finding 
        if (this.pathSet == false) {
            this.path = this.aStarPathFinder(); // execute this only once
            this.pathSet = true;
        }
            
        //path index (starts at 1)
        var i = this.pathIndex;
        
        //increment path if you get to node of path
        if (this.coordX == this.path[i].x && this.coordY == this.path[i].y) {
            this.pathIndex++;
            i++;
        }
        
        if (this.path.length > 1) {
            if (this.coordX < this.path[i].x) 
                this.direction = 'right';
            if (this.coordX > this.path[i].x)
                this.direction = 'left';
            if (this.coordY < this.path[i].y)
                this.direction = 'down';
            if (this.coordY > this.path[i].y)
                this.direction = 'up';        
        }
        
        else { // if there is no path, the bot is not moving
            this.stopMoving();      
        }
        
        //what happens when you're at the end of the path...    
        if (this.pathIndex >= this.path.length - 1) {
            this.path = this.path.reverse();
            this.pathIndex = 0;
        }

        //check for space event 
        this.checkSpaceEvent();    
        
        //direction handling

        if (this.direction == 'down' && this.directionFlag.down == true) {
            this.coordY++;
        }
            
        if (this.direction == 'up' && this.directionFlag.up == true) {
            this.coordY--;
        }   

        if (this.direction == 'right' && this.directionFlag.right == true) {
            this.coordX++;
        }

        if (this.direction == 'left' && this.directionFlag.left == true) {
            this.coordX--;
        }        
                
        //animation when moving
        if (this.movingFlag == true) {
            this.movementTime++;

            if (this.movementTime >= 6) {
                this.currentFrame = (this.currentFrame%4) + 1;
                this.movementTime = 0;
            }        
        }  
        

        //selecting character img to draw
        for (var i = 0; i < gGameEngine.characterImgs.length; i++) {
            if (gGameEngine.characterImgs[i].alt == this.imgName) {
                var image = gGameEngine.characterImgs[i];
            }
        }
        //drawing
        gGameEngine.ctx.drawImage(image, this.frameX[this.currentFrame], 
            this.frameY[this.direction], 32, 32, this.coordX, this.coordY, 32, 32);
    },


    aStarPathFinder: function() {
        var start = new this.node(this.startingPoint[0], this.startingPoint[1], -1, this.startingPoint, this.destination, 0);
        var destination = new this.node(this.destination[0], this.destination[1], -1, this.startingPoint, this.destination, 0);
        var columns = gGameEngine.tilesY * gGameEngine.tileSize;
        var rows = gGameEngine.tilesY * gGameEngine.tileSize;
        
        var open = [];
        var closed = [];

        //Push the start node onto the list of open nodes
        open.push(start);
        
        //Keep going while there's nodes in our open list
        while (open.length > 0) {
            
            var best_cost = open[0].f;
            var best_node = 0;
            
            for (var i = 0; i < open.length; i++) {
                if (open[i].f < best_cost) {
                    best_cost = open[i].f;
                    best_node = i;
                }
            }
            
            //Set it as our current node
            var current_node = open[best_node];  
        
            //Check if we've reached our destination
            if (current_node.x == destination.x && current_node.y == destination.y) {
                var path = [destination]; //Initialize the path with the destination node
                
                //Go up the chain to recreate the path
                while (current_node.parent_index != -1) {
                    current_node = closed[current_node.parent_index];
                    path.unshift(current_node);
                }
                return path;            
            }
            
            //Remove the current node from our open list
            open.splice(best_node, 1);
            
            //Push it onto the closed list
            closed.push(current_node);
            
            //Check to see the best neighbor (in all 4 directions)
            var neighbor_list = [];
            neighbor_list.push([current_node.x + gGameEngine.tileSize, current_node.y]);
            neighbor_list.push([current_node.x - gGameEngine.tileSize, current_node.y]);
            neighbor_list.push([current_node.x, current_node.y + gGameEngine.tileSize]);
            neighbor_list.push([current_node.x, current_node.y - gGameEngine.tileSize]);
            
            for (var j = 0; j < neighbor_list.length; j++) {
                var new_node_x = Math.max(0, neighbor_list[j][0]);
                var new_node_y = Math.max(0, neighbor_list[j][1]);
                
                //disallow diagonals
				//if (new_node_x != current_node.x && new_node_y != current_node.y)
					//continue;                    
                // transformation into data structure which our method intersectRect can take
                var neighbor = {};
                neighbor.characterCoords = {'top': new_node_y, 
                                            'bottom': new_node_y + gGameEngine.tileSize, 
                                            'right': new_node_x + gGameEngine.tileSize, 
                                            'left': new_node_x};
                //if new node is open                            
                if (!gGameEngine.intersectRect(gGameEngine.collision, neighbor)
                    || (destination.x == new_node_x && destination.y == new_node_y)) { //or new node is our destination
                    
                    //see if the node is already in our closed list.
                    var found_in_closed = false;
                    for (var i = 0; i < closed.length; i++) {
                        if (closed[i].x == new_node_x && closed[i].y == new_node_y) {
                            found_in_closed = true;
                            break;
                        }
                    }
                    
                    if (found_in_closed)
                        continue;
                        
                    //See if the node is in our open list. If not, use it.
                    var found_in_open = false;
                    for (var i = 0; i < open.length; i++) {
                        if (open[i].x == new_node_x && open[i].y == new_node_y) {
                            found_in_open = true;
                            break;
                        }
                    }
                    
                    if (!found_in_open) {
                        var new_node = new this.node(new_node_x, new_node_y, closed.length-1, 
                            this.startingPoint, this.destination, current_node.g+1);
                        open.push(new_node);    
                    }      	        
                }
            }
        }
        
        return [];
    },
    
    
    node: function(x, y, parent_index, startingPoint, destination, g) {
	    this.x = x;
	    this.y = y;
	    this.parent_index = parent_index;
	    this.g = g;
	    this.h = Math.abs(x-destination[0]) + Math.abs(y - destination[1]);
	    this.f = this.g + this.h;    
    },
    
    checkSpaceEvent: function() {
        var gapUp = 12;
        if (gInputEngine.actions['space'] == true) {
            //mainPlayer is on the right of the bot
            if (mainPlayer.coordX == this.coordX + gGameEngine.tileSize - 1 || mainPlayer.coordX == this.coordX + gGameEngine.tileSize - 2) {
                this.direction = 'right';
                this.stopMoving();
            }    
            
            if (mainPlayer.coordX + gGameEngine.tileSize - 1 == this.coordX || mainPlayer.coordX + gGameEngine.tileSize - 2 == this.coordX) {
                this.direction = 'left';
                this.stopMoving();
            } 
            
            if (mainPlayer.coordY + gGameEngine.tileSize - 1 - gapUp == this.coordY || mainPlayer.coordY + gGameEngine.tileSize - 2 - gapUp == this.coordY) {
                this.direction = 'up';
                this.stopMoving();
            }
            
            if (mainPlayer.coordY == this.coordY + gGameEngine.tileSize - 1 - gapUp || mainPlayer.coordY == this.coordY + gGameEngine.tileSize - 2 - gapUp) {
                this.direction = 'down';
                this.stopMoving(); 
            }
            
                
        
        }  
    },
    
    
    stopMoving: function() {
        this.directionFlag.up = false;
        this.directionFlag.down = false;
        this.directionFlag.left = false;
        this.directionFlag.right = false; 
        this.movingFlag = false;  
    }


});
