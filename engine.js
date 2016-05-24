var SquareType = {
    BOT: 0,
    MID: 1,
    TOP: 2
};
Object.freeze(SquareType);

var Square = function() {
    this.type = -1;
    this.column = -1;
    this.depth = -1;
    this.rel = {
        up: null,
        down: null,
        left: null,
        right: null
    };
    this.coord = {};

    // calc and cache x/y in terms of square widths
    this.genCoords = function() {
        this.coord.x = this.column+0.5;

        if (this.type == SquareType.MID) {
            this.coord.y = 6;
        } else {
            let x = this.column - 3.5;
            let d = this.depth -.5;
            let y = Math.sqrt((d*d) - (x*x));

            this.coord.y = ((this.type == SquareType.BOT)?y:-y)+6;
        }
    };
};

var PieceColor = {
    LIGHT: 0,
    DARK: 1
};
Object.freeze(PieceColor);

var PieceType = {
    PAWN: 0,
    ROOK: 1,
    KNIGHT: 2,
    BISHOP: 3,
    KING: 4,
    QUEEN: 5
};
Object.freeze(PieceType);

var PieceMoves = {
    // orthogonal, diagonal, forward, knight
    // limit zero if no limit
    PAWN: { dir: "f", lim: 2 },
    ROOK: { dir: "o", lim: 0 },
    KNIGHT: { dir: "k", lim: 1 },
    BISHOP: { dir: "d", lim: 0 },
    KING: { dir: "od", lim: 1 },
    QUEEN: { dir: "od", lim: 0 }
};
Object.freeze(PieceMoves);

var PieceChar = {
    PAWN: "♟",
    ROOK: "♜",
    KNIGHT: "♞",
    BISHOP: "♝",
    KING: "♚",
    QUEEN: "♛"
};
Object.freeze(PieceChar);

var Piece = function() {
    this.color = -1;
    this.type = -1;
    this.char = "X";
    this.location = null;
    this.moves = null;
    this.forward = null; // directionality for pawn
    
    // return 2D array of possible destination squares
    this.getPaths = function(board) {
        let ret = [];
        ret.push([this.location]); // no move
        
        if(this.moves.dir == "f" && this.moves.lim == 2) {
            // pawn move
            // forward
            if(!board.pieceOn(this.location.rel[this.forward])) {
                ret.push([
                        this.location.rel[this.forward],
                        this.location.rel[this.forward].rel[
                            board.translateRel(
                                this.location,
                                this.location.rel[this.forward],
                                this.forward
                            )]
                    ]);
            }
            // diag attack
        } else if (this.moves.dir == "k" && this.moves.lim == 1) {
            // knight moves
        } else {
            if(this.moves.dir.match(/o/)) {
                // orthogonal moves
            }
            if(this.moves.dir.match(/d/)) {
                // diagonal moves
            }
        }
        
        return ret;
    };
};
    
