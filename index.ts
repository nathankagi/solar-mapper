import "./index.css";

import { System } from "./src/system.js";
import { Scene, simulate } from "./src/scene.js";


let scene = new Scene();
let system = new System(scene);

window.addEventListener("resize", function () {
    const width = window.innerWidth;
    const height = window.innerHeight;

    scene.onWindowResize(width, height);
});

window.addEventListener("click", (event) => {
    scene.onWindowClick(event.clientX, event.clientY);
});

simulate(function () {
    system.children.map(function (element) {
        element.update;
    })
}, scene);