import React, { useRef, useLayoutEffect, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { css } from '@emotion/css';
import { RawNode3DData } from '../types';
import { createNodeMesh, createNodeLabelHTML, getNodeSize } from './Node3D';

interface ThreeVisualize3DProps {
    width: number;
    height: number;
    nodes: RawNode3DData[];
    numberOfLayers: number;
}

const styles = {
    container: css`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: radial-gradient(circle at center, #1a1a2e 0%, #000000 100%);
  `,
};

export const ThreeVisualize3D: React.FC<ThreeVisualize3DProps> = ({ width, height, nodes, numberOfLayers }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const labelRendererRef = useRef<CSS2DRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const frameIdRef = useRef<number>(0);
    const nodeGroupRef = useRef<THREE.Group | null>(null);
    const ringsGroupRef = useRef<THREE.Group | null>(null);
    const isInitializedRef = useRef<boolean>(false);

    // Initialize scene, camera, renderer ONCE
    useLayoutEffect(() => {
        if (!containerRef.current || isInitializedRef.current) return;

        // SCENE
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // CAMERA
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 25, 60);
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
        labelRenderer.domElement.style.pointerEvents = 'none';
        containerRef.current.appendChild(labelRenderer.domElement);
        labelRendererRef.current = labelRenderer;

        // CONTROLS
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;
        controls.target.set(0, -4, 0);
        controlsRef.current = controls;

        // LIGHTS
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 2, 100);
        pointLight.position.set(20, 20, 20);
        scene.add(pointLight);

        // Create groups for nodes and rings
        const nodeGroup = new THREE.Group();
        const ringsGroup = new THREE.Group();
        scene.add(nodeGroup);
        scene.add(ringsGroup);
        nodeGroupRef.current = nodeGroup;
        ringsGroupRef.current = ringsGroup;

        // ANIMATION LOOP
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);

            if (controlsRef.current) {
                controlsRef.current.update();
            }

            // Rotate node group slowly
            if (nodeGroupRef.current) {
                nodeGroupRef.current.rotation.y += 0.001;
            }

            // Rotate individual center nodes
            if (nodeGroupRef.current) {
                nodeGroupRef.current.children.forEach(child => {
                    if ((child as any).isCenter && (child as any).rotationSpeed) {
                        child.rotation.y += (child as any).rotationSpeed;
                    }
                    if ((child as any).isCore && (child as any).rotationSpeed) {
                        child.rotation.y += (child as any).rotationSpeed;
                    }
                });
            }

            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
            if (labelRendererRef.current && sceneRef.current && cameraRef.current) {
                labelRendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();

        isInitializedRef.current = true;

        // CLEANUP
        return () => {
            cancelAnimationFrame(frameIdRef.current);
            if (rendererRef.current) {
                rendererRef.current.dispose();
                containerRef.current?.removeChild(rendererRef.current.domElement);
            }
            if (labelRendererRef.current) {
                containerRef.current?.removeChild(labelRendererRef.current.domElement);
            }
            isInitializedRef.current = false;
        };
    }, []); // Only run once

    // Handle window resize
    useEffect(() => {
        if (!rendererRef.current || !labelRendererRef.current || !cameraRef.current) return;

        rendererRef.current.setSize(width, height);
        labelRendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
    }, [width, height]);

    // Update nodes when data changes
    useEffect(() => {
        if (!nodeGroupRef.current || !ringsGroupRef.current) return;

        // Store refs in local constants for type safety
        const nodeGroup = nodeGroupRef.current;
        const ringsGroup = ringsGroupRef.current;

        // Helper function to recursively dispose and remove objects
        const disposeNode = (obj: THREE.Object3D) => {
            // Remove all children first (including CSS2DObject labels)
            while (obj.children.length > 0) {
                const child = obj.children[0];
                obj.remove(child);
                disposeNode(child); // Recursively dispose children
            }

            // Dispose geometry and materials
            if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
                if ((obj as any).geometry) {
                    (obj as any).geometry.dispose();
                }
                if ((obj as any).material) {
                    if (Array.isArray((obj as any).material)) {
                        (obj as any).material.forEach((m: any) => m.dispose());
                    } else {
                        (obj as any).material.dispose();
                    }
                }
            }
        };

        // Clear existing nodes and rings
        while (nodeGroup.children.length > 0) {
            const child = nodeGroup.children[0];
            nodeGroup.remove(child);
            disposeNode(child);
        }

        while (ringsGroup.children.length > 0) {
            const child = ringsGroup.children[0];
            ringsGroup.remove(child);
            disposeNode(child);
        }

        // Separate center and layer nodes
        const centerNodes = nodes.filter(n => n.isCenter);
        const layerNodes = nodes.filter(n => !n.isCenter);

        // Group nodes by layer
        const nodesByLayer = new Map<number, RawNode3DData[]>();
        layerNodes.forEach(node => {
            const layer = node.layerOrder;
            if (!nodesByLayer.has(layer)) {
                nodesByLayer.set(layer, []);
            }
            nodesByLayer.get(layer)!.push(node);
        });

        // Render center nodes
        centerNodes.forEach((nodeData, index) => {
            const mesh = createNodeMesh(nodeData);

            // Position center nodes slightly offset if multiple
            if (centerNodes.length > 1) {
                const offset = (index - (centerNodes.length - 1) / 2) * 3;
                mesh.position.set(offset, 0, 0);
            } else {
                mesh.position.set(0, 0, 0);
            }

            // Create inner glowing core for center node
            if (index === 0) {
                const coreSize = getNodeSize(nodeData.size, true) * 0.75;
                const coreGeo = new THREE.IcosahedronGeometry(coreSize, 2);
                const coreMat = new THREE.MeshPhongMaterial({
                    color: 0x00aaff,
                    emissive: 0x002244,
                    shininess: 100,
                    flatShading: true,
                });
                const coreInner = new THREE.Mesh(coreGeo, coreMat);
                coreInner.position.copy(mesh.position);
                nodeGroup.add(coreInner);

                // Rotate inner core
                (coreInner as any).rotationSpeed = 0.005;
                (coreInner as any).isCore = true;
            }

            // Add label sads
            const labelDiv = createNodeLabelHTML(nodeData);
            const label = new CSS2DObject(labelDiv);
            label.position.set(0, getNodeSize(nodeData.size, nodeData.isCenter) + 3, 0);
            mesh.add(label);

            nodeGroup.add(mesh);

            // Store mesh for rotation
            (mesh as any).rotationSpeed = -0.002;
            (mesh as any).isCenter = true;
        });

        // Render orbit rings for each layer
        const maxLayer = Math.max(numberOfLayers, ...Array.from(nodesByLayer.keys()));
        for (let i = 1; i <= maxLayer; i++) {
            const radius = 15 + (i - 1) * 7;
            const ring = createRing(radius, i % 2 === 0 ? 0x0088ff : 0x00ffff);
            ringsGroup.add(ring);
        }

        // Render layer nodes
        nodesByLayer.forEach((nodesInLayer, layerIndex) => {
            const radius = 15 + (layerIndex - 1) * 7;
            const angleStep = (2 * Math.PI) / nodesInLayer.length;

            nodesInLayer.forEach((nodeData, index) => {
                const mesh = createNodeMesh(nodeData);

                // Calculate position on circle
                const angle = angleStep * index;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                mesh.position.set(x, 0, z);

                // Add label
                const labelDiv = createNodeLabelHTML(nodeData);
                const label = new CSS2DObject(labelDiv);
                label.position.set(0, getNodeSize(nodeData.size, nodeData.isCenter) + 2.5, 0);
                mesh.add(label);

                nodeGroup.add(mesh);
            });
        });

    }, [nodes, numberOfLayers]); // Update only when data changes

    return <div ref={containerRef} className={styles.container} />;
};

/**
 * Create a ring at the specified radius
 */
function createRing(radius: number, color: number): THREE.Line {
    const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, 2 * Math.PI,
        false,
        0
    );
    const points = curve.getPoints(64);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3
    });
    const ring = new THREE.Line(geometry, material);
    ring.rotation.x = -Math.PI / 2;
    return ring;
}