var Board = function() {
    this.size = 64;
    this.pieceCount = 32;
    this.square = new Array(this.size);
    this.piece = new Array(this.pieces);
    
    // return reference to node closest to x,y from n-dimensional array
    this.nodeNearest = function(srcCoord, list) {
        let dist = function(n, m) {
            return Math.sqrt((n.x-m.x)*(n.x-m.x) + (n.y-m.y)*(n.y-m.y));
        };

        let initial = function(arr) {
            return Array.isArray(arr[0])?initial(arr[0]):arr[0];
        };

        let min_in = function(from, arr, pmin) {
            let min = (pmin)?pmin:initial(arr), curr;
            for(let item of arr) {
                curr = Array.isArray(item)?min_in(from, item, pmin):item;
                if(dist(from, curr.coord) < dist(from, min.coord)) {
                    min = curr;
                }
            }
            return min;
        };

        return min_in(srcCoord, list);
    };

    this.pieceOn = function(square) {
        for (let i=0; i<this.pieceCount; i++) {
            if(this.piece[i].location == square) {
                return this.piece[i];
            }
        }
        return null;
    };
    
    // TODO Remove
    this.canMove = function(piece, location) {
        return !(this.pieceOn(location));
    };

    this.move = function(piece, location) {
        piece.location = location;
    };
    
    // return destination square corrected for SquareType boundaries
    this.translateRel = function(prev, curr, direction) {
        // indexed directions counterclockwise
        let idirs = [ 'up', 'left', 'down', 'right' ];
        
        if(prev.column < 4 && curr.column < 4) { // left side
            if(prev.type == SquareType.BOT && curr.type != prev.type) {
                console.log("A");
                return idirs[(idirs.indexOf(direction)+1)%idirs.length];
            } else if(curr.type == SquareType.BOT && curr.type != prev.type) {
                console.log("B");
                return idirs[(idirs.indexOf(direction)+3)%idirs.length];
            }
        } else if(prev.column > 3 && curr.column > 3) { // right side
            if(prev.type == SquareType.TOP && curr.type != prev.type) {
                console.log("C");
                return idirs[(idirs.indexOf(direction)+1)%idirs.length];
            } else if(curr.type == SquareType.TOP && curr.type != prev.type) {
                console.log("D");
                return idirs[(idirs.indexOf(direction)+3)%idirs.length];
            }
        } else { // crossing left/right
            if(prev.type == curr.type) { // if within the same layer
                if(prev.type == SquareType.MID) { // if layer is mid
                    if(prev.column < 4) { // switch rotation based on side
                        return idirs[(idirs.indexOf(direction)+1)%idirs.length];
                    } else {
                        return idirs[(idirs.indexOf(direction)+3)%idirs.length];
                    }
                }
            } else { // if not within same layer
                alert("THIS ACTION CURRENTLY ENCOUNTERS A BUG.\n\
I AM VERY SORRY.\n\
DO NOT PANIC.");
            }
        }
        
        return direction; // no change
    }
    
    // define logical coords for nodes
    for (let i=0; i<this.size; i++) {
        this.square[i] = new Square();
        let s = this.square[i];
        if (i<28) {
            s.type = SquareType.BOT;
            if (i<16) {         // bottom two rows
                s.column = i%8;
                s.depth = 6-Math.floor(i/8);
            } else if (i<22) {  // third from bottom
                s.column = (i-15)%8;
                s.depth = 4;
            } else if (i<26) {  // second from center
                s.column = (i-12)%8;
                s.depth = 3;
            } else if (i<28) {  // center adjacent
                s.column = (i-7)%8;
                s.depth = 2;
            }
        } else if (i<36) {  // middle
            s.type = SquareType.MID;
            s.column = (i-20)%8;
            s.depth = Math.abs(s.column-4)+(s.column>3);
        } else {
            s.type = SquareType.TOP;
            if (i>this.size-17) {         // top two rows
                s.column = 7-((this.size-i-1)%8);
                s.depth = 6-Math.floor((this.size-i-1)/8);
            } else if (i>this.size-23) {  // third from top
                s.column = 7-((this.size-i-16)%8);
                s.depth = 4;
            } else if (i>this.size-27) {  // second from center
                s.column = 7-((this.size-i-13)%8);
                s.depth = 3;
            } else if (i>this.size-29) {  // center adjacent
                s.column = 7-((this.size-i-8)%8);
                s.depth = 2; 
            }
        }
        
        // generate screenspace coords for nodes
        this.square[i].genCoords();
    }
    
    // connect nodes
    {
        let offset, d, s = this.square;
        for (let i=0; i<this.size; i++) {
            d = s[i].depth;
            if(s[i].type != SquareType.MID) { // Top/bottom squares
                // up
                offset = (d<6)   +
                         (d<5)*2 +
                         (d<4)*2;
                offset = (s[i].type == SquareType.TOP)?i-8+offset:i+8-offset;
                if(s[offset].depth == d-1) {
                    s[i].rel.up = s[offset];
                } else {
                    s[i].rel.up = s[28+s[i].column];
                }
    
                // down
                if(d < 6) {
                    offset = (d<5)   +
                             (d<4)*2 +
                             (d<3)*2;
                    offset = (s[i].type == SquareType.TOP)?i+8-offset:i-8+offset;
                    s[i].rel.down = s[offset];
                }
    
                // left
                offset = (s[i].type == SquareType.TOP)?1:-1;
                if(i>0 && i<63) {
                    if(s[i+offset].depth == d) {
                        s[i].rel.left = s[i+offset];
                    } else if((s[i].type == SquareType.TOP && s[i].column < 7) ||
                              (s[i].type == SquareType.BOT && s[i].column > 0)) {
                        s[i].rel.left = s[28+s[i].column+offset];
                    }
                }
    
                // right
                offset = (s[i].type == SquareType.TOP)?-1:1;
                if(s[i+offset].depth == d) {
                    s[i].rel.right = s[i+offset];
                } else if((s[i].type == SquareType.TOP && s[i].column > 0) ||
                          (s[i].type == SquareType.BOT && s[i].column < 7)) {
                    s[i].rel.right = s[28+s[i].column+offset];
                }
            } else { // middle squares
                // up
                offset = (d > 1)*6 +
                         (d > 2)*4 +
                         (d > 3)*6;
                offset = (i<32)?32-offset:31+offset;
                s[i].rel.up = s[offset];
                
                // down
                offset = (d > 1)*2 +
                         (d > 2)*4 +
                         (d > 3)*6;
                offset = (i<32)?36+offset:27-offset;
                s[i].rel.down = s[offset];
                
                // left
                offset = (d > 1)*4 +
                         (d > 2)*2 +
                         (d > 3)*4;
                offset = (i<32)?32+offset:31-offset;
                s[i].rel.left = s[offset];

                // right
                offset = (d > 1)*4 +
                         (d > 2)*6 +
                         (d > 3)*8;
                offset = (i<32)?26-offset:37+offset;
                s[i].rel.right = s[offset];
            }
        }
    }
    
    // define initial pieces
    {
        for (let i=0; i<this.pieceCount/2; i++) {
            this.piece[i] = new Piece();
            this.piece[i].color = PieceColor.LIGHT;
            this.piece[i].location = this.square[i];
        }
        for (let i=this.pieceCount/2; i<this.pieceCount; i++) {
            this.piece[i] = new Piece();
            this.piece[i].color = PieceColor.DARK;
            this.piece[i].location = this.square[i+32];
        }
        for (let i=0; i<this.pieceCount; i++) {
            let type;
            if(i>7 && i<24) {                                       // pawn
                type = "PAWN";
            } else if (i == 0 || i == 7 || i == 24 || i == 31) {    // rook
                type = "ROOK";
            } else if (i == 1 || i == 6 || i == 25 || i == 30) {    // knight
                type = "KNIGHT";
            } else if (i == 2 || i == 5 || i == 26 || i == 29) {    // bishop
                type = "BISHOP";
            } else if (i == 3 || i == 27) {                         // queen
                type = "QUEEN";
            } else if (i == 4 || i == 28) {                         // king
                type = "KING";
            }
            
            let p = this.piece[i];
            p.type = PieceType[type];
            p.char = PieceChar[type];
            p.moves = PieceMoves[type];
            
            if(p.type == PieceType.PAWN) {
                p.forward = 'up';
            }
        }
    }
};

