var engine;

// document onload
$(function() {
    engine = new Engine("#scene", "board.svg");
    
    // render once image is loaded
    temp = setInterval(function() {
            if(engine.bgImage.ready) {
                engine.calibrate();
                engine.render();
                clearInterval(temp);
            }
        },
        50
    );


    $(window).resize(function() {
        engine.calibrate();
        engine.render();
    });
});


