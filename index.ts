import "./index.css";

import { System } from "./src/system.js";
import { simulate, scene } from "./src/scene.js";


let system = new System(scene);

simulate(function () {
    system.children.map(function (element) {
        element.update();
    })
}, scene);