import { DataFrame, Field } from '@grafana/data';
import { RawNode3DData, NodeSize } from '../types';

/**
 * Parse Grafana DataFrame into RawNode3DData array
 * Expects DataFrame fields: id, label, layerOrder, size, isCenter, cifrb, ccu, transactions, transactionsIn10Min
 */
export function parseNodesFromDataFrame(dataFrames: DataFrame[]): RawNode3DData[] {
    const nodes: RawNode3DData[] = [];

    if (!dataFrames || dataFrames.length === 0) {
        return []; // Return empty array when no data
    }

    // Process each DataFrame
    for (const frame of dataFrames) {
        const length = frame.length;

        // Find fields by name
        const idField = findField(frame, 'id');
        const labelField = findField(frame, 'label');
        const layerOrderField = findField(frame, 'layerOrder');
        const sizeField = findField(frame, 'size');
        const isCenterField = findField(frame, 'isCenter');
        const cifrbField = findField(frame, 'cifrb');
        const ccuField = findField(frame, 'ccu');
        const transactionsField = findField(frame, 'transactions');
        const transactionsIn10MinField = findField(frame, 'transactionsIn10Min');

        // Check if we have at least the essential fields to create nodes
        // If no id, label, or layerOrder field exists, skip this frame
        if (!idField && !labelField && !layerOrderField) {
            continue; // Skip this frame as it doesn't contain node data
        }

        // Parse each row
        for (let i = 0; i < length; i++) {
            const node: RawNode3DData = {
                id: idField ? String(idField.values[i]) : `node-${i}`,
                label: labelField ? String(labelField.values[i]) : `Node ${i}`,
                layerOrder: layerOrderField ? Number(layerOrderField.values[i]) : 1,
                size: sizeField ? parseNodeSize(String(sizeField.values[i])) : 'md',
                isCenter: isCenterField ? Boolean(isCenterField.values[i]) : false,
            };

            // Add optional metrics
            if (cifrbField) {
                node.cifrb = Number(cifrbField.values[i]);
            }
            if (ccuField) {
                node.ccu = Number(ccuField.values[i]);
            }
            if (transactionsField) {
                node.transactions = Number(transactionsField.values[i]);
            }
            if (transactionsIn10MinField) {
                node.transactionsIn10Min = Number(transactionsIn10MinField.values[i]);
            }

            nodes.push(node);
        }
    }

    return nodes;
}

/**
 * Find a field in DataFrame by name (case-insensitive)
 */
function findField(frame: DataFrame, fieldName: string): Field | undefined {
    return frame.fields.find(
        (f) => f.name.toLowerCase() === fieldName.toLowerCase()
    );
}

/**
 * Parse string value to NodeSize type
 */
function parseNodeSize(value: string): NodeSize {
    const normalized = value.toLowerCase();
    if (normalized === 'sm' || normalized === 'small') return 'sm';
    if (normalized === 'lg' || normalized === 'large') return 'lg';
    return 'md';
}

/**
 * Mock data for testing when no data source is available
 */
export function getMockNodes(): RawNode3DData[] {
    return [
        {
            id: 'center-t24',
            label: 'T24',
            layerOrder: 0,
            size: 'lg',
            isCenter: true,
            cifrb: 15000000,
            ccu: 8500,
            transactions: 125000,
            transactionsIn10Min: 2500,
        },
        {
            id: 'neo',
            label: 'NEO',
            layerOrder: 1,
            size: 'md',
            cifrb: 3500000,
            ccu: 1200,
            transactions: 18000,
            transactionsIn10Min: 350,
        },
        {
            id: 'w4',
            label: 'W4',
            layerOrder: 1,
            size: 'md',
            cifrb: 2800000,
            ccu: 950,
            transactions: 15000,
            transactionsIn10Min: 280,
        },
        {
            id: 'los',
            label: 'LOS',
            layerOrder: 1,
            size: 'sm',
            cifrb: 1200000,
            ccu: 450,
            transactions: 8500,
            transactionsIn10Min: 120,
        },
        {
            id: 'biz',
            label: 'BIZ',
            layerOrder: 2,
            size: 'md',
            cifrb: 4200000,
            ccu: 1500,
            transactions: 22000,
            transactionsIn10Min: 420,
        },
        {
            id: 'ocb',
            label: 'OCB',
            layerOrder: 2,
            size: 'sm',
            cifrb: 1800000,
            ccu: 680,
            transactions: 11000,
            transactionsIn10Min: 195,
        },
    ];
}

/**
 * Calculate total CIFRB from all nodes
 * @deprecated Use parseTransactionData instead if you have direct query results
 */
export function calculateTransactionTotals(nodes: RawNode3DData[]): { sumCIFRB: number; sumCIFRBIn10Min: number } {
    let sumCIFRB = 0;
    let sumCIFRBIn10Min = 0;

    nodes.forEach(node => {
        if (node.cifrb !== undefined) {
            sumCIFRB += node.cifrb;
        }
        // For now, using cifrb as proxy for 10min data
        // Update this when you have actual cifrbIn10Min field
        if (node.cifrb !== undefined) {
            sumCIFRBIn10Min += node.cifrb * 0.1; // Example: 10% of total
        }
    });

    return {
        sumCIFRB,
        sumCIFRBIn10Min
    };
}

/**
 * Parse transaction data from DataFrame
 * Expects a DataFrame with fields: sumCIFRB, sumCIFRBIn10Min
 */
export function parseTransactionData(dataFrames: DataFrame[]): { sumCIFRB: number; sumCIFRBIn10Min: number } {
    // Default values
    let sumCIFRB = 0;
    let sumCIFRBIn10Min = 0;

    if (!dataFrames || dataFrames.length === 0) {
        return { sumCIFRB, sumCIFRBIn10Min };
    }

    // Look for transaction data frame
    for (const frame of dataFrames) {
        const sumCIFRBField = findField(frame, 'sumCIFRB');
        const sumCIFRBIn10MinField = findField(frame, 'sumCIFRBIn10Min');

        // If we found the fields, get the values
        if (sumCIFRBField && frame.length > 0) {
            sumCIFRB = Number(sumCIFRBField.values[0]) || 0;
        }
        if (sumCIFRBIn10MinField && frame.length > 0) {
            sumCIFRBIn10Min = Number(sumCIFRBIn10MinField.values[0]) || 0;
        }

        // If we found both fields, we can stop searching
        if (sumCIFRBField && sumCIFRBIn10MinField) {
            break;
        }
    }

    return {
        sumCIFRB,
        sumCIFRBIn10Min
    };
}
