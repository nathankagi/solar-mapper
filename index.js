import "./index.css";
import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const bloomParams = {
    threshold: 0,
    strength: 1,
    radius: 1,
    exposure: 0
};

const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
const materials = {};

let fov = 70;
let aspectRatio = window.innerWidth / window.innerHeight;

const container = document.getElementById("container");
container.innerHTML = "";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 1, 1000);
camera.position.set(50, 50, 50);
camera.lookAt(0, 0, 0);

const canvas = document.getElementsByTagName("canvas")[0];

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0.0);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 10000;
controls.maxPolarAngle = Math.PI;
controls.addEventListener('change', render);
controls.update();

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = bloomParams.threshold;
bloomPass.strength = bloomParams.strength;
bloomPass.radius = bloomParams.radius;

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

generateRandomSpheres();
scene.add(createSun());

window.addEventListener("resize", function () {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    bloomComposer.setSize(width, height);
    finalComposer.setSize(width, height);
});

animate();

function createSun() {
    const geometry = new THREE.SphereGeometry(1, 100, 100);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(0, 0, 0);
    sphere.layers.enable(BLOOM_SCENE);
    return sphere
}

function generateRandomSpheres() {
    for (let i = 0; i < 10; i++) {
        const geometry = new THREE.SphereGeometry(getRandomRange(0.5, 5), 100, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0x000fff });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        let offest_maximum = 50
        sphere.position.x = getRandomRange(-offest_maximum, offest_maximum);
        sphere.position.y = getRandomRange(-offest_maximum, offest_maximum);
        sphere.position.z = getRandomRange(-offest_maximum, offest_maximum);
        sphere.layers.disable(BLOOM_SCENE);
    }
}

function getRandomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function animate() {
    requestAnimationFrame(animate);

    render();
}

function render() {
    scene.traverse(darkenNonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);
    finalComposer.render();
}

function darkenNonBloomed(obj) {

    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {

        materials[obj.uuid] = obj.material;
        obj.material = darkMaterial;

    }

}

function restoreMaterial(obj) {

    if (materials[obj.uuid]) {

        obj.material = materials[obj.uuid];
        delete materials[obj.uuid];

    }

}

class CelestialBody {
    constructor(name, radius) {

    }
}

class Orbit {
    constructor(N, i, w, a, e, M) {
        this.N = N; // longitude of the ascending node
        this.i = i; // inclination to the ecliptic plane
        this.w = w; // argument of perihelion
        this.a = a; // semi-major axis, or mean distance from orbiting body
        this.e = e; // eccentricity (0=circle, 0-1=ellipse, 1=parabola)
        this.M = M; // 0 at perihelion
    }
}
