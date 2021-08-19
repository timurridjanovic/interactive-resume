;
(function(exports) {
  class Character {
    frameY = {
      down: 11,
      left: 59,
      up: 107,
      right: 155
    };
    frameX = {
      1: 8,
      2: 56,
      3: 104,
      4: 152
    };
    currentFrame = 1;
    movementTime = 0;
    direction;
    coordX = 0;
    coordY = 0;
    positionTimeOne = 0;
    positionTimeTwo = 0;
    characterCoords = {};
    lines = [];
    typewriterLetterIndex = 0;
    typewriterLineIndex = 1;
    indexesPerLines = [];
    textToType = '';
    endOfText = false;
    directionFlag = {
      up: true,
      down: true,
      right: true,
      left: true
    };

    constructor(x, y, name, direction, destination) {
      var test = [x, y]

      if (test.toString() == destination.toString()) {
        this.coordX = x;
        this.coordY = y;

        this.destination = destination;
      } else { //making x and y coords divisible by the tileSize, only if characters are moving
        this.coordX = Math.floor(x / gGameEngine.tileSize) * gGameEngine.tileSize;
        this.coordY = Math.floor(y / gGameEngine.tileSize) * gGameEngine.tileSize;

        this.destination = [Math.floor(destination[0] / gGameEngine.tileSize) * gGameEngine.tileSize,
          Math.floor(destination[1] / gGameEngine.tileSize) * gGameEngine.tileSize
        ];
      }

      this.initialDirection = direction;
      this.direction = direction;
      this.imgName = name;


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

      //load text for dialogue
      this.dialogueText = null;
      this.loadDialogueText();
    }

    drawCharacter() {
      const mainPlayer = gGameEngine.mainPlayer;
      this.characterCoords.top = this.coordY;
      this.characterCoords.bottom = this.coordY + gGameEngine.tileSize;
      this.characterCoords.left = this.coordX;
      this.characterCoords.right = this.coordX + gGameEngine.tileSize;

      //storing coordinates in a collision dict
      gGameEngine.characterCollisions[this.imgName] = this.characterCoords;

      //collision with mainPlayer
      if (this.movingFlag == true) { //collision detection with player happens only if bot is moving
        if (!gGameEngine.collisionHandler([mainPlayer.characterCoords], this, 1)) {
          this.directionFlag.up = true;
          this.directionFlag.down = true;
          this.directionFlag.left = true;
          this.directionFlag.right = true;
          this.movingFlag = true;
        }
      }

      //collision with collision tiles
      if (!gGameEngine.collisionHandler(gGameEngine.collision, this, 1)) {
        this.directionFlag.up = true;
        this.directionFlag.down = true;
        this.directionFlag.left = true;
        this.directionFlag.right = true;
        this.movingFlag = true;
      }

      //a* path finding
      if (this.pathSet == false) {
        this.path = this.aStarPathFinder(gGameEngine); // execute this only once
        this.pathSet = true;
      }

      //path index (starts at 1)
      let i = this.pathIndex;

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
      } else { // if there is no path, the bot is not moving
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
          this.currentFrame = (this.currentFrame % 4) + 1;
          this.movementTime = 0;
        }
      }

      //selecting character img to draw
      let image
      for (let i = 0; i < gGameEngine.characterImgs.length; i++) {
        if (gGameEngine.characterImgs[i].alt == this.imgName) {
          image = gGameEngine.characterImgs[i];
        }
      }
      //drawing if on canvas
      if (gGameEngine.isTileOnCanvas(this.characterCoords)) {
        gGameEngine.ctx.beginPath();

        gGameEngine.ctx.drawImage(image, this.frameX[this.currentFrame],
          this.frameY[this.direction], 32, 32, this.coordX, this.coordY, 32, 32);

        gGameEngine.ctx.closePath();
      }
    }

    aStarPathFinder() {
      const start = new Node(this.startingPoint[0], this.startingPoint[1], this.destination, 0);
      const destination = new Node(this.destination[0], this.destination[1], this.destination);

      const open = [];
      const closed = [];

      //Push the start node onto the list of open nodes
      open.push(start);
      //Keep going while there's nodes in our open list
      while (open.length > 0) {
        Node.sortByCost(open);

        const current_node = open.splice(0, 1)[0];

        //Check if we've reached our destination
        if (Node.same(current_node, destination)) {
          destination.parent = current_node;
          return destination.recreatePath();
        }

        const neighbor_list = current_node.neighbors(destination);

        for (var j = 0; j < neighbor_list.length; j++) {
          const neighbor = neighbor_list[j];

          //if new node is open
          if (!neighbor.colliding()) {
            if (retrieve(closed, neighbor, Node.same) !== undefined) {
              continue;
            }
            if (retrieve(open, neighbor, Node.same) === undefined) {
              open.push(neighbor);
            }
          }
        }
      }

      return [];
    }

    checkSpaceEvent() {
      const mainPlayer = gGameEngine.mainPlayer;
      const gapUp = 12;
      if (gInputEngine.actions['space'] == true) {
        this.dialogue = true;
      }

      if (this.dialogue) {
        //mainPlayer is on top of the bot
        if (mainPlayer.coordY + gGameEngine.tileSize - 2 - gapUp <= this.coordY && mainPlayer.coordY +
          gGameEngine.tileSize >= this.coordY && mainPlayer.coordX +
          (gGameEngine.tileSize / 2) >= this.coordX && mainPlayer.coordX + (gGameEngine.tileSize / 2) <=
          this.coordX + gGameEngine.tileSize) {

          this.stopMoving();
          this.direction = 'up';
          this.dialogueBox = true;
        }
        //mainPlayer is on bottom of bot
        else if (mainPlayer.coordY >= this.coordY + gGameEngine.tileSize - 2 - gapUp && mainPlayer.coordY <=
          this.coordY + gGameEngine.tileSize && mainPlayer.coordX +
          gGameEngine.tileSize / 2 >= this.coordX && mainPlayer.coordX + gGameEngine.tileSize / 2 <=
          this.coordX + gGameEngine.tileSize) {

          this.stopMoving();
          this.direction = 'down';
          this.dialogueBox = true;
        }
        //mainPlayer is on the right of the bot
        else if ((mainPlayer.coordX == this.coordX + gGameEngine.tileSize - 1 || mainPlayer.coordX ==
            this.coordX + gGameEngine.tileSize - 2) && mainPlayer.coordY +
          gGameEngine.tileSize / 2 >= this.coordY && mainPlayer.coordY + gGameEngine.tileSize / 2 <=
          this.coordY + gGameEngine.tileSize) {

          this.stopMoving();
          this.direction = 'right';
          this.dialogueBox = true;

        }
        //mainPlayer is on the left of the bot
        else if ((mainPlayer.coordX + gGameEngine.tileSize - 1 == this.coordX || mainPlayer.coordX +
            gGameEngine.tileSize - 2 == this.coordX) && mainPlayer.coordY +
          gGameEngine.tileSize / 2 >= this.coordY && mainPlayer.coordY + gGameEngine.tileSize / 2 <=
          this.coordY + gGameEngine.tileSize) {

          this.stopMoving();
          this.direction = 'left';
          this.dialogueBox = true;

        } else {
          this.dialogueBox = false;
          this.dialogue = false;
          this.lines = [];
          this.typewriterLetterIndex = 0;
          this.typewriterLineIndex = 1;
          this.indexesPerLines = [];
          if (this.path.length <= 1)
            this.direction = this.initialDirection;
        }
      }
    }

    stopMoving() {
      this.directionFlag.up = false;
      this.directionFlag.down = false;
      this.directionFlag.left = false;
      this.directionFlag.right = false;
      this.movingFlag = false;
    }

    drawDialogueBox() {
      const translatedContext = gGameEngine.translatedContext(10, 250);
      const translatedX = translatedContext[0];
      const translatedY = translatedContext[1];

      const width = 780;
      const height = 140;

      //drawing dialogue boxes
      gGameEngine.ctx.beginPath();
      gGameEngine.ctx.fillStyle = '#202020';
      gGameEngine.ctx.fillRect(translatedX, translatedY, width, height);
      gGameEngine.ctx.strokeStyle = '#DDDDDD';
      gGameEngine.ctx.lineWidth = '3';
      gGameEngine.ctx.strokeRect(translatedX, translatedY, width, height);
      gGameEngine.ctx.closePath();

      this.typewriter(translatedX, translatedY, width, height);
    }

    typewriter(translatedX, translatedY, width, height) {
      var maxWidth = 320;
      var maxLines = 5;
      var text = '';

      //check to see if mainPlayer talked to the right people...
      if (this.imgName == "character_three" || gGameEngine.talkedToAlice == true) { //character_three is Alice
        text = this.dialogueText['text'];
        gGameEngine.talkedToAlice = true;
      } else {
        text = this.dialogueText['notMyTurn'];
      }

      var cursorX = 10;
      var lineHeight = 25;
      var words = text.split(' ');

      var separationIndex = 0;
      var found_first_you = false;

      this.test = words;
      //only create lines if they haven't been created yet
      if (this.lines.length <= 0) {
        for (var i = 0; i < words.length; i++) {
          if (gGameEngine.ctx.measureText(words.slice(separationIndex, i).join(' ')).width >=
            maxWidth || (words[i] == words[i].match(/[A-Z-:]*/g).join('') &&
              words[i].match(/[A-Z-:]*/g).join('').length > 3 && found_first_you)) {

            this.lines.push(words.slice(separationIndex, i).join(' '));
            separationIndex = i;
          }

          if (words[i] == words[i].match(/[A-Z-:]*/g).join('') &&
            words[i].match(/[A-Z-:]*/g).join('').length > 3) {

            found_first_you = true;
          }
        }
        if (words.slice(separationIndex, i).join(' ') == words.slice(separationIndex).join(' ')) {
          this.lines.push(words.slice(separationIndex, i).join(' '));
        }
      }

      var i = this.typewriterLetterIndex;
      var j = this.typewriterLineIndex;

      if (j > maxLines) {
        if (gInputEngine.actions['space'] == true) {
          this.lines = this.lines.slice(maxLines);
          this.indexesPerLines = [];
          this.typewriterLineIndex = 1;
          j = this.typewriterLineIndex;
        }
      } else {
        if (i < this.lines[j - 1].length) {
          this.typewriterLetterIndex++;
        } else {
          if (j < this.lines.length && j <= maxLines) {
            if (this.lines[j].slice(0, 4) == this.lines[j].slice(0, 4).match(/[A-Z-:]*/g).join('')) {
              if (gInputEngine.actions['space'] == true) {
                this.typewriterLineIndex++;
                this.indexesPerLines.push(i);
                this.typewriterLetterIndex = 0;
              }
            } else {
              this.typewriterLineIndex++;
              this.indexesPerLines.push(i);
              this.typewriterLetterIndex = 0;
            }
          }
        }
      }

      gGameEngine.ctx.fillStyle = '#DDDDDD';
      gGameEngine.ctx.font = '20px sans-serif';

      for (var x = 0; x < j - 1; x++) {
        gGameEngine.ctx.fillText(this.lines.slice(x, j).join().slice(0, this.indexesPerLines[x]),
          translatedX + cursorX, translatedY + lineHeight * (x + 1));
      }

      if (x == j - 1) {
        gGameEngine.ctx.fillText(this.lines.slice(x, j).join().slice(0, i), translatedX +
          cursorX, translatedY + lineHeight * (x + 1));
      }
    }

    loadDialogueText() {
      fetch(`text/${this.imgName}.json`)
        .then(response => response.json())
        .then(json => {
          this.dialogueText = json;
        })
        .catch(err => {
          throw new Error(`Impossible to load text: ${err}`);
        });
    }
  }

  const Node = function(x, y, destination, g, parent) {
    this.h = (Math.abs(x - destination.x) + Math.abs(y - destination.y)) / gGameEngine.tileSize;
    this.x = x;
    this.y = y;
    this.g = g;
    this.f = this.g + this.h;
    this.parent = parent;
  }

  Node.prototype = {
    neighbors: function(destination) {
      var g = this.g + 1;
      return [
        new Node(this.x + gGameEngine.tileSize, this.y, destination, g, this),
        new Node(this.x - gGameEngine.tileSize, this.y, destination, g, this),
        new Node(this.x, this.y + gGameEngine.tileSize, destination, g, this),
        new Node(this.x, this.y - gGameEngine.tileSize, destination, g, this)
      ];

    },

    colliding: function() {
      //transformation into data sctructure we need for intersectRect
      this.characterCoords = {
        'top': this.y,
        'bottom': this.y + gGameEngine.tileSize,
        'right': this.x + gGameEngine.tileSize,
        'left': this.x
      };

      return gGameEngine.intersectRect(gGameEngine.collision, this);
    },

    recreatePath: function() {
      var node = this;
      var path = [];

      //Go up the chain to recreate the path
      while (node.parent !== undefined) {
        node = node.parent;
        path.unshift(node); //unshift adds node to the beginning of the array
      }

      return path;
    },
  };

  Node.sortByCost = function(nodes) {
    //quicksort
    /*if (nodes.length <= 1)
        return nodes;

    var greater = [];
    var lesser = [];
    var pivot = nodes.pop();

    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].f >= pivot.f)
            greater.push(nodes[i]);
        else if (nodes[i].f < pivot.f)
            lesser.push(nodes[i]);
    }
    return Node.sortByCost(lesser).concat(pivot, Node.sortByCost(greater));*/

    nodes.sort(function(a, b) {
      return a.f - b.f;
    });
  };

  Node.same = function(node1, node2) {
    return node1.x == node2.x && node1.y == node2.y;
  };

  const retrieve = function(array, item, same) {
    for (var i = 0; i < array.length; i++) {
      if (same(array[i], item)) {
        return array[i];
      }
    }
  };

  exports.Character = Character;
})(this);

