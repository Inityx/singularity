var SquareType = {
    BOT: 0,
    MID: 1,
    TOP: 2
}

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
    }
}

var Board = function() {
    this.size = 64;
    this.square = new Array(this.size);
    
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
                s.column = (this.size-i-1)%8;
                s.depth = 6-Math.floor((this.size-i-1)/8);
            } else if (i>this.size-23) {  // third from top
                s.column = (this.size-i-16)%8;
                s.depth = 4;
            } else if (i>this.size-27) {  // second from center
                s.column = (this.size-i-13)%8;
                s.depth = 3;
            } else if (i>this.size-29) {  // center adjacent
                s.column = (this.size-i-8)%8;
                s.depth = 2; 
            }
        }

        this.square[i].genCoords();
    }
}

var Engine = function(canvas, board_url) {
    this.canvas = $(canvas);
    this.ctx = this.canvas[0].getContext("2d");
    this.board = new Board();

    this.calibrate = function() {
        this.ctx.canvas.width = this.canvas.width();
        this.ctx.canvas.height = this.canvas.height();
    };

    this.render = function() {
        var scale = this.canvas.width()/8;
        for(var i=0;i<this.board.size;i++) {    
            var s = this.board.square[i];
            this.ctx.rect(s.coord.x*scale-10, s.coord.y*scale-10, 20, 20);
            this.ctx.fillStyle = "red";
            this.ctx.fill(); 
            this.ctx.fillText(i, s.coord.x*scale-10, s.coord.y*scale-12);
        }
    };
};
