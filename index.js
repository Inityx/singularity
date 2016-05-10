var engine;

function boardColors() {
    $("#grid").attr("fill", $("#cp1").val());
    $("#ellipsoid").attr("fill", $("#cp2").val());
}

// document onload
$(function() {
    var canvas = "#scene";
    engine = new Engine(canvas, $(window).attr('devicePixelRatio'));
    
    // event listeners
    $("#cp1, #cp2").change(boardColors);
    $(window).resize(function() { engine.calibrate(); });

    // bind mouse interactions
    $(canvas).mousemove(function(event) { 
        engine.setMouse(event, false);
        engine.render();
    });
    $(canvas).mousedown(function() {
        engine.pick();
        engine.render();
    });
    $(canvas).mouseup(function() {
        engine.drop();
        engine.render();
    });
    
    // bind touch interactions
    $(canvas).on("touchmove", function(event) {
        event.preventDefault();
        engine.setMouse(event, true);
        engine.render();
    });
    $(canvas).on("touchstart", function(event) {
        engine.setMouse(event, true);
        engine.pick();
        engine.render();
    });
    $(canvas).on("touchend", function() {
        engine.drop();
        engine.render();
    });
    
    // initialize
    boardColors();
    engine.calibrate();
});


