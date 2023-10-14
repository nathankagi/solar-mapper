import "./index.css";

import * as THREE from "three";

import Stats from "three/addons/libs/stats.module.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js";

let container, stats;

let camera, controls, scene, renderer;

let mesh, texture;

const worldWidth = 256,
    worldDepth = 256,
    worldHalfWidth = worldWidth / 2,
    worldHalfDepth = worldDepth / 2;

let helper;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

init();
animate();

function init() {
    container = document.getElementById("container");
    container.innerHTML = "";

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );

    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 1000;
    controls.maxPolarAngle = Math.PI / 2;

    controls.target.y = 0;
    camera.position.y = controls.target.y + 2;
    camera.position.x = 2;
    controls.update();

    generateRandomSpheres();

    stats = new Stats();
    container.appendChild(stats.dom);

    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function generateRandomSpheres() {
    for (let i = 0; i < 10; i++) {
        const geometry = new THREE.SphereGeometry(Math.random()*5, 50, 50);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // offset spere
        let offest_maximum = 20
        sphere.position.x = getRandomArbitrary(-offest_maximum, offest_maximum);
        sphere.position.y = getRandomArbitrary(-offest_maximum, offest_maximum);
        sphere.position.z = getRandomArbitrary(-offest_maximum, offest_maximum);
    }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }  

function animate() {
    requestAnimationFrame(animate);

    render();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
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