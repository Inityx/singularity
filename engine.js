var Engine = function(canvas, board_url) {
    this.canvas = $(canvas);
    this.ctx = this.canvas[0].getContext("2d");
    this.bgImage = new Image();
    this.bgImage.ready = false;
    this.bgImage.src = board_url;
    this.bgImage.onload = function() { this.ready = true; };
};

Engine.prototype.calibrate = function() {
    this.ctx.canvas.width = this.canvas.width();
    this.ctx.canvas.height = this.canvas.height();
}

Engine.prototype.render = function() {
    if(this.bgImage.ready) {
        this.ctx.drawImage(
            this.bgImage,
            0,
            0,
            this.ctx.canvas.width,
            this.ctx.canvas.height
        );
    }
};


