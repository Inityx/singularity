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

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

var Board = function() {
    this.size = 64;
    this.square = new Array(this.size);
    
    this.nodeNearest = function(x, y) {
        var min = this.square[0];
        var curr;
        for (var i=1; i<this.size; i++) {
            curr = this.square[i];
            if(dist(x, y, curr.coord.x, curr.coord.y) < dist(x, y, min.coord.x, min.coord.y)) {
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
        
        // generate screenspace coords for nodes
        this.square[i].genCoords();
    }
}

var Engine = function(canvas, board_url) {
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
    
    this.getScale = function() { return this.canvas.width()/8; };

    this.getMouse = function(event) { // mouse coordinates in terms of square widths
        if(event == null) { return { x: -1, y: -1 }; }

        var scale = this.getScale();
        return {
            x: (event.clientX-this.canvas[0].getBoundingClientRect().left)/scale,
            y: (event.clientY-this.canvas[0].getBoundingClientRect().top)/scale
        };
    }

    this.render = function(event) {
        // clear private canvas
        this.pctx.clearRect(0,0,this.canvas.width(),this.canvas.height());

        // get data
        var mouse = this.getMouse(event);
        var scale = this.getScale();
        var m = this.board.nodeNearest(mouse.x, mouse.y);

        // draw nodes
        var s;
        for(var i=0;i<this.board.size;i++) {    
            s = this.board.square[i];
            
            this.pctx.fillStyle = "red";
            this.pctx.beginPath();
            if( m == s) {
                this.pctx.rect(s.coord.x*scale-15, s.coord.y*scale-15, 30, 30);
            }
            else {
                this.pctx.rect(s.coord.x*scale-10, s.coord.y*scale-10, 20, 20);
            }
            this.pctx.fill(); 
            this.pctx.closePath();
            this.pctx.fillStyle = "black";
            this.pctx.fillText(i, s.coord.x*scale-10, s.coord.y*scale);
        }
        
        // copy render to real canvas
        this.ctx.clearRect(0,0,this.canvas.width(),this.canvas.height());
        this.ctx.drawImage(this.pcanvas,0,0);
    }
    
    
};
