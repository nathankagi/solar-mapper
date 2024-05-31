import * as THREE from "three";
import { Satellite, Orbit } from "./satellite";

import { BLOOM_SCENE } from "./scene";

export class System {
    children: Satellite[]

    constructor() {
        // create stars
        let gen = Math.random();

        // need to redo the distribution
        if (gen < 0.5) {
        }
        else if (gen >= 0.5 && gen < 0.9) {

        }
        else {

        }

        // create planets

        // create asteroid clusters

        // create comets

        // create outer-system objects
    }

    get elements() {
        return this.children;
    }

    update() {

    }
}

export function createSattelite(config: object) {
    let elements: Satellite[] = [];

    return elements;
}


const sun = createSun()
const satellites = generateRandomSatellites(10);
const moons0 = generateRandomSatelliteMoons(1, satellites[0]);
const moons1 = generateRandomSatelliteMoons(1, satellites[1]);
const moons3 = generateRandomSatelliteMoons(5, satellites[3]);
const moons7 = generateRandomSatelliteMoons(10, satellites[7]);
const moons8 = generateRandomSatelliteMoons(12, satellites[8]);

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
    lightFolder.add(pointLight, `${this.name} intensity`).min(5).max(100).step(0.01);

    return sphere;
}

function generateRandomSatellites(n: number) {
    const satellites: Satellite[] = [];
    for (let i = 0; i < n; i++) {
        const p = {
            orbitalPeriod: getRandomRange(500, 750),
            semiMajorAxis: getRandomRange(10, 300),
            eccentricity: getRandomRange(0, 0.3),
            inclination: getRandomRange(-0.3, 0.3),
            argumentOfPeriapsis: 0,
            longOfAscNode: 0
        }

        const geometry = new THREE.SphereGeometry(getRandomRange(0.5, 3), 100, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        let satellite = new Satellite('test', new Orbit(p.orbitalPeriod, p.semiMajorAxis, p.eccentricity, p.inclination, p.argumentOfPeriapsis, p.longOfAscNode), mesh);

        const rate = Math.exp(-satellite.orbit.distanceToBaryCentre / 100);
        satellite.orbit.time = getRandomRange(0, satellite.orbit.orbitalPeriod);
        satellite.orbit.orbitalPeriod = satellite.orbit.orbitalPeriod / rate;

        satellites.push(satellite);
    }

    return satellites;
}

function generateRandomSatelliteMoons(n: number, parent: Satellite) {
    const satellites: Satellite[] = [];
    for (let i = 0; i < n; i++) {
        const p = {
            orbitalPeriod: getRandomRange(500, 750),
            semiMajorAxis: getRandomRange(5, 10),
            eccentricity: getRandomRange(0, 0.3),
            inclination: getRandomRange(-0.3, 0.3),
            argumentOfPeriapsis: 0,
            longOfAscNode: 0
        }

        const geometry = new THREE.SphereGeometry(getRandomRange(0.1, 0.8), 100, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        let satellite = new Satellite('test', new Orbit(p.orbitalPeriod, p.semiMajorAxis, p.eccentricity, p.inclination, p.argumentOfPeriapsis, p.longOfAscNode), mesh, parent);

        const rate = Math.exp(-satellite.orbit.distanceToBaryCentre / 100);
        satellite.orbit.time = getRandomRange(0, satellite.orbit.orbitalPeriod);
        satellite.orbit.orbitalPeriod = satellite.orbit.orbitalPeriod / rate;

        scene.add(satellite.mesh);
        satellites.push(satellite);
    }

    return satellites;
}

function getRandomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}