function boardColors(eng) {
    $("#grid").attr("fill", $("#cp1").val());
    $("#ellipsoid").attr("fill", $("#cp2").val());
}

// document onload
$(function() {
    var canvas = "#scene";
    var engine = new Engine(canvas);
    
    $("#cp1, #cp2").change(boardColors);

    $(window).resize(function() {
        engine.calibrate();
        engine.render();
    });

    // bind mouse interactions
    $(canvas).mousemove(function(event) { 
        engine.setMouse(event);
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
    
    boardColors(engine);
    engine.calibrate();
    engine.render();
});


