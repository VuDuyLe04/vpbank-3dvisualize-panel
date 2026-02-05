import * as THREE from 'three';
import { RawNode3DData } from '../types';

/**
 * Get node size based on size category
 */
export function getNodeSize(size: string, isCenter: boolean = false): number {
    // Center nodes are much larger
    if (isCenter) {
        return 12;
    }

    // Satellite nodes - increased sizes
    switch (size) {
        case 'sm':
            return 3;
        case 'lg':
            return 7;
        case 'md':
        default:
            return 5;
    }
}

/**
 * Get node color based on whether it's a center node
 */
export function getNodeColor(isCenter: boolean): number {
    // Professional tech blue - sophisticated IT look
    return isCenter ? 0x0099FF : 0x0099FF;
}

/**
 * Create a wireframe mesh for a node
 */
export function createNodeMesh(nodeData: RawNode3DData): THREE.Mesh {
    const size = getNodeSize(nodeData.size, nodeData.isCenter);
    const color = getNodeColor(nodeData.isCenter || false);

    // Create a group to hold the main mesh
    const group = new THREE.Group() as any;

    // Main mesh - solid with transparency for softer look
    const geometry = new THREE.IcosahedronGeometry(size, 4);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.8,
        wireframe: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // Add wireframe overlay for detail
    const wireframeGeo = new THREE.EdgesGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
    });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    group.add(wireframe);

    group.userData = { nodeData }; // Store node data for later use

    return group as any;
}

/**
 * Create label HTML for a node
 */
export function createNodeLabelHTML(nodeData: RawNode3DData): HTMLDivElement {
    const div = document.createElement('div');
    div.style.cssText = `
    background: ${nodeData.isCenter ? 'rgba(0, 40, 120, 0.9)' : 'rgba(0, 80, 200, 0.85)'};
    border: 1px solid ${nodeData.isCenter ? '#00e5ff' : '#00ffff'};
    color: #fff;
    padding: ${nodeData.isCenter ? '12px 14px' : '8px 12px'};
    font-family: 'Roboto', 'Arial', sans-serif;
    font-size: ${nodeData.isCenter ? '15px' : '12px'};
    border-radius: ${nodeData.isCenter ? '6px' : '4px'};
    box-shadow: 0 0 ${nodeData.isCenter ? '15px' : '12px'} rgba(0, 229, 255, ${nodeData.isCenter ? '0.7' : '0.6'});
    white-space: nowrap;
    pointer-events: none;
    text-align: center;
  `;

    // Build label content
    let content = `<div style="font-weight: bold; margin-bottom: ${nodeData.isCenter ? '10px' : '3px'};">${nodeData.label}</div>`;

    // Add metrics if available
    const metrics: string[] = [];
    if (nodeData.cifrb !== undefined && !nodeData.isCenter) {
        metrics.push(`CIFRB: ${formatNumber(nodeData.cifrb)}`);
    }
    if (nodeData.ccu !== undefined && !nodeData.isCenter) {
        metrics.push(`CCU: ${formatNumber(nodeData.ccu)}`);
    }
    if (nodeData.transactions !== undefined && !nodeData.isCenter) {
        metrics.push(`Trans: ${formatNumber(nodeData.transactions)}`);
    }
    if (nodeData.transactionsIn10Min !== undefined && !nodeData.isCenter) {
        metrics.push(`10min: ${formatNumber(nodeData.transactionsIn10Min)}`);
    }

    if (metrics.length > 0) {
        const fontSize = nodeData.isCenter ? '13px' : '11px';
        const metricsHTML = metrics.map(m => `<div style="font-size: ${fontSize}; opacity: 0.9; margin-top: 1px;">${m}</div>`).join('');
        content += metricsHTML;
    }

    div.innerHTML = content;
    return div;
}

/**
 * Format number with abbreviations
 */
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
