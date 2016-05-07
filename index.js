var engine;

function boardColors() {
    $("#grid").attr("fill", $("#cp1").val());
    $("#ellipsoid").attr("fill", $("#cp2").val());
}


// document onload
$(function() {
    engine = new Engine("#scene");
    
    $("#cp1, #cp2").change(boardColors);

    $(window).resize(function() {
        engine.calibrate();
        engine.render();
    });
    
    $("#scene").mousemove(function(event) { engine.render(event); });

    boardColors();
    engine.calibrate();
    engine.render(null);
});


