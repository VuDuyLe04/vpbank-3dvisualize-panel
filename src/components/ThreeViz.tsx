
import React, { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { css } from '@emotion/css';

interface ThreeVizProps {
    width: number;
    height: number;
}

const styles = {
    container: css`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: radial-gradient(circle at center, #1a1a2e 0%, #000000 100%);
  `,
    label: css`
    background: rgba(0, 100, 255, 0.7);
    border: 1px solid #00ffff;
    color: #fff;
    padding: 4px 8px;
    font-family: 'Roboto', sans-serif;
    font-size: 12px;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    white-space: nowrap;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 50%;
      width: 1px;
      height: 20px;
      background: #00ffff;
      transform: translateX(-50%);
    }
  `,
    mainCard: css`
    background: rgba(10, 20, 40, 0.85);
    border: 1px solid #00aaff;
    color: #00aaff;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    text-align: center;
    box-shadow: 0 0 15px rgba(0, 100, 255, 0.3);
  `
};

export const ThreeViz: React.FC<ThreeVizProps> = ({ width, height }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const labelRendererRef = useRef<CSS2DRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const frameIdRef = useRef<number>(0);

    // Satellites data mimicking the image
    const satellites = [
        { name: 'NEO', angle: 0, distance: 18, color: 0x00ffff },
        { name: 'W4', angle: 1.2, distance: 18, color: 0x0088ff },
        { name: 'LOS', angle: 2.4, distance: 18, color: 0x00ffff },
        { name: 'BIZ', angle: 3.6, distance: 18, color: 0x0088ff },
        { name: 'OCB', angle: 4.8, distance: 18, color: 0x00ffff },
    ];

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        // SCENE
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // CAMERA
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 20, 50);
        cameraRef.current = camera;

        // RENDERER
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // LABEL RENDERER
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(width, height);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none'; // allow controls through
        containerRef.current.appendChild(labelRenderer.domElement);
        labelRendererRef.current = labelRenderer;

        // CONTROLS
        // We need to attach controls to the labelRenderer domElement or a wrapper because it's on top
        // However, if we set pointerEvents none on labelRenderer, we can attach to renderer or container.
        // Let's attach to container mostly for robustness.
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;
        controlsRef.current = controls;

        // LIGHTS
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 2, 100);
        pointLight.position.set(20, 20, 20);
        scene.add(pointLight);

        // --- OBJECTS ---

        // 1. Core Sphere (The "world")
        const sphereGeo = new THREE.IcosahedronGeometry(8, 2);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0x0055ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
        scene.add(coreSphere);

        // Inner glowing core
        const coreInnerGeo = new THREE.IcosahedronGeometry(6, 1);
        const coreInnerMat = new THREE.MeshPhongMaterial({
            color: 0x00aaff,
            emissive: 0x002244,
            shininess: 100,
            flatShading: true
        });
        const coreInner = new THREE.Mesh(coreInnerGeo, coreInnerMat);
        scene.add(coreInner);

        // 2. Rings
        const createRing = (radius: number, color: number) => {
            const curve = new THREE.EllipseCurve(
                0, 0,            // ax, aY
                radius, radius,           // xRadius, yRadius
                0, 2 * Math.PI,  // aStartAngle, aEndAngle
                false,            // aClockwise
                0                 // aRotation
            );
            const points = curve.getPoints(64);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
            const ring = new THREE.Line(geometry, material);
            ring.rotation.x = -Math.PI / 2;
            return ring;
        };

        scene.add(createRing(15, 0x00ffff));
        scene.add(createRing(18, 0x0088ff));
        scene.add(createRing(22, 0x004488));


        // 3. Satellites & Labels
        const satelliteGroup = new THREE.Group();
        scene.add(satelliteGroup);

        satellites.forEach((satData) => {
            const satGeo = new THREE.IcosahedronGeometry(1.5, 0);
            const satMat = new THREE.MeshPhongMaterial({
                color: satData.color,
                emissive: 0x001133,
                wireframe: true
            });
            const satMesh = new THREE.Mesh(satGeo, satMat);

            // Position
            const x = Math.cos(satData.angle) * satData.distance;
            const z = Math.sin(satData.angle) * satData.distance;
            satMesh.position.set(x, 0, z);

            // Label
            const div = document.createElement('div');
            div.className = styles.label;
            div.textContent = satData.name;
            // Adjust style slightly based on data if needed
            const label = new CSS2DObject(div);
            label.position.set(0, 2.5, 0);
            satMesh.add(label);

            satelliteGroup.add(satMesh);
        });

        // 4. Floating Main Card (Data panel from image)
        const cardDiv = document.createElement('div');
        cardDiv.className = styles.mainCard;
        cardDiv.innerHTML = `
        <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 5px;">Core Banking</div>
        <div style="font-size: 2em; color: #fff;">T24</div>
    `;
        const cardLabel = new CSS2DObject(cardDiv);
        cardLabel.position.set(0, 12, 0);
        scene.add(cardLabel);


        // ANIMATION
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);

            if (controlsRef.current) controlsRef.current.update();
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
            if (labelRendererRef.current && sceneRef.current && cameraRef.current) {
                labelRendererRef.current.render(sceneRef.current, cameraRef.current);
            }

            // Custom rotations
            coreSphere.rotation.y -= 0.002;
            coreInner.rotation.y += 0.005;
            satelliteGroup.rotation.y += 0.001;
        };
        animate();

        return () => {
            cancelAnimationFrame(frameIdRef.current);
            if (rendererRef.current) {
                rendererRef.current.dispose();
                containerRef.current?.removeChild(rendererRef.current.domElement);
            }
            if (labelRendererRef.current) {
                containerRef.current?.removeChild(labelRendererRef.current.domElement);
            }
        };
    }, [width, height]);


    return <div ref={containerRef} className={styles.container} />;
};
