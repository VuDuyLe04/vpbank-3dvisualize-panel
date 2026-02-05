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
    return isCenter ? 0x00aaff : 0x00ffff;
}

/**
 * Create a wireframe mesh for a node
 */
export function createNodeMesh(nodeData: RawNode3DData): THREE.Mesh {
    const size = getNodeSize(nodeData.size, nodeData.isCenter);
    const color = getNodeColor(nodeData.isCenter || false);

    // Higher subdivision for rounder appearance
    const geometry = new THREE.IcosahedronGeometry(size, 2);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: 0x001133,
        wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { nodeData }; // Store node data for later use

    return mesh;
}

/**
 * Create label HTML for a node
 */
export function createNodeLabelHTML(nodeData: RawNode3DData): HTMLDivElement {
    const div = document.createElement('div');
    div.style.cssText = `
    background: ${nodeData.isCenter ? 'rgba(10, 20, 40, 0.85)' : 'rgba(0, 100, 255, 0.7)'};
    border: 1px solid ${nodeData.isCenter ? '#00aaff' : '#00ffff'};
    color: #fff;
    padding: ${nodeData.isCenter ? '10px 12px' : '6px 10px'};
    font-family: 'Roboto', monospace;
    font-size: ${nodeData.isCenter ? '11px' : '9px'};
    border-radius: ${nodeData.isCenter ? '6px' : '4px'};
    box-shadow: 0 0 ${nodeData.isCenter ? '12px' : '8px'} rgba(0, ${nodeData.isCenter ? '100' : '255'}, 255, ${nodeData.isCenter ? '0.3' : '0.5'});
    white-space: nowrap;
    pointer-events: none;
    text-align: center;
  `;

    // Build label content
    let content = `<div style="font-weight: bold; margin-bottom: ${nodeData.isCenter ? '6px' : '3px'};">${nodeData.label}</div>`;

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
        const fontSize = nodeData.isCenter ? '10px' : '8px';
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
