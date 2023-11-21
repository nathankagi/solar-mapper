import * as THREE from "three";

class Satellite {
    name: string;
    orbit: Orbit;
    mesh: THREE.Mesh;
    tail: boolean;
    orbitLine: boolean;
    tailPoints: THREE.Vector3[];
    tailObject: THREE.Line;
    orbitalParent: Satellite | null;
    maxTailPoints: number;

    constructor(name: string, orbit: Orbit, mesh: THREE.Mesh, orbitalParent: Satellite | null = null) {
        this.name = name;
        this.orbit = orbit;
        this.mesh = mesh;
        this.tail = false;
        this.orbitLine = false;
        this.maxTailPoints = 1000;
        this.orbitalParent = orbitalParent;

        this.tailPoints = [];

        const tailGeometry = new THREE.BufferGeometry().setFromPoints(this.tailPoints);
        const tailMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        this.tailObject = new THREE.Line(tailGeometry, tailMaterial);
    }

    get position() {
        return this.orbit.cartesian;
    }

    update(scene: THREE.Scene) {
        this.orbit.time += 1;
        if (this.orbitalParent != null){
            this.orbit.barycenter = this.orbitalParent.position;
        }
        this.mesh.position.copy(this.orbit.cartesian);

        if (this.tail) {
            this.tailPoints.push(this.orbit.cartesian);
            this.tailPoints = this.tailPoints.slice(-this.maxTailPoints);

            if (scene) {
                scene.remove(this.tailObject);
                const tailGeometry = new THREE.BufferGeometry().setFromPoints(this.tailPoints);
                const tailMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
                this.tailObject = new THREE.Line(tailGeometry, tailMaterial);
                scene.add(this.tailObject);
            }
        }
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
    barycenter: THREE.Vector3

    constructor(orbitalPeriod: number, semiMajorAxis: number, eccentricity: number, inclination: number, argumentOfPeriapsis: number, longOfAscNode: number, barycenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
        this.orbitalPeriod = orbitalPeriod;
        this.semiMajorAxis = semiMajorAxis;
        this.eccentricity = eccentricity;
        this.inclination = inclination;
        this.argumentOfPeriapsis = argumentOfPeriapsis;
        this.longOfAscNode = longOfAscNode;
        this.barycenter = barycenter;

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

        return this.barycenter.clone().add(new THREE.Vector3(x, y, z));
    }

    cartesianAt(t: number) {
        this.time = t;
        return this.cartesian;
    }
}

export { Satellite };
export { Orbit };