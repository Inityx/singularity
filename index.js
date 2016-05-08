var engine;

function boardColors(eng) {
    $("#grid").attr("fill", $("#cp1").val());
    $("#ellipsoid").attr("fill", $("#cp2").val());
}


// document onload
$(function() {
    engine = new Engine("#scene");
    
    $("#cp1, #cp2").change(boardColors);

    $("#scene").mousemove(function(event) { engine.render(event); });
    $(window).resize(function() {
        engine.calibrate();
        engine.render();
    });

    boardColors(engine);
    engine.calibrate();
    engine.render(null);
});


