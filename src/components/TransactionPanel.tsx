import React from 'react';
import { css } from '@emotion/css';
import { RawTransactionsData } from '../types';

interface TransactionPanelProps extends RawTransactionsData {
    containerWidth?: number;
    containerHeight?: number;
}

const getPanelStyles = (containerWidth: number = 1200, containerHeight: number = 800) => {
    // Calculate responsive values based on container size
    const isSmall = containerWidth < 600;
    const isMedium = containerWidth >= 600 && containerWidth < 900;
    const isTiny = containerWidth < 400;

    // Dynamic sizing - significantly reduced
    const panelWidth = isTiny ? Math.min(containerWidth * 0.45, 160)
        : isSmall ? Math.min(containerWidth * 0.35, 200)
            : isMedium ? Math.min(containerWidth * 0.25, 240)
                : Math.min(containerWidth * 0.18, 280);

    const padding = isTiny ? '6px 8px'
        : isSmall ? '8px 10px'
            : isMedium ? '10px 14px'
                : '12px 16px';

    const fontSize = isTiny ? 10 : isSmall ? 11 : isMedium ? 12 : 13;
    const titleFontSize = isTiny ? 11 : isSmall ? 12 : isMedium ? 13 : 14;
    const valueFontSize = isTiny ? 11 : isSmall ? 12 : isMedium ? 13 : 14;

    // Stack panels vertically if too narrow
    const shouldStack = containerWidth < 500;
    const topPosition = shouldStack ? Math.min(containerHeight * 0.25, 120) : (isTiny ? 6 : 8);

    return {
        panel: css`
            position: absolute;
            top: ${topPosition}px;
            right: ${isTiny ? 6 : 8}px;
            background: rgba(0, 20, 40, 0.9);
            border: 1px solid #0099FF;
            border-radius: ${isTiny ? 3 : 4}px;
            padding: ${padding};
            color: #fff;
            font-family: 'Roboto', 'Arial', sans-serif;
            width: ${panelWidth}px;
            max-height: calc(${containerHeight}px - ${shouldStack ? topPosition + 12 : (isTiny ? 12 : 16)}px);
            box-shadow: 0 0 ${isTiny ? 8 : 12}px rgba(0, 153, 255, 0.3);
            z-index: 1000;
            overflow-y: auto;
            overflow-x: hidden;
            backdrop-filter: blur(6px);

            /* Custom scrollbar */
            &::-webkit-scrollbar {
                width: 2px;
            }

            &::-webkit-scrollbar-track {
                background: rgba(0, 153, 255, 0.1);
            }

            &::-webkit-scrollbar-thumb {
                background: rgba(0, 153, 255, 0.5);
                border-radius: 1px;
            }
        `,
        title: css`
            text-align: center;
            font-size: ${titleFontSize}px;
            font-weight: 600;
            color: #0099FF;
            margin-bottom: ${isTiny ? 4 : isSmall ? 6 : 8}px;
            padding-bottom: ${isTiny ? 3 : isSmall ? 4 : 6}px;
            border-bottom: 1px solid rgba(0, 153, 255, 0.3);
            overflow-wrap: break-word;
            line-height: 1.2;
        `,
        row: css`
            margin-bottom: ${isTiny ? 4 : isSmall ? 6 : 8}px;
            font-size: ${fontSize}px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: ${isTiny ? 4 : isSmall ? 5 : 6}px;
            min-height: ${isTiny ? 16 : 18}px;
            line-height: 1.2;

            &:last-child {
                margin-bottom: 0;
            }
        `,
        label: css`
            color: #88ccff;
            font-weight: 500;
            white-space: nowrap;
            flex-shrink: 0;
            font-size: ${Math.max(fontSize - 1, 9)}px;
        `,
        value: css`
            color: #ffffff;
            font-weight: 600;
            font-size: ${valueFontSize}px;
            text-align: right;
            word-break: break-word;
            overflow-wrap: break-word;
        `,
    };
};

/**
 * Format number with K/M suffixes
 */
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

export const TransactionPanel: React.FC<TransactionPanelProps> = ({
    right_metric1,
    right_metric2,
    right_metric3,
    right_metric4,
    nameRightMetric1,
    nameRightMetric2,
    nameRightMetric3,
    nameRightMetric4,
    containerWidth,
    containerHeight
}) => {
    const styles = getPanelStyles(containerWidth, containerHeight);

    return (
        <div className={styles.panel}>
            <div className={styles.title}>
                Số lượng giao dịch
            </div>

            <div className={styles.row}>
                <span className={styles.label}>{nameRightMetric1 || 'Metric 1'}:</span>
                <span className={styles.value}>{formatNumber(right_metric1)}</span>
            </div>

            <div className={styles.row}>
                <span className={styles.label}>{nameRightMetric2 || 'Metric 2'}:</span>
                <span className={styles.value}>{formatNumber(right_metric2)}</span>
            </div>
            <div className={styles.row}>
                <span className={styles.label}>{nameRightMetric3 || 'Metric 3'}:</span>
                <span className={styles.value}>{formatNumber(right_metric3)}</span>
            </div>
            <div className={styles.row}>
                <span className={styles.label}>{nameRightMetric4 || 'Metric 4'}:</span>
                <span className={styles.value}>{formatNumber(right_metric4)}</span>
            </div>
        </div>
    );
};
