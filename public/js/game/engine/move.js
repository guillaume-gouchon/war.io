var move = {};


/**
*   CONSTANTS
*/
move.ASTAR_MAX_STEPS_SEARCH = 4;
move.DESTINATION_SEARCH_NUMBER = 5;
move.ASTAR_MAX_RADIUS_SEARCH = 10;


/**
*	Moves an element one step closer to its destination.
*/
move.moveElement = function (game, element, destination) {
  var elementData = tools.getElementData(element);
  
  if (game.iterate % accessors.getStat(game.players, element.o, elementData, fightLogic.STATS_BUFF.speed) == 0) {

        // if destination forbids movement, search neighbors for a new one
        var counter = 0;
        grosBoucle : while(game.grid[destination.x][destination.y].c > 0 && counter < this.DESTINATION_SEARCH_NUMBER) {
          counter ++;
          var endNeighbors = astar.neighbors(game.grid, destination.x, destination.y, true);
          for(var i in endNeighbors){
                if(endNeighbors[i].c == 0) {// if this tile is free, let's go there !
                  destination = endNeighbors[i];
                element.a.moveTo = {x : destination.x, y : destination.y};
                break grosBoucle;
              }
            }
            destination = {x: endNeighbors[1].x, y : endNeighbors[1].y};
          }

        if (destination.c > 0) {// if destination is unreachable for now, stop the movement
          element.a.moveTo = null;
          return;
        }
        
      	// use A* algorithm to find the path
      	var path = astar.search(game.grid, element.p, game.grid[destination.x][destination.y], true);

      	if(path.length > 0) {

  			// remove old position
        var shape = elementData.shape;
        for (var i in shape) {
          for (var j in shape[i]) {
           if (shape[i][j] > 0) {
            var partPosition = tools.getPartPosition(element, i, j);
            game.grid[partPosition.x][partPosition.y].c = 0;
          }
        }
      }

  			// update new position
  			element.p.x = path[0].x;
        element.p.y = path[0].y;
        for (var i in shape) {
          for (var j in shape[i]) {
           if (shape[i][j] > 0) {
            var partPosition = tools.getPartPosition(element, i, j);
            game.grid[partPosition.x][partPosition.y].c = element.id;
          }
        }
      }

      		// if element has arrived to its destination, updates its order
      		if(element.a.moveTo.x == element.p.x && element.a.moveTo.y == element.p.y) {
            
            if (element.a.type == action.ACTION_TYPES.move) {

              element.a = null;
              
              if (element.pa.length > 0) {
                
                order.goToElementNextOrder(game, element);
                
              }
              
            } else {

              element.a.moveTo = null;
              element.fl = gameData.ELEMENTS_FLAGS.nothing;

            }
          }
        }
      }
    }




