;(function(exports) {
    exports.Character = Class.extend({

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
            var start = new Node(this.startingPoint[0], this.startingPoint[1], -1,
                                 this.destination, 0);
            var destination = new Node(this.destination[0], this.destination[1], -1,
                                       this.destination, 0);
            var columns = gGameEngine.tilesY * gGameEngine.tileSize;
            var rows = gGameEngine.tilesY * gGameEngine.tileSize;

            var open = [];
            var closed = [];

            //Push the start node onto the list of open nodes
            open.push(start);

            //Keep going while there's nodes in our open list
            while (open.length > 0) {
                Node.sortByCost(open);

                // get next node, remove it from open, put in on closed
                var current_node = open.splice(0, 1)[0];
                closed.push(current_node);

                //Check if we've reached our destination
                if (Node.same(current_node, destination)) {
                    destination.parent_index = closed.length - 1;
                    return Node.recreatePath(destination, closed);
                }

                var neighbor_list = current_node.neighbors(this.destination, closed.length-1);
                for (var j = 0; j < neighbor_list.length; j++) {
                    var neighbor = neighbor_list[j];
                    //if new node is open
                    if (!neighbor.colliding()) {
                        if (contains(closed, neighbor, Node.same)) {
                            continue;
                        } else if (!contains(open, neighbor, Node.same)) {
                            open.push(neighbor);
                        }
                    }
                }
            }

            return [];
        },

        checkSpaceEvent: function() {
            var gapUp = 12;
            if (gInputEngine.actions['space'] == true) {
                this.dialogue = true;
            }

            if (this.dialogue == true) {
                //mainPlayer is on the right of the bot
                if (mainPlayer.coordX == this.coordX + gGameEngine.tileSize - 1) {
                    this.stopMoving();
                    this.direction = 'right';

                }

                if (mainPlayer.coordX + gGameEngine.tileSize - 1 == this.coordX) {
                    this.stopMoving();
                    this.direction = 'left';

                }

                if (mainPlayer.coordY + gGameEngine.tileSize - 1 - gapUp == this.coordY) {
                    this.stopMoving();
                    this.direction = 'up';

                }

                if (mainPlayer.coordY == this.coordY + gGameEngine.tileSize - 1 - gapUp) {
                    this.stopMoving();
                    this.direction = 'down';
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

    var Node = function(x, y, parent_index, destination, g) {
	      var h = Math.abs(x-destination[0]) + Math.abs(y - destination[1]);
	      this.x = x;
	      this.y = y;
	      this.parent_index = parent_index;
	      this.g = g;
	      this.f = this.g + h;
    };

    Node.prototype = {
        neighbors: function(destination, parentIndex) {
            var neighbors = [];
            var g = this.g + 1;
            neighbors.push(new Node(this.x + gGameEngine.tileSize, this.y, parentIndex,
                                    destination, g));
            neighbors.push(new Node(this.x - gGameEngine.tileSize, this.y, parentIndex,
                                    destination, g));
            neighbors.push(new Node(this.x, this.y + gGameEngine.tileSize, parentIndex,
                                    destination, g));
            neighbors.push(new Node(this.x, this.y - gGameEngine.tileSize, parentIndex,
                                    destination, g));
            return neighbors;
        },

        colliding: function() {
            this.characterCoords = {
                'top': this.y,
                'bottom': this.y + gGameEngine.tileSize,
                'right': this.x + gGameEngine.tileSize,
                'left': this.x
            };

            return gGameEngine.intersectRect(gGameEngine.collision, this);
        }
    };

    Node.sortByCost = function(nodes) {
        nodes.sort(function(a, b) { // does not return because mutates orig array
            return a.f - b.f;
        });
    };

    Node.same = function(node1, node2) {
        return node1.x == node2.x && node1.y == node2.y
    };

    Node.recreatePath = function(current_node, nodes) {
        var path = [];

        //Go up the chain to recreate the path
        while (current_node.parent_index != -1) {
            current_node = nodes[current_node.parent_index];
            path.unshift(current_node);
        }
        return path;
    };

    var contains = function(array, item, same) {
        for (var i = 0; i < array.length; i++) {
            if (same(array[i], item)) {
                return true;
            }
        }
        return false;
    };
})(this);
