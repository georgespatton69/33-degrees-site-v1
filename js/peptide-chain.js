/* ============================================
   33 DEGREES — Three.js Scroll-Driven Peptide Chain
   Full-page background animation
   ============================================ */

import * as THREE from 'three';

const LERP_FACTOR = 0.06;
const IDLE_THRESHOLD = 0.0001;
const IDLE_TIMEOUT = 200;

let renderer, camera, scene, chainGroup;
let targetScroll = 0, currentScroll = 0;
let isAnimating = false;
let lastScrollTime = 0;
let animFrameId = null;

const isMobile = window.matchMedia('(max-width: 768px)').matches;
const RESIDUE_COUNT = isMobile ? 10 : 20;
const SPHERE_SEG_W = isMobile ? 8 : 16;
const SPHERE_SEG_H = isMobile ? 6 : 12;
const CYL_SEG = 8;
const MAX_PIXEL_RATIO = isMobile ? 1.5 : 2;

// Helix params
const HELIX_RADIUS = 2.3;
const RISE_PER_RESIDUE = 1.5;
const ANGLE_PER_RESIDUE = (100 * Math.PI) / 180; // 100 degrees

// Colors (gold palette)
const COLORS = {
    carbon:   0xd4a843,   // gold
    nitrogen: 0x6a8fba,   // subtle steel blue
    oxygen:   0xe8c96a,   // light gold
    rGroup:   0xb8912e,   // dark gold
    bond:     0x555555,
};

const MATERIALS = {
    carbon:   new THREE.MeshStandardMaterial({ color: COLORS.carbon,   metalness: 0.4, roughness: 0.5, emissive: 0xd4a843, emissiveIntensity: 0.08 }),
    nitrogen: new THREE.MeshStandardMaterial({ color: COLORS.nitrogen, metalness: 0.35, roughness: 0.45, emissive: 0x6a8fba, emissiveIntensity: 0.08 }),
    oxygen:   new THREE.MeshStandardMaterial({ color: COLORS.oxygen,   metalness: 0.4, roughness: 0.5, emissive: 0xe8c96a, emissiveIntensity: 0.06 }),
    rGroup:   new THREE.MeshStandardMaterial({ color: COLORS.rGroup,   metalness: 0.3, roughness: 0.6, emissive: 0xb8912e, emissiveIntensity: 0.06 }),
    bond:     new THREE.MeshStandardMaterial({ color: COLORS.bond,     metalness: 0.1, roughness: 0.8 }),
};

// ---------- GEOMETRY BUILDERS ----------

