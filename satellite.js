class Satellite {
    constructor(name, orbit) {
        this.name = name;
        this.orbit = orbit;
    }
}

class Orbit {
    constructor(orbitalPeriod, semiMajorAxis, eccentricity, inclination, argumentOfPeriapsis, longOfAscNode) {
        this.orbitalPeriod = orbitalPeriod;
        this.semiMajorAxis = semiMajorAxis;
        this.eccentricity = eccentricity;
        this.inclination = inclination;
        this.argumentOfPeriapsis = argumentOfPeriapsis;
        this.longOfAscNode = longOfAscNode;
    }

    get meanAnomaly() {
        return (2 * Math.PI / this.T) * this.t;
    }

    get trueAnomaly() {
        return 2 * Math.atan(Math.sqrt((1 + this.eccentricity) / (1 - this.eccentricity)) * Math.tan(this.eccentricAnomaly / 2));
    }

    get distanceToBaryCentre() {
        return self.semiMajorAxis * (1 - (this.eccentricity * Math.cos(this.eccentricAnomaly)))
    }

    get t() {
        return this.t;
    }

    set t(value) {
        this.t = value;
    }

    get eccentricAnomaly() {
        return this.solveKepplersEquation(this.meanAnomaly, this.eccentricity);
    }

    solveKepplersEquation(meanAnomaly, eccentricity, epsilon = 1e-9) {
        let E0 = meanAnomaly;
        while (true) {
            let E = E0 - (E0 - eccentricity * Math.sin(E0) - meanAnomaly) / (1 - eccentricity * Math.cos(E0))
            if (abs(E - E0) < epsilon) {
                return E
            }
            E0 = E;
        }
    }

    get cartesian() {
        let trueArg = this.trueAnomaly + this.argumentOfPeriapsis;

        let r = this.distanceToBaryCentre;
        let x = r * (Math.cos(this.longOfAscNode) * Math.cos(trueArg) - Math.sin(this.longOfAscNode) * Math.sin(trueArg) * Math.cos(this.inclination));
        let y = r * (Math.sin(this.longOfAscNode) * Math.cos(trueArg) - Math.cos(this.longOfAscNode) * Math.sin(trueArg) * Math.cos(this.inclination));
        let z = r * Math.sin(trueArg) * Math.sin(this.inclination);
        return new Point(x,y,z);
    }

    cartesianAt(t) {
        this.t = t;
        return this.cartesian;
    }
}

class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

export {Satellite};
export {Orbit};
export {Point};