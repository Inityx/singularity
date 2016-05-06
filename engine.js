var Engine = function(canvas, board_url) {
    this.canvas = $(canvas);
    this.ctx = this.canvas[0].getContext("2d");
};

Engine.prototype.calibrate = function() {
    this.ctx.canvas.width = this.canvas.width();
    this.ctx.canvas.height = this.canvas.height();
}

Engine.prototype.render = function() {};


