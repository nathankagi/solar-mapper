import * as THREE from "three";

class Satellite {
    name: string;
    orbit: Orbit;
    mesh: THREE.Mesh;

    constructor(name: string, orbit: Orbit, mesh: THREE.Mesh) {
        this.name = name;
        this.orbit = orbit;
        this.mesh = mesh;
    }

    get position() {
        return this.orbit.cartesian;
    }

    update() {
        this.orbit.time += 1;
        this.mesh.position.copy(this.orbit.cartesian);
    }
}

class Orbit {
    orbitalPeriod: number;
    semiMajorAxis: number;
    eccentricity: number;
    inclination: number;
    argumentOfPeriapsis: number;
    longOfAscNode: number;
    t: number;

    constructor(orbitalPeriod: number, semiMajorAxis: number, eccentricity: number, inclination: number, argumentOfPeriapsis: number, longOfAscNode: number) {
        this.orbitalPeriod = orbitalPeriod;
        this.semiMajorAxis = semiMajorAxis;
        this.eccentricity = eccentricity;
        this.inclination = inclination;
        this.argumentOfPeriapsis = argumentOfPeriapsis;
        this.longOfAscNode = longOfAscNode;

        this.time = 0;
    }

    get meanAnomaly() {
        return (2 * Math.PI / this.orbitalPeriod) * this.time;
    }

    get trueAnomaly() {
        return 2 * Math.atan(Math.sqrt((1 + this.eccentricity) / (1 - this.eccentricity)) * Math.tan(this.eccentricAnomaly / 2));
    }

    get distanceToBaryCentre() {
        return this.semiMajorAxis * (1 - (this.eccentricity * Math.cos(this.eccentricAnomaly)));
    }

    get time() {
        return this.t;
    }

    set time(value: number) {
        this.t = value % this.orbitalPeriod;
    }

    get eccentricAnomaly() {
        return this.solveKepplersEquation(this.meanAnomaly, this.eccentricity);
    }

    solveKepplersEquation(meanAnomaly: number, eccentricity: number, epsilon = 1e-3) {
        let E0 = meanAnomaly;
        let E = E0;
        for (let i = 0; i < 1000; i++) {
            let E = E0 - (E0 - eccentricity * Math.sin(E0) - meanAnomaly) / (1 - eccentricity * Math.cos(E0))
            if (Math.abs(E - E0) < epsilon) {
                return E
            }
            E0 = E;
        }
        return E;
    }

    get cartesian() {
        let trueArg = this.trueAnomaly + this.argumentOfPeriapsis;

        let r = this.distanceToBaryCentre;
        let x = r * (Math.cos(this.longOfAscNode) * Math.cos(trueArg) - Math.sin(this.longOfAscNode) * Math.sin(trueArg) * Math.cos(this.inclination));
        let z = r * (Math.sin(this.longOfAscNode) * Math.cos(trueArg) - Math.cos(this.longOfAscNode) * Math.sin(trueArg) * Math.cos(this.inclination));
        let y = r * Math.sin(trueArg) * Math.sin(this.inclination);
        return new THREE.Vector3(x, y, z);
    }

    cartesianAt(t: number) {
        this.time = t;
        return this.cartesian;
    }
}

export { Satellite };
export { Orbit };