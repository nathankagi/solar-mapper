import "./index.css";
import * as THREE from "three";

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { Satellite, Point, Orbit } from "./satellite.js";

const p = {
    orbitalPeriod: 200,
    semiMajorAxis: 20,
    eccentricity: 0.2,
    inclination: 0,
    argumentOfPeriapsis: 0,
    longOfAscNode: 0
}

const aGeom = new THREE.SphereGeometry(getRandomRange(0.5, 5), 100, 100);
const aMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const aSphere = new THREE.Mesh(aGeom, aMaterial);
aSphere.position.set(5,5,5);
aSphere.receiveShadow = true;
aSphere.castShadow = true;

let a = new Satellite('test', new Orbit(p.orbitalPeriod, p.semiMajorAxis, p.eccentricity, p.inclination, p.argumentOfPeriapsis, p.longOfAscNode), aSphere)

const gui = new GUI();

const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const bloomParams = {
    threshold: 0,
    strength: 2.5,
    radius: 0,
    exposure: 0
};

const bloomFolder = gui.addFolder('bloom');

bloomFolder.add(bloomParams, 'threshold', 0.0, 1.0).onChange(function (value) {

    bloomPass.threshold = Number(value);
    render();

});

bloomFolder.add(bloomParams, 'strength', 0.0, 3).onChange(function (value) {

    bloomPass.strength = Number(value);
    render();

});

bloomFolder.add(bloomParams, 'radius', 0.0, 1.0).step(0.01).onChange(function (value) {

    bloomPass.radius = Number(value);
    render();

});

const darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const materials = {};

let fov = 70;
let aspectRatio = window.innerWidth / window.innerHeight;

const container = document.getElementById("container");
container.innerHTML = "";

const scene = new THREE.Scene();

scene.add(aSphere);

const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 1, 1000);
camera.position.set(50, 50, 50);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const lightFolder = gui.addFolder('light');

const canvas = document.getElementsByTagName("canvas")[0];

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 10000;
controls.maxPolarAngle = Math.PI;
controls.update();
controls.addEventListener('change', render);

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

const spheres = generateRandomSpheres();
createSun();

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
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.receiveShadow = true;
    sphere.castShadow = true;
    sphere.position.set(0, 0, 0);
    sphere.layers.enable(BLOOM_SCENE);

    const pointLight = new THREE.PointLight(0xffffff, 15, 0, 0.01);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    lightFolder.add(pointLight, 'intensity').min(5).max(100).step(0.01);

    scene.add(sphere);
}

function generateRandomSpheres() {
    const spheres = [];
    for (let i = 0; i < 10; i++) {
        const sphereGroup = new THREE.Group();
        const pivotPoint = new THREE.Object3D();
        const geometry = new THREE.SphereGeometry(getRandomRange(0.5, 5), 100, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0x000fff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.receiveShadow = true;
        sphere.castShadow = true;
        scene.add(sphere);

        let offest_maximum = 80
        sphere.position.x = getRandomRange(-offest_maximum, offest_maximum);
        sphere.position.y = getRandomRange(-offest_maximum, offest_maximum);
        sphere.position.z = getRandomRange(-offest_maximum, offest_maximum);
        sphere.layers.disable(BLOOM_SCENE);

        pivotPoint.position.set(0, 0, 0);
        spheres.push(
            {
                'group': sphereGroup.add(pivotPoint),
                'item': pivotPoint.add(sphere),
            }
        )
        scene.add(sphereGroup);
    }

    return spheres;
}

function getRandomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function animate() {
    requestAnimationFrame(animate);
    orbitObjects(spheres);
    rotateObjects(spheres);

    a.orbit.time += 1;
    const pos = a.orbit.cartesian
    a.mesh.position.set(pos.x, pos.z, pos.y);

    render();
}

function orbitObjects(objects) {
    const orbitSpeed = 0.01;
    const distanceCoefficient = 50;
    const referncePosition = new THREE.Vector3(0, 0, 0);
    objects.forEach(element => {
        const distance = element.item.children[0].position.distanceTo(referncePosition);
        const rate = orbitSpeed * Math.exp(-distance / distanceCoefficient);
        element.group.rotation.y += rate;
    });
}

function rotateObjects(objects) {
    const rotationSpeed = 0.01;
    const radiusCoefficient = 5;
    objects.forEach(element => {
        const rate = rotationSpeed * Math.exp(-element.item.children[0].radius / radiusCoefficient);
        element.item.children[0].y += rate;
    })
}

function render() {
    renderer.render(scene, camera);
    scene.traverse(nonBloomed);
    bloomComposer.render();
    scene.traverse(restoreMaterial);
    finalComposer.render();
}

function nonBloomed(obj) {
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