var Engine = function(canvas) {
    // display canvas
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.pRatio = 1;
    
    // hidden canvas as drawbuffer to decrease latency
    this.pcanvas = document.createElement("canvas");
    this.pcanvas.style.display = 'none';
    this.pctx = this.pcanvas.getContext("2d");
    
    this.board = new Board();
    this.mousePos = { x:-1, y: -1 };
    this.held = null;
    this.paths = null;
    
    this.debug = false;

    this.calibrate = function() {
        this.pRatio = window.devicePixelRatio;
        
        let w = parseFloat(window.getComputedStyle(this.canvas).width) *
            this.pRatio;
        let h = parseFloat(window.getComputedStyle(this.canvas).height) *
            this.pRatio;
        
        this.ctx.canvas.width = w;
        this.ctx.canvas.height = h;
        this.pctx.canvas.width = w;
        this.pctx.canvas.height = h;
        this.render();
    };
    
    this.getScale = function() {
        // column width in pixels
        return (parseFloat(window.getComputedStyle(this.canvas).width) *
                this.pRatio
            )/8;
    };
    
    // cache mouse coordinates as square widths
    this.setMouse = function(event, touch) {
        if(event) {
            let scale = this.getScale();
            let xoffset = this.canvas.getBoundingClientRect().left;
            let yoffset = this.canvas.getBoundingClientRect().top;
            if(touch) {
                this.mousePos = {
                    x: ((event.touches[0].pageX-xoffset)/
                        scale)*this.pRatio,
                    y: ((event.touches[0].pageY-yoffset)/
                        scale)*this.pRatio
                };
            } else {
                this.mousePos = {
                    x: ((event.clientX-xoffset)/scale)*this.pRatio,
                    y: ((event.clientY-yoffset)/scale)*this.pRatio
                };
            }
        } else {
            this.mousePos = { x: -1, y: -1 };
        }
    };
    
    // pick up piece under mouse
    this.pick = function() {
        let nn = this.board.nodeNearest(
                this.mousePos,
                this.board.square
            );
        let piece = this.board.pieceOn(nn);
        if(piece != null) {
            this.held = piece;
            this.paths = piece.getPaths(this.board);
            this.canvas.style.cursor = "none";
        }
    };

    // drop piece
    this.drop = function() {
        if(this.held && this.paths && this.paths[0]) {
            let nn = this.board.nodeNearest(
                    this.mousePos,
                    this.paths
                );
            if(nn != this.held.location && this.board.canMove(this.held, nn)) {
                if(this.held.forward) {
                    this.held.forward = this.board.translateRel(
                            this.held.location,
                            nn,
                            this.held.forward
                        );
                }
                this.board.move(this.held, nn);
                // change to other player's move
            }
        }
        this.held = null;
        this.paths = null;
        this.canvas.style.cursor = "pointer";
    };


    this.render = function() {
        // clear drawbuffer canvas
        this.pctx.clearRect(0,0,this.pcanvas.width,this.pcanvas.height);

        // set data
        let scale = this.getScale();
        let nearest = this.board.nodeNearest(this.mousePos, this.board.square);
        this.pctx.textAlign = "center";
        this.pctx.lineJoin = "round";
        this.pctx.lineCap = "round";
        
        if(this.held) {
            let nearTarget = this.board.nodeNearest(this.mousePos, this.paths);
            // selection circle
            this.pctx.strokeStyle = "orange";
            this.pctx.lineWidth = scale/16;
            
            this.pctx.beginPath();
            this.pctx.arc(
                    nearTarget.coord.x*scale,
                    nearTarget.coord.y*scale,
                    2*scale/5,
                    0,
                    Math.PI*2
                );
            this.pctx.closePath();
            this.pctx.stroke();

            // targets and paths
            this.pctx.fillStyle = "orange";
            this.pctx.strokeStyle = "orange";
            this.pctx.lineWidth = scale/16;
            for(let path of this.paths) {
                for(let i=0; i<path.length; i++) {
                    if(path[i] != this.held.location) {
                        this.pctx.beginPath();
                        this.pctx.arc(
                                path[i].coord.x*scale,
                                path[i].coord.y*scale,
                                scale/8,
                                0,
                                Math.PI*2
                            );
                        this.pctx.closePath();
                        this.pctx.fill();
                    }
                }
                if(path.length > 1 ||
                        (path.length == 1 && path[0] != this.held.location)) {
                    this.pctx.beginPath();
                    this.pctx.moveTo(
                            this.held.location.coord.x*scale,
                            this.held.location.coord.y*scale
                        );
                    for(let i=0; i<path.length; i++) {
                        this.pctx.lineTo(
                                path[i].coord.x*scale,
                                path[i].coord.y*scale
                            );
                    }
                    this.pctx.stroke();
                }
            }
        }

        // draw pieces
        this.pctx.font = Math.floor(3*scale/5) + "px Times New Roman";
        this.pctx.lineWidth = scale/16;
        
        let p, xrend, yrend;
        for(let i=0; i<this.board.pieceCount; i++) {
            p = this.board.piece[i];
            
            // set colors
            if(p != this.held) {    // non-held pieces
                this.pctx.strokeStyle = (p.color == PieceColor.LIGHT)?
                    "#222":"#DDD";
                this.pctx.fillStyle   = (p.color == PieceColor.LIGHT)?
                    "#DDD":"#222";
            } else {                // held piece
                this.pctx.strokeStyle = (p.color == PieceColor.LIGHT)?
                    "rgba(34,34,34,0.3)":"rgba(221,221,221,0.3)";
                this.pctx.fillStyle   = (p.color == PieceColor.LIGHT)?
                    "rgba(221,221,221,0.3)":"rgba(34,34,34,0.3)";
            }

            xrend = p.location.coord.x*scale;
            yrend = p.location.coord.y*scale + (scale/5);
            this.pctx.strokeText(p.char, xrend, yrend);
            this.pctx.fillText  (p.char, xrend, yrend);
                
        }

        if(this.held != null) { // if piece held
            // held piece
            this.pctx.strokeStyle = (this.held.color == PieceColor.LIGHT)?
                "#222":"#DDD";
            this.pctx.fillStyle   = (this.held.color == PieceColor.LIGHT)?
                "#DDD":"#222";
            xrend = this.mousePos.x*scale;
            yrend = this.mousePos.y*scale + (scale/5);
            this.pctx.strokeText(this.held.char, xrend, yrend);
            this.pctx.fillText  (this.held.char, xrend, yrend);
        }
        
        // connection info
        if(this.debug) {
            this.pctx.font = scale/8 + "px Helvetica";
            this.pctx.lineWidth = scale/16;
            this.pctx.strokeStyle = "rgba(0,0,0,0.8)";
            this.pctx.fillStyle = "rgba(0,200,100,0.8";
            let currSquare = nearest;
            for(let direction in currSquare.rel) { // foreach up down left right
                if (currSquare.rel[direction]) { // if not null
                    xrend = currSquare.rel[direction].coord.x*scale;
                    yrend = currSquare.rel[direction].coord.y*scale + (2*scale/5);
                    this.pctx.strokeText(direction, xrend, yrend);
                    this.pctx.fillText  (direction, xrend, yrend);
                }
            }
        }
        // copy render to display canvas
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.drawImage(this.pcanvas,0,0);
    };
};

/*
    Copyright 2016 Andrew Tolvstad

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
