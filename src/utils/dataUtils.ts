import { DataFrame, Field } from '@grafana/data';
import { RawNode3DData, NodeSize, RawCIFRBData, RawTransactionsData } from '../types';

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
        const metric1 = findField(frame, 'metric1');
        const metric2 = findField(frame, 'metric2');
        const metric3 = findField(frame, 'metric3');
        const metric4 = findField(frame, 'metric4');
        const nameMetric1 = findField(frame, 'nameMetric1');
        const nameMetric2 = findField(frame, 'nameMetric2');
        const nameMetric3 = findField(frame, 'nameMetric3');
        const nameMetric4 = findField(frame, 'nameMetric4');

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
                nameMetric1: nameMetric1 ? String(nameMetric1.values[i]) : undefined,
                nameMetric2: nameMetric2 ? String(nameMetric2.values[i]) : undefined,
                nameMetric3: nameMetric3 ? String(nameMetric3.values[i]) : undefined,
                nameMetric4: nameMetric4 ? String(nameMetric4.values[i]) : undefined,
            };

            // Add optional metrics
            if (metric1) {
                node.metric1 = Number(metric1.values[i]);
            }
            if (metric2) {
                node.metric2 = Number(metric2.values[i]);
            }
            if (metric3) {
                node.metric3 = Number(metric3.values[i]);
            }
            if (metric4) {
                node.metric4 = Number(metric4.values[i]);
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
        (f) => f.name.toLowerCase().startsWith(fieldName.toLowerCase())
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
 * Parse transaction data from DataFrame
 * Expects a DataFrame with fields: sumCIFRB, sumCIFRBIn10Min
 */
export function parseTransactionData(dataFrames: DataFrame[]): RawCIFRBData {
    // Default values
    let left_metric1 = 0;
    let left_metric2 = 0;
    let left_metric3 = 0;
    let left_metric4 = 0;
    let nameLeftMetric1 = 'Metric 1';
    let nameLeftMetric2 = 'Metric 2';
    let nameLeftMetric3 = 'Metric 3';
    let nameLeftMetric4 = 'Metric 4';

    if (!dataFrames || dataFrames.length === 0) {
        return { left_metric1, left_metric2, left_metric3, left_metric4 }; // Return empty array when no data
    }

    // Look for transaction data frame
    for (const frame of dataFrames) {
        const left_metric1Field = findField(frame, 'leftmetric1');
        const left_metric2Field = findField(frame, 'leftmetric2');
        const left_metric3Field = findField(frame, 'leftmetric3');
        const left_metric4Field = findField(frame, 'leftmetric4');
        const nameLeftMetric1Field = findField(frame, 'nameLeftMetric1');
        const nameLeftMetric2Field = findField(frame, 'nameLeftMetric2');
        const nameLeftMetric3Field = findField(frame, 'nameLeftMetric3');
        const nameLeftMetric4Field = findField(frame, 'nameLeftMetric4');

        // If we found the fields, get the values
        if (left_metric1Field && frame.length > 0) {
            left_metric1 = Number(left_metric1Field.values[0]) || 0;
        }
        if (left_metric2Field && frame.length > 0) {
            left_metric2 = Number(left_metric2Field.values[0]) || 0;
        }
        if (left_metric3Field && frame.length > 0) {
            left_metric3 = Number(left_metric3Field.values[0]) || 0;
        }
        if (left_metric4Field && frame.length > 0) {
            left_metric4 = Number(left_metric4Field.values[0]) || 0;
        }
        if (nameLeftMetric1Field && frame.length > 0) {
            nameLeftMetric1 = String(nameLeftMetric1Field.values[0]) || 'Metric 1';
        }
        if (nameLeftMetric2Field && frame.length > 0) {
            nameLeftMetric2 = String(nameLeftMetric2Field.values[0]) || 'Metric 2';
        }
        if (nameLeftMetric3Field && frame.length > 0) {
            nameLeftMetric3 = String(nameLeftMetric3Field.values[0]) || 'Metric 3';
        }
        if (nameLeftMetric4Field && frame.length > 0) {
            nameLeftMetric4 = String(nameLeftMetric4Field.values[0]) || 'Metric 4';
        }

        // If we found both fields, we can stop searching
        if (left_metric1Field && left_metric2Field && left_metric3Field && left_metric4Field) {
            break;
        }
    }

    return {
        left_metric1,
        left_metric2,
        left_metric3,
        left_metric4,
        nameLeftMetric1,
        nameLeftMetric2,
        nameLeftMetric3,
        nameLeftMetric4
    };
}

/**
 * Parse transactions data from DataFrame
 * Expects a DataFrame with fields: sumTransactions, sumTransactionsIn10Min
 */
export function parseTransactionsData(dataFrames: DataFrame[]): RawTransactionsData {
    // Default values
    let right_metric1 = 0;
    let right_metric2 = 0;
    let right_metric3 = 0;
    let right_metric4 = 0;
    let nameRightMetric1 = 'Metric 1';
    let nameRightMetric2 = 'Metric 2';
    let nameRightMetric3 = 'Metric 3';
    let nameRightMetric4 = 'Metric 4';

    if (!dataFrames || dataFrames.length === 0) {
        return { right_metric1, right_metric2, right_metric3, right_metric4 };
    }

    // Look for transactions data frame
    for (const frame of dataFrames) {
        const right_metric1Field = findField(frame, 'right_metric1');
        const right_metric2Field = findField(frame, 'right_metric2');
        const right_metric3Field = findField(frame, 'right_metric3');
        const right_metric4Field = findField(frame, 'right_metric4');
        const nameRightMetric1Field = findField(frame, 'nameRightMetric1');
        const nameRightMetric2Field = findField(frame, 'nameRightMetric2');
        const nameRightMetric3Field = findField(frame, 'nameRightMetric3');
        const nameRightMetric4Field = findField(frame, 'nameRightMetric4');
        // If we found the fields, get the values
        if (right_metric1Field && frame.length > 0) {
            right_metric1 = Number(right_metric1Field.values[0]) || 0;
        }
        if (right_metric2Field && frame.length > 0) {
            right_metric2 = Number(right_metric2Field.values[0]) || 0;
        }
        if (right_metric3Field && frame.length > 0) {
            right_metric3 = Number(right_metric3Field.values[0]) || 0;
        }
        if (right_metric4Field && frame.length > 0) {
            right_metric4 = Number(right_metric4Field.values[0]) || 0;
        }
        if (nameRightMetric1Field && frame.length > 0) {
            nameRightMetric1 = String(nameRightMetric1Field.values[0]) || 'Metric 1';
        }
        if (nameRightMetric2Field && frame.length > 0) {
            nameRightMetric2 = String(nameRightMetric2Field.values[0]) || 'Metric 2';
        }
        if (nameRightMetric3Field && frame.length > 0) {
            nameRightMetric3 = String(nameRightMetric3Field.values[0]) || 'Metric 3';
        }
        if (nameRightMetric4Field && frame.length > 0) {
            nameRightMetric4 = String(nameRightMetric4Field.values[0]) || 'Metric 4';
        }

        // If we found both fields, we can stop searching
        if (right_metric1Field && right_metric2Field && right_metric3Field && right_metric4Field) {
            break;
        }
    }

    return {
        right_metric1,
        right_metric2,
        right_metric3,
        right_metric4
    };
}