function createAtomInstances(positions, radius, material) {
    const geo = new THREE.SphereGeometry(radius, SPHERE_SEG_W, SPHERE_SEG_H);
    const mesh = new THREE.InstancedMesh(geo, material, positions.length);
    const dummy = new THREE.Object3D();

    positions.forEach((pos, i) => {
        dummy.position.set(pos.x, pos.y, pos.z);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
}

function createBondInstances(pairs, material) {
    const geo = new THREE.CylinderGeometry(0.06, 0.06, 1, CYL_SEG);
    const mesh = new THREE.InstancedMesh(geo, material, pairs.length);
    const dummy = new THREE.Object3D();

    pairs.forEach(([a, b], i) => {
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(b, a);
        const len = dir.length();

        dummy.position.copy(mid);
        dummy.scale.set(1, len, 1);

        // Align cylinder (Y-axis) with bond direction
        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.normalize());
        dummy.quaternion.copy(quat);

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
}

function buildChain() {
    const group = new THREE.Group();

    const carbonPos = [];
    const nitrogenPos = [];
    const oxygenPos = [];
    const rGroupPos = [];
    const bondPairs = [];

    // Center the helix vertically
    const totalHeight = (RESIDUE_COUNT - 1) * RISE_PER_RESIDUE;
    const yOffset = -totalHeight / 2;

    let prevCa = null;

    for (let i = 0; i < RESIDUE_COUNT; i++) {
        const angle = i * ANGLE_PER_RESIDUE;
        const y = i * RISE_PER_RESIDUE + yOffset;
        const x = HELIX_RADIUS * Math.cos(angle);
        const z = HELIX_RADIUS * Math.sin(angle);

        // N atom (slightly before Ca on the backbone)
        const nAngle = angle - 0.3;
        const nPos = new THREE.Vector3(
            (HELIX_RADIUS - 0.3) * Math.cos(nAngle),
            y - 0.4,
            (HELIX_RADIUS - 0.3) * Math.sin(nAngle)
        );
        nitrogenPos.push(nPos);

        // Ca atom (alpha carbon — backbone center)
        const caPos = new THREE.Vector3(x, y, z);
        carbonPos.push(caPos);

        // C atom (carbonyl carbon, slightly after Ca)
        const cAngle = angle + 0.3;
        const cPos = new THREE.Vector3(
            (HELIX_RADIUS + 0.2) * Math.cos(cAngle),
            y + 0.3,
            (HELIX_RADIUS + 0.2) * Math.sin(cAngle)
        );
        carbonPos.push(cPos);

        // O atom (double bonded to C, pointing outward)
        const oPos = new THREE.Vector3(
            (HELIX_RADIUS + 0.9) * Math.cos(cAngle + 0.1),
            y + 0.5,
            (HELIX_RADIUS + 0.9) * Math.sin(cAngle + 0.1)
        );
        oxygenPos.push(oPos);

        // R-group (side chain, pointing outward from Ca)
        const rPos = new THREE.Vector3(
            (HELIX_RADIUS + 1.2) * Math.cos(angle),
            y + 0.1,
            (HELIX_RADIUS + 1.2) * Math.sin(angle)
        );
        rGroupPos.push(rPos);

        // Bonds within residue
        bondPairs.push([nPos, caPos]);   // N → Ca
        bondPairs.push([caPos, cPos]);   // Ca → C
        bondPairs.push([cPos, oPos]);    // C → O (carbonyl)
        bondPairs.push([caPos, rPos]);   // Ca → R

        // Bond to previous residue (C → N peptide bond)
        if (prevCa && i > 0) {
            // Previous C to current N
            const prevC = carbonPos[carbonPos.length - 3]; // previous residue's C
            if (prevC) {
                bondPairs.push([prevC, nPos]);
            }
        }
        prevCa = caPos;
    }

    // Create instanced meshes
    group.add(createAtomInstances(carbonPos, 0.22, MATERIALS.carbon));
    group.add(createAtomInstances(nitrogenPos, 0.2, MATERIALS.nitrogen));
    group.add(createAtomInstances(oxygenPos, 0.18, MATERIALS.oxygen));
    group.add(createAtomInstances(rGroupPos, 0.28, MATERIALS.rGroup));
    group.add(createBondInstances(bondPairs, MATERIALS.bond));

    return group;
}

// ---------- SCROLL ----------

function getScrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
}

function onScroll() {
    targetScroll = getScrollProgress();
    lastScrollTime = performance.now();
    if (!isAnimating) startAnimation();
}

// ---------- ANIMATION ----------

function lerp(a, b, t) {
    return a + (b - a) * t;
}

let autoRotation = 0;
const AUTO_ROTATE_SPEED = 0.003; // slow continuous spin

function startAnimation() {
    if (isAnimating) return;
    isAnimating = true;
    animate();
}

function animate() {
    currentScroll = lerp(currentScroll, targetScroll, LERP_FACTOR);
    autoRotation += AUTO_ROTATE_SPEED;

    // Camera — close in hero, pulls back slightly as you scroll
    camera.position.z = lerp(14, 20, currentScroll);
    camera.position.x = lerp(0, -3, currentScroll);
    camera.position.y = lerp(0, 1, currentScroll);

    // Chain — continuous auto-rotation + scroll-driven twist
    chainGroup.rotation.y = autoRotation + currentScroll * Math.PI * 3;
    chainGroup.rotation.x = -0.2 + currentScroll * 0.4;
    chainGroup.position.y = lerp(0, -2, currentScroll);

    // Shift accent light color through scroll
    if (window.__accentLight) {
        const hue = currentScroll * 0.15 + 0.58;
        window.__accentLight.color.setHSL(hue % 1, 0.4, 0.5);
        window.__accentLight.position.y = lerp(-5, 5, currentScroll);
    }

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
}

// ---------- RESIZE ----------

let lastWidth = 0;
function onResize() {
    const w = window.innerWidth;
    if (w === lastWidth) return;
    lastWidth = w;

    const canvas = renderer.domElement;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Re-render once
    renderer.render(scene, camera);
}

// ---------- INIT ----------

function init() {
    const canvas = document.getElementById('peptide-canvas');
    if (!canvas) return;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setClearColor(0x000000, 0); // transparent

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 14);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xd4a843, 1.5);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xe8c96a, 1.0, 60);
    pointLight.position.set(-4, -3, 8);
    scene.add(pointLight);

    // Back rim light for depth
    const rimLight = new THREE.DirectionalLight(0x6a8fba, 0.6);
    rimLight.position.set(-3, 2, -5);
    scene.add(rimLight);

    // Accent light that shifts color as you scroll
    const accentLight = new THREE.PointLight(0x4488cc, 0.5, 50);
    accentLight.position.set(3, -5, 6);
    scene.add(accentLight);
    window.__accentLight = accentLight; // expose for scroll update

    // Build chain
    chainGroup = buildChain();
    chainGroup.rotation.x = -0.3;
    scene.add(chainGroup);

    // Initial render
    renderer.render(scene, camera);

    // Events
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    lastWidth = window.innerWidth;

    // Start with a single scroll update
    targetScroll = getScrollProgress();
    currentScroll = targetScroll;
    renderer.render(scene, camera);
}

// Go
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
