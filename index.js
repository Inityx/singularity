var engine;
var bColors;

/*global Engine*/

window.onload = function() {
    var canvas = document.getElementById("scene");
    engine = new Engine(canvas, window.devicePixelRatio);
    
    bColors = {
        input: [ document.getElementById("cp1"), document.getElementById("cp2") ],
        grid: document.getElementById("grid"),
        ellipsoid: document.getElementById("ellipsoid"),
        refresh: function() {
            this.grid.setAttribute("fill", this.input[0].value);
            this.ellipsoid.setAttribute("fill", this.input[1].value);
        }
    };
    
    bColors.input[0].addEventListener("change", function() {
        bColors.refresh();
    });
    bColors.input[1].addEventListener("change", function() {
        bColors.refresh();
    });
    
    window.addEventListener("resize", function() {
        engine.calibrate();
    });

    // bind mouse interactions
    canvas.addEventListener("mousemove", function(event) { 
        engine.setMouse(event);
        engine.render();
    });
    canvas.addEventListener("mousedown", function() {
        engine.pick();
        engine.render();
    });
    canvas.addEventListener("mouseup", function() {
        engine.drop();
        engine.render();
    });
    
    // bind touch interactions
    canvas.addEventListener("touchmove", function(event) {
        event.preventDefault();
        engine.setMouse(event, true);
        engine.render();
    });
    canvas.addEventListener("touchstart", function(event) {
        engine.setMouse(event, true);
        engine.pick();
        engine.render();
    });
    canvas.addEventListener("touchend", function() {
        engine.drop();
        engine.render();
    });
    
    // initialize
    bColors.refresh();
    engine.calibrate();
};

/*
    Copyright 2016 Andrew Tolvstad

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/