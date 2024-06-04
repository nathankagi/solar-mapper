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

export class Scene {
    scene: THREE.Scene;
    stats: Stats;
    bloomLayer: THREE.Layers;
    ui: GUI;
    darkMaterial: THREE.Material;
    materials: {};
    renderer: THREE.WebGLRenderer;
    bloomComposer: EffectComposer;
    finalComposer: EffectComposer;
    camera: THREE.PerspectiveCamera;

    lightFolder: any;


    constructor(
    ) {
        this.stats = new Stats();
        this.stats.showPanel(0);
        try {
            document.body.appendChild(this.stats.dom);
        } catch (error) {
        }

        this.bloomLayer = new THREE.Layers();
        this.bloomLayer.set(BLOOM_SCENE);
        const ui = new GUI();

        const bloomFolder = ui.addFolder("bloom");
        bloomFolder
            .add(DEFAULT_BLOOM_PARAMS, "threshold", 0.0, 1.0)
            .onChange(function (value) {
                bloomPass.threshold = Number(value);
                this.render();
            });

        bloomFolder
            .add(DEFAULT_BLOOM_PARAMS, "strength", 0.0, 3)
            .onChange(function (value) {
                bloomPass.strength = Number(value);
                this.render();
            });

        bloomFolder
            .add(DEFAULT_BLOOM_PARAMS, "radius", 0.0, 1.0)
            .step(0.01)
            .onChange(function (value) {
                bloomPass.radius = Number(value);
                this.render();
            });

        this.darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.materials = {};

        let fov = 70;
        let aspectRatio = window.innerWidth / window.innerHeight;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(fov, aspectRatio, 1, 1000);
        this.camera.position.set(50, 50, 50);
        this.camera.lookAt(0, 0, 0);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        this.lightFolder = ui.addFolder("light");

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.minDistance = 10;
        controls.maxDistance = 10000;
        controls.maxPolarAngle = Math.PI;
        controls.update();
        controls.addEventListener("change", this.render);

        const renderScene = new RenderPass(this.scene, this.camera);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,
            0.4,
            0.85
        );
        bloomPass.threshold = DEFAULT_BLOOM_PARAMS.threshold;
        bloomPass.strength = DEFAULT_BLOOM_PARAMS.strength;
        bloomPass.radius = DEFAULT_BLOOM_PARAMS.radius;

        this.bloomComposer = new EffectComposer(this.renderer);
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.addPass(renderScene);
        this.bloomComposer.addPass(bloomPass);

        const mixPass = new ShaderPass(
            new THREE.ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
                },
                vertexShader: document.getElementById("vertexshader").textContent,
                fragmentShader: document.getElementById("fragmentshader").textContent,
                defines: {},
            }),
            "baseTexture"
        );
        mixPass.needsSwap = true;

        const outputPass = new OutputPass();

        this.finalComposer = new EffectComposer(this.renderer);
        this.finalComposer.addPass(renderScene);
        this.finalComposer.addPass(mixPass);
        this.finalComposer.addPass(outputPass);
    }

    onWindowResize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.bloomComposer.setSize(width, height);
        this.finalComposer.setSize(width, height);
    }

    onWindowClick(x: number, y: number) {
        const canvasBounds = this.renderer.domElement.getBoundingClientRect();
        const canvasX =
            ((x - canvasBounds.left) / this.renderer.domElement.clientWidth) *
            2 -
            1;
        const canvasY =
            -((y - canvasBounds.top) / this.renderer.domElement.clientHeight) *
            2 +
            1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(canvasX, canvasY), this.camera);

        const intersects = raycaster.intersectObjects(this.scene.children, false);
        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            const object = intersects[0].object;

            const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            const points = [this.camera.position.clone(), intersectionPoint];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            let line = new THREE.Line(geometry, material);
            // scene.add(line);
        }
    }

}

export function simulate(callback: CallableFunction, scene: Scene) {
    function animate() {
        requestAnimationFrame(animate);
        callback();
        render(scene);
    }

    function render(s) {
        s.stats.update();
        s.renderer.render(s.scene, s.camera);
        s.scene.traverse(nonBloomed);
        s.bloomComposer.render();
        s.scene.traverse(restoreMaterial);
        s.finalComposer.render();
    }

    function nonBloomed(obj) {
        // if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
        if (scene.bloomLayer.test(obj.layers) === false) {
            try {
                scene.materials[obj.uuid] = obj.material;
                obj.material = scene.darkMaterial;
            } catch (error) { }
        }
    }

    function restoreMaterial(obj) {
        if (scene.materials[obj.uuid]) {
            obj.material = scene.materials[obj.uuid];
            delete scene.materials[obj.uuid];
        }
    }

    animate();
}