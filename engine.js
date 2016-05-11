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
    this.rel = {};
    this.coord = {};

    this.connect = function(up, down, left, right) {
        this.rel.up = up;
        this.rel.down = down;
        this.rel.left = left;
        this.rel.right = right;
    };

    // calc and cache x/y in terms of square widths
    this.genCoords = function() {
        this.coord.x = this.column+0.5;

        if (this.type == SquareType.MID) {
            this.coord.y = 6;
        } else {
            var x = this.column - 3.5;
            var d = this.depth -.5;
            var y = Math.sqrt((d*d) - (x*x));

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
    
    this.getTargets = function() {
        // return array of possible destination squares
        var ret = [];
        var steps;
        var curr;
        if(this.moves.dir == "f" && this.moves.lim == 2) {
            // pawn move
        } else if (this.moves.dir == "k" && this.moves.lim == 1) {
            // knight moves
        } else {
            if(this.moves.dir.match(/o/)) {
                // orthogonal moves
            }
            if(this.moves.dir.matches(/d/)) {
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
    
    this.dist = function(n, m) {
        return Math.sqrt((n.x-m.x)*(n.x-m.x) + (n.y-m.y)*(n.y-m.y));
    };

    // return reference to node closest to x,y, indirect specifies property containing coordinates
    this.nodeNearest = function(srcCoord, list, indirect) {
        var min;
        var curr;

        if(indirect) { // if search requires additional indirection
            min = list[0][indirect];
            for (var i=1; i<list.length; i++) {
                curr = list[i][indirect];
                if(this.dist(srcCoord, curr.coord) <
                        this.dist(srcCoord, min.coord)) {
                    min = curr;
                }
            }
        } else { // if list is of squares
            min = list[0];
            for (var i=1; i<list.length; i++) {
                curr = list[i];
                if(this.dist(srcCoord, curr.coord) <
                        this.dist(srcCoord, min.coord)) {
                    min = curr;
                }
            }
        }
        
        return min;
    };

    this.pieceOn = function(square) {
        for (var i=0; i<this.pieceCount; i++) {
            if(this.piece[i].location == square) {
                return this.piece[i];
            }
        }
        return null;
    };

    this.canMove = function(piece, location) {
        return !(this.pieceOn(location));
    };

    this.move = function(piece, location) {
        piece.location = location;
    };
    
    // define logical coords for nodes
    for (var i=0; i<this.size; i++) {
        this.square[i] = new Square();
        var s = this.square[i];
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
    
    // define initial pieces
    for (var i=0; i<this.pieceCount/2; i++) {
        this.piece[i] = new Piece();
        this.piece[i].color = PieceColor.LIGHT;
        this.piece[i].location = this.square[i];
    }
    for (var i=this.pieceCount/2; i<this.pieceCount; i++) {
        this.piece[i] = new Piece();
        this.piece[i].color = PieceColor.DARK;
        this.piece[i].location = this.square[i+32];
    }
    
    for (var i=0; i<this.pieceCount; i++) {
        var type;
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
        
        var p = this.piece[i];
        p.type = PieceType[type];
        p.char = PieceChar[type];
        p.moves = PieceMoves[type];
        
        if(p.type == PieceType.PAWN) {
            p.forward = p.location.rel.up;
        }
    }
};

var Engine = function(canvas, pixelRatio) {
    // display canvas
    this.canvas = $(canvas);
    this.ctx = this.canvas[0].getContext("2d");
    this.pRatio = pixelRatio;
    
    // hidden canvas as drawbuffer to decrease latency
    this.pcanvas = document.createElement("canvas");
    this.pcanvas.style.display = 'none';
    this.pctx = this.pcanvas.getContext("2d");
    
    this.board = new Board();
    this.mousePos = { x:-1, y: -1 };
    this.held = null;

    this.calibrate = function() {
        var w = this.canvas.width()*this.pRatio;
        var h = this.canvas.height()*this.pRatio;

        this.ctx.canvas.width = w;
        this.ctx.canvas.height = h;
        this.pctx.canvas.width = w;
        this.pctx.canvas.height = h;
        this.render();
    };
    
    this.getScale = function() {
        // column width in pixels
        return this.canvas.width()*this.pRatio/8;
    };
    
    // cache mouse coordinates
    this.setMouse = function(event, touch) { // mouse coordinates in terms of square widths
        if(event) {
            var scale = this.getScale();
            var xoffset = this.canvas[0].getBoundingClientRect().left;
            var yoffset = this.canvas[0].getBoundingClientRect().top;
            if(touch) {
                this.mousePos = {
                    x: ((event.originalEvent.touches[0].pageX-xoffset)/scale)*this.pRatio,
                    y: ((event.originalEvent.touches[0].pageY-yoffset)/scale)*this.pRatio
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
        console.log("Pick");
        var nn = this.board.nodeNearest(this.mousePos, this.board.piece, 'location');
        var piece = this.board.pieceOn(nn);
        if(piece != null) {
            this.held = piece;
            this.canvas[0].style.cursor = "none";
        }
    };

    // drop piece
    this.drop = function() {
        console.log("Drop");
        if(this.held != null) {
            var nn = this.board.nodeNearest(this.mousePos, this.board.square);
            if(this.board.canMove(this.held, nn)) {
                this.board.move(this.held, nn);
            }
            this.held = null;
        }
        this.canvas[0].style.cursor = "pointer";
    };


    this.render = function() {
        // clear drawbuffer canvas
        this.pctx.clearRect(0,0,this.pcanvas.width,this.pcanvas.height);

        // set data
        var scale = this.getScale();
        
        this.pctx.textAlign = "center";
        this.pctx.lineJoin = "round";
        
        // selection circle on the bottom
        if(this.held != null) {
            this.pctx.strokeStyle = "orange";
            this.pctx.lineWidth = scale/16;
            
            var m = this.board.nodeNearest(this.mousePos, this.board.square);
            this.pctx.beginPath();
            this.pctx.arc(m.coord.x*scale, m.coord.y*scale, 2*scale/5, 0, Math.PI*2, false);
            this.pctx.stroke();
            this.pctx.closePath();
        }

        // draw pieces
        this.pctx.font = Math.floor(3*scale/5) + "px Times New Roman";
        this.pctx.lineWidth = scale/16;
        
        var p, xrend, yrend;
        for(var i=0; i<this.board.pieceCount; i++) {
            p = this.board.piece[i];
            
            // set colors
            this.pctx.strokeStyle = (p.color == PieceColor.LIGHT)?"#222":"#DDD";
            this.pctx.fillStyle   = (p.color == PieceColor.LIGHT)?"#DDD":"#222";
            
            if(p != this.held) { // non-held pieces
                xrend = p.location.coord.x*scale;
                yrend = p.location.coord.y*scale + (scale/5);
                this.pctx.strokeText(p.char, xrend, yrend);
                this.pctx.fillText  (p.char, xrend, yrend);
            } 
        }
        if(this.held != null) { // held piece
            this.pctx.strokeStyle = (this.held.color == PieceColor.LIGHT)?"#222":"#DDD";
            this.pctx.fillStyle   = (this.held.color == PieceColor.LIGHT)?"#DDD":"#222";
            xrend = this.mousePos.x*scale;
            yrend = this.mousePos.y*scale + (scale/5);
            this.pctx.strokeText(this.held.char, xrend, yrend);
            this.pctx.fillText  (this.held.char, xrend, yrend);
        }

        // copy render to display canvas
        this.ctx.clearRect(0,0,this.canvas[0].width,this.canvas[0].height);
        this.ctx.drawImage(this.pcanvas,0,0);
    };
};
