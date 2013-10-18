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
        this.coordX = x;
        this.coordY = y;
        this.direction = direction;
        this.imgName = name;
        this.destination = destination;
        this.startingPoint = [x, y];
        for (var i = 0; i < gGameEngine.images.length; i++) {
            if (gGameEngine.images[i].alt == name) {
                gGameEngine.characterImgs.push(gGameEngine.images[i]);
              
            }
        }
        
        //keeping track of all object names in a list
        gGameEngine.allCharacters.push(name);
        
        // path finding algo
        this.path = this.aStarPathFinder();
    
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
            if (!gGameEngine.collisionHandler([mainPlayer.characterCoords], this)) {
                this.directionFlag.up = true;
                this.directionFlag.down = true;
                this.directionFlag.left = true;
                this.directionFlag.right = true; 
                this.movingFlag = true;
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
        //for (var i in this.path) {
            //if (this.coordX this.path[i]
        //}
        
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
        var start = new this.node(this.startingPoint[0], this.startingPoint[1], -1, -1, -1, -1);
        var destination = new this.node(this.destination[0], this.destination[1], -1, -1, -1, -1);
        var columns = gGameEngine.tilesY * gGameEngine.tileSize;
        var rows = gGameEngine.tilesY * gGameEngine.tileSize;
        
        var open = [];
        var closed = [];
        
        var g = 0; //Cost from start to current node
        var h = this.heuristic(start, destination);
        var f = g + h;
        
        //Push the start node onto the list of open nodes
        open.push(start);
        
        //Keep going while there's nodes in our open list
        while (open.length > 0) {
            
            var best_cost = open[0].f;
            var best_node = 0;
            
            for (var i = 1; i < open.length; i++) {
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
                console.log(path);
                return path;            
            }
            
            //Remove the current node from our open list
            open.splice(best_node, 1);
            
            //Push it onto the closed list
            closed.push(current_node);
            
            //Check to see the best neighbor (in all 4 directions)
            for (var new_node_x = Math.max(0, current_node.x-1); new_node_x <= 
                Math.min(columns-1, current_node.x+1); new_node_x++) {
                for (var new_node_y = Math.max(0, current_node.y-1); new_node_y <= 
                    Math.min(rows-1, current_node.y+1); new_node_y++) {
                    
                    //disallow diagonals
					if (new_node_x != current_node.x && new_node_y != current_node.y)
						continue;                    
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
                        for (var i in closed) {
                            if (closed[i].x == new_node_x && closed[i].y == new_node_y) {
                                found_in_closed = true;
                                break;
                            }
                        }
                        
                        if (found_in_closed)
                            continue;
                            
                        //See if the node is in our open list. If not, use it.
                        var found_in_open = false;
                        for (var i in open) {
                            if (open[i].x == new_node_x && open[i].y == new_node_y) {
                                found_in_open = true;
                                break;
                            }
                        }
                        
                        if (!found_in_open) {
                            var new_node = new this.node(new_node_x, new_node_y, closed.length-1, -1, -1, -1);
                            
                            new_node.g = current_node.g + Math.floor(Math.sqrt(Math.pow(new_node.x - current_node.x, 2) + 
                                Math.pow(new_node.y - current_node.y, 2)));
                                
                            new_node.h = this.heuristic(new_node, destination);
                            new_node.f = new_node.g + new_node.h;
                            
                            open.push(new_node);    
                        }      	        
                    }
                }       
            }
        }
        
        return [];
    },
    
    
    heuristic: function(current_node, destination) {
	    var x = current_node.x-destination.x;
	    var y = current_node.y-destination.y;
	    return x*x+y*y;
        
    },
    
    
    node: function(x, y, parent_index, g, h, f) {
	    this.x = x;
	    this.y = y;
	    this.parent_index = parent_index;
	    this.g = g;
	    this.h = h;
	    this.f = f;    
    }


});
