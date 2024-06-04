import * as THREE from "three";
import { Satellite, Orbit } from "./satellite";

import { Scene, BLOOM_SCENE } from "./scene";

/*
CONFIG
size distribution -> mean, std_dev or array
moon distribution -> mean, std_dev or array
cluster distribution -> mean, std_dev or array
eccentric orbit objects
*/

export class System {
    children: Satellite[];
    scene: Scene;

    constructor(scene: Scene) {
        console.log("creating system");
        this.scene = scene;
        this.children = [];
        // need to define configuration settings for system generation
        let gen = Math.random();

        // create stars
        const geometry = new THREE.SphereGeometry(1, 100, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.receiveShadow = true;
        sphere.castShadow = true;
        sphere.position.set(0, 0, 0);
        sphere.layers.enable(BLOOM_SCENE);

        const pointLight = new THREE.PointLight(0xffffff, 15, 0, 0.01);
        pointLight.position.set(0, 0, 0);
        this.scene.scene.add(pointLight);
        this.scene.lightFolder
            .add(pointLight, "intensity")
            .min(5)
            .max(100)
            .step(0.01);

        this.scene.scene.add(sphere);

        // create planets
        for (let i = 0; i < 10; i++) {
            let parent = createRandomSatellite();

            this.children.push(parent);
            this.scene.scene.add(parent.mesh);

            let moons = getRandomRange(0, 10);
            for (let j = 0; j < moons; j++) {
                let moon = createRandomSatellite(parent)
                this.children.push(moon);
                this.scene.scene.add(moon.mesh);
            }
        }

        // create asteroid clusters

        // create comets

        // create outer-system objects


        console.log("finished creating system");
    }

    get elements() {
        return this.children;
    }
}

export function createSattelite(config: object) {
    let elements: Satellite[] = [];

    return elements;
}

function createRandomSatellite(parent: Satellite | null = null) {
    const p = {
        orbitalPeriod: getRandomRange(500, 750),
        semiMajorAxis: getRandomRange(10, 300),
        eccentricity: getRandomRange(0, 0.3),
        inclination: getRandomRange(-0.3, 0.3),
        argumentOfPeriapsis: 0,
        longOfAscNode: 0,
    };

    const geometry = new THREE.SphereGeometry(getRandomRange(0.5, 3), 100, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    let satellite = new Satellite(
        "test",
        new Orbit(
            p.orbitalPeriod,
            p.semiMajorAxis,
            p.eccentricity,
            p.inclination,
            p.argumentOfPeriapsis,
            p.longOfAscNode
        ),
        mesh,
        parent
    );

    const rate = Math.exp(-satellite.orbit.distanceToBaryCentre / 100);
    satellite.orbit.time = getRandomRange(0, satellite.orbit.orbitalPeriod);
    satellite.orbit.orbitalPeriod = satellite.orbit.orbitalPeriod / rate;

    return satellite;
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
            longOfAscNode: 0,
        };

        const geometry = new THREE.SphereGeometry(
            getRandomRange(0.1, 0.8),
            100,
            100
        );
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        let satellite = new Satellite(
            "test",
            new Orbit(
                p.orbitalPeriod,
                p.semiMajorAxis,
                p.eccentricity,
                p.inclination,
                p.argumentOfPeriapsis,
                p.longOfAscNode
            ),
            mesh,
            parent
        );

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
