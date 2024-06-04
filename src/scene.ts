import * as THREE from "three";
import Stats from "stats.js";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

export const BLOOM_SCENE = 1;
const DEFAULT_BLOOM_PARAMS = {
    threshold: 0,
    strength: 2.5,
    radius: 0,
    exposure: 0,
};
export const scene = new THREE.Scene();

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

const gui = new GUI();
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const bloomFolder = gui.addFolder('bloom');

bloomFolder.add(DEFAULT_BLOOM_PARAMS, 'threshold', 0.0, 1.0).onChange(function (value) {

    bloomPass.threshold = Number(value);
    render();

});

bloomFolder.add(DEFAULT_BLOOM_PARAMS, 'strength', 0.0, 3).onChange(function (value) {

    bloomPass.strength = Number(value);
    render();

});

bloomFolder.add(DEFAULT_BLOOM_PARAMS, 'radius', 0.0, 1.0).step(0.01).onChange(function (value) {

    bloomPass.radius = Number(value);
    render();

});

const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const materials = {};

let fov = 70;
let aspectRatio = window.innerWidth / window.innerHeight;

// const planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
// const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x0c0c0c, side: THREE.DoubleSide, opacity: 0.9, transparent: true });
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// plane.rotateX(Math.PI / 2);
// plane.layers.disable(BLOOM_SCENE);
// scene.add(plane);

// const axisLength = 20;

// // create X-axis (red)
// const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
// const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
//     new THREE.Vector3(0, 0, 0),
//     new THREE.Vector3(axisLength, 0, 0),
// ]);
// const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
// xAxis.layers.disable(BLOOM_SCENE);
// scene.add(xAxis);

// // create Y-axis (green)
// const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
// const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
//     new THREE.Vector3(0, 0, 0),
//     new THREE.Vector3(0, axisLength, 0),
// ]);
// const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
// yAxis.layers.disable(BLOOM_SCENE);
// scene.add(yAxis);

// // create Z-axis (blue)
// const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
// const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
//     new THREE.Vector3(0, 0, 0),
//     new THREE.Vector3(0, 0, axisLength),
// ]);
// const zAxis = new THREE.Line(zAxisGeometry, zAxisMaterial);
// zAxis.layers.disable(BLOOM_SCENE);
// scene.add(zAxis);

const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 1, 1000);
camera.position.set(50, 50, 50);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 10000;
controls.maxPolarAngle = Math.PI;
controls.update();
controls.addEventListener('change', render);

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = DEFAULT_BLOOM_PARAMS.threshold;
bloomPass.strength = DEFAULT_BLOOM_PARAMS.strength;
bloomPass.radius = DEFAULT_BLOOM_PARAMS.radius;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const mixPass = new ShaderPass(
    new THREE.ShaderMaterial({
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        defines: {}
    }), 'baseTexture'
);
mixPass.needsSwap = true;

const outputPass = new OutputPass();

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);
finalComposer.addPass(outputPass);

window.addEventListener("resize", function () {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    bloomComposer.setSize(width, height);
    finalComposer.setSize(width, height);
});

// functions
export function simulate(callback: CallableFunction, scene) {
    function animate() {
        stats.update();
        requestAnimationFrame(animate);
        callback();
        render();
    }

    animate();
}

function render() {
    renderer.render(scene, camera);
    scene.traverse(nonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);
    finalComposer.render();
}

function nonBloomed(obj) {
    // if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
    if (bloomLayer.test(obj.layers) === false) {
        try {
            materials[obj.uuid] = obj.material;
            obj.material = darkMaterial;
        } catch (error) {
        }
    }

}

function restoreMaterial(obj) {

    if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];
    }
}

window.addEventListener('click', (event) => {
    const canvasBounds = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - canvasBounds.left) / renderer.domElement.clientWidth) * 2 - 1;
    const y = -((event.clientY - canvasBounds.top) / renderer.domElement.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const intersects = raycaster.intersectObjects(scene.children, false);
    if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;
        const object = intersects[0].object;

        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const points = [camera.position.clone(), intersectionPoint];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        let line = new THREE.Line(geometry, material);
        // scene.add(line);
    }
});