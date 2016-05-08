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
    PAWN: { dir: "f", lim: 2 },
    ROOK: { dir: "o", lim: 0 },
    KNIGHT: { dir: "k", lim: 1 },
    BISHOP: { dir: "d", lim: 0 },
    KING: { dir: "a", lim: 1 },
    QUEEN: { dir: "a", lim: 0 }
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
};
    
function dist(n, m) {
    return Math.sqrt((n.x-m.x)*(n.x-m.x) + (n.y-m.y)*(n.y-m.y));
}

var Board = function() {
    this.size = 64;
    this.pieceCount = 32;
    this.square = new Array(this.size);
    this.piece = new Array(this.pieces);
    
    // return reference to node closest to x,y
    this.nodeNearest = function(srcCoord) {
        var min = this.square[0];
        var curr;
        for (var i=1; i<this.size; i++) {
            curr = this.square[i];
            if(dist(srcCoord, curr.coord) < dist(srcCoord, min.coord)) {
                min = curr;
            }
        }
        
        return min;
    }
    
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
        var p = this.piece[i];
        if(i>7 && i<24) {                                       // pawn
            p.type = PieceType.PAWN;
            p.char = PieceChar.PAWN;
        } else if (i == 0 || i == 7 || i == 24 || i == 31) {    // rook
            p.type = PieceType.ROOK;
            p.char = PieceChar.ROOK;
        } else if (i == 1 || i == 6 || i == 25 || i == 30) {    // knight
            p.type = PieceType.KNIGHT;
            p.char = PieceChar.KNIGHT;
        } else if (i == 2 || i == 5 || i == 26 || i == 29) {    // bishop
            p.type = PieceType.BISHOP;
            p.char = PieceChar.BISHOP;
        } else if (i == 3 || i == 27) {                         // queen
            p.type = PieceType.QUEEN;
            p.char = PieceChar.QUEEN;
        } else if (i == 4 || i == 28) {                         // king
            p.type = PieceType.KING;
            p.char = PieceChar.KING;
        }
    }
};

var Engine = function(canvas, color_l, color_d) {
    // master canvas
    this.canvas = $(canvas);
    this.ctx = this.canvas[0].getContext("2d");
    
    // hidden drawbuffer to increase performance
    this.pcanvas = document.createElement("canvas");
    this.pctx = this.pcanvas.getContext("2d");
    
    this.board = new Board();

    this.calibrate = function() {
        var w = this.canvas.width();
        var h = this.canvas.height();

        this.ctx.canvas.width = w;
        this.ctx.canvas.height = h;
        this.pctx.canvas.width = w;
        this.pctx.canvas.height = h;
    };
    
    this.getScale = function() {
        // column width in pixels
        return this.canvas.width()/8;
    };

    this.getMouse = function(event) { // mouse coordinates in terms of square widths
        if(event == null) { return { x: -1, y: -1 }; }

        var scale = this.getScale();
        return {
            x: (event.clientX-this.canvas[0].getBoundingClientRect().left)/scale,
            y: (event.clientY-this.canvas[0].getBoundingClientRect().top)/scale
        };
    };

    this.render = function(event) {
        // clear private canvas
        this.pctx.clearRect(0,0,this.canvas.width(),this.canvas.height());

        // set data
        var mouse = this.getMouse(event);
        var scale = this.getScale();
        
        this.pctx.textAlign = "center";
        this.pctx.strokeStyle = "orange";
        this.pctx.lineWidth = scale/16;
        
        var m = this.board.nodeNearest(mouse);
        this.pctx.beginPath();
        this.pctx.arc(m.coord.x*scale, m.coord.y*scale, 2*scale/5, 0, Math.PI*2, false);
        this.pctx.stroke();
        this.pctx.closePath();
        
        // draw pieces
        this.pctx.font = 3*scale/5 + "px Helvetica";
        this.pctx.lineWidth = scale/16;
        
        for(var i=0; i<this.board.pieceCount; i++) {
            var p = this.board.piece[i];
            this.pctx.strokeStyle = (p.color == PieceColor.LIGHT)?"#222":"#DDD";
            this.pctx.fillStyle   = (p.color == PieceColor.LIGHT)?"#DDD":"#222";
            this.pctx.strokeText(p.char, p.location.coord.x*scale, p.location.coord.y*scale + (scale/5));
            this.pctx.fillText  (p.char, p.location.coord.x*scale, p.location.coord.y*scale + (scale/5));
        }
        
        // copy render to real canvas
        this.ctx.clearRect(0,0,this.canvas.width(),this.canvas.height());
        this.ctx.drawImage(this.pcanvas,0,0);
    };
};
