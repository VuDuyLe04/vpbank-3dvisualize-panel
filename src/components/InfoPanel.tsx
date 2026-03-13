import React, { useState, useEffect } from 'react';
import { css } from '@emotion/css';
import { RawCIFRBData } from 'types';

interface InfoPanelProps extends RawCIFRBData {
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
    const valueFontSize = isTiny ? 11 : isSmall ? 12 : isMedium ? 13 : 14;

    return {
        panel: css`
            position: absolute;
            top: ${isTiny ? 6 : 8}px;
            left: ${isTiny ? 6 : 8}px;
            background: rgba(0, 20, 40, 0.9);
            border: 1px solid #0099FF;
            border-radius: ${isTiny ? 3 : 4}px;
            padding: ${padding};
            color: #fff;
            font-family: 'Roboto', 'Arial', sans-serif;
            width: ${panelWidth}px;
            max-height: calc(${containerHeight}px - ${isTiny ? 12 : 16}px);
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
        divider: css`
            height: 1px;
            background: rgba(0, 153, 255, 0.3);
            margin: ${isTiny ? 3 : isSmall ? 4 : 6}px 0;
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

/**
 * Format current date/time
 */
function formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
    left_metric1,
    left_metric2,
    left_metric3,
    left_metric4,
    nameLeftMetric1,
    nameLeftMetric2,
    nameLeftMetric3,
    nameLeftMetric4,
    containerWidth,
    containerHeight
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const styles = getPanelStyles(containerWidth, containerHeight);

    // Update time every second
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className={styles.panel}>
            <div className={styles.row}>
                <span className={styles.label}>Ngày giờ:</span>
                <span className={styles.value}>{formatDateTime(currentTime)}</span>
            </div>

            <div className={styles.divider} />

            <div className={styles.row}>
                <span className={styles.label}>{nameLeftMetric1 || 'Metric 1'}:</span>
                <span className={styles.value}>{formatNumber(left_metric1)}</span>
            </div>

            <div className={styles.row}>
                <span className={styles.label}>{nameLeftMetric2 || 'Metric 2'}:</span>
                <span className={styles.value}>{formatNumber(left_metric2)}</span>
            </div>

            <div className={styles.row}>
                <span className={styles.label}>{nameLeftMetric3 || 'Metric 3'}:</span>
                <span className={styles.value}>{formatNumber(left_metric3)}</span>
            </div>

            <div className={styles.row}>
                <span className={styles.label}>{nameLeftMetric4 || 'Metric 4'}:</span>
                <span className={styles.value}>{formatNumber(left_metric4)}</span>
            </div>
        </div>
    );
};