/**
*   A* algorithm.
*/
var astar = {
  
  init: function(grid, start, end) {
    var xi = Math.max(0, Math.min(start.x, end.x) - move.ASTAR_MAX_RADIUS_SEARCH);
    var xf = Math.min(grid[0].length, Math.max(start.x, end.x) + move.ASTAR_MAX_RADIUS_SEARCH);
    var yi = Math.max(0, Math.min(start.y, end.y) - move.ASTAR_MAX_RADIUS_SEARCH);
    var yf = Math.min(grid.length, Math.max(start.y, end.y) + move.ASTAR_MAX_RADIUS_SEARCH);

    for(var x = xi; x < xf; x++) {
      for(var y = yi; y < yf; y++) {
        var node = grid[x][y];
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.cost = 1;
        node.visited = false;
        node.closed = false;
        node.parent = null;
      }
    }
  },

  heap: function() {
    return new BinaryHeap(function(node) { 
      return node.f; 
    });
  },

  search: function(grid, start, end, diagonal, heuristic) {
    astar.init(grid, start, end);
    heuristic = heuristic || astar.manhattan;
    diagonal = !!diagonal;

    var openHeap = astar.heap();

    openHeap.push(grid[start.x][start.y]);

    while(openHeap.size() > 0) {

      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      var currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path.
      if(currentNode === end || openHeap.size() > this.ASTAR_MAX_STEPS_SEARCH) {
        var curr = currentNode;
        var ret = [];
        while(curr.parent) {
          ret.push(curr);
          curr = curr.parent;
        }
        return ret.reverse();
      }
      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;

      // Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
      var neighbors = astar.neighbors(grid, currentNode.x, currentNode.y, diagonal);

      for(var i = 0, il = neighbors.length; i < il; i++) {
        var neighbor = neighbors[i];
        if(neighbor.closed || neighbor.c > 0) {
              // Not a valid node to process, skip to next neighbor.
              continue;
            }

          // The g score is the shortest distance from start to current node.
          // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
          var gScore = currentNode.g + neighbor.cost;
          var beenVisited = neighbor.visited;

          if(!beenVisited || gScore < neighbor.g) {
              // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
              neighbor.visited = true;
              neighbor.parent = currentNode;
              neighbor.h = neighbor.h || heuristic(neighbor, end);
              neighbor.g = gScore;
              neighbor.f = neighbor.g + neighbor.h;

              if (!beenVisited) {
                  // Pushing to heap will put it in proper place based on the 'f' value.
                  openHeap.push(neighbor);
                }
                else {
                  // Already seen the node, but since it has been rescored we need to reorder it in the heap
                  openHeap.rescoreElement(neighbor);
                }
              }
            }
          }

    // No result was found - empty array signifies failure to find path.
    return [];   
  },

  manhattan: function(pos0, pos1) {
      // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

      var d1 = Math.abs (pos1.x - pos0.x);
      var d2 = Math.abs (pos1.y - pos0.y);
      return d1 + d2;
    },

    neighbors: function(grid, x, y, diagonals) {
      var ret = [];

      // West
      if(grid[x-1] && grid[x-1][y]) {
        ret.push(grid[x-1][y]);
      }

      // East
      if(grid[x+1] && grid[x+1][y]) {
        ret.push(grid[x+1][y]);
      }

      // South
      if(grid[x] && grid[x][y-1]) {
        ret.push(grid[x][y-1]);
      }

      // North
      if(grid[x] && grid[x][y+1]) {
        ret.push(grid[x][y+1]);
      }

      if (diagonals) {

          // Southwest
          if(grid[x-1] && grid[x-1][y-1]) {
            ret.push(grid[x-1][y-1]);
          }

          // Southeast
          if(grid[x+1] && grid[x+1][y-1]) {
            ret.push(grid[x+1][y-1]);
          }

          // Northwest
          if(grid[x-1] && grid[x-1][y+1]) {
            ret.push(grid[x-1][y+1]);
          }

          // Northeast
          if(grid[x+1] && grid[x+1][y+1]) {
            ret.push(grid[x+1][y+1]);
          }

        }

        return ret;
      }

    };

// Binary Heap
// Taken from http://eloquentjavascript.net/appendix2.html
// License: http://creativecommons.org/licenses/by/3.0/
function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  },
  
  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  },
  remove: function(node) {
    var len = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < len; i++) {
      if (this.content[i] == node) {
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();
        if (i != len - 1) {
          this.content[i] = end;
          if (this.scoreFunction(end) < this.scoreFunction(node))
            this.sinkDown(i);
          else
            this.bubbleUp(i);
        }
        return;
      }
    }
    throw new Error("Node not found.");
  },

  size: function() {
    return this.content.length;
  },

  rescoreElement: function(node) {
    this.sinkDown(this.content.indexOf(node));
  },
  sinkDown: function(n) {
    // Fetch the element that has to be sunk.
    var element = this.content[n];
    // When at 0, an element can not sink any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
      parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to sink any further.
      else {
        break;
      }
    }
  },

  bubbleUp: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
    element = this.content[n],
    elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
        child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
        child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap != null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
};
