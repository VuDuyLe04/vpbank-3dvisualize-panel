import React, { useState, useEffect } from 'react';
import { css } from '@emotion/css';

interface InfoPanelProps {
    sumCIFRB: number;
    sumCIFRBIn10Min: number;
}

const styles = {
    panel: css`
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(0, 20, 40, 0.85);
        border: 1px solid #0099FF;
        border-radius: 8px;
        padding: 16px 20px;
        color: #fff;
        font-family: 'Roboto', 'Arial', sans-serif;
        min-width: 280px;
        box-shadow: 0 0 20px rgba(0, 153, 255, 0.4);
        z-index: 1000;
    `,
    row: css`
        margin-bottom: 12px;
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        &:last-child {
            margin-bottom: 0;
        }
    `,
    label: css`
        color: #88ccff;
        margin-right: 12px;
        font-weight: 500;
    `,
    value: css`
        color: #ffffff;
        font-weight: 600;
        font-size: 15px;
    `,
    divider: css`
        height: 1px;
        background: rgba(0, 153, 255, 0.3);
        margin: 8px 0;
    `,
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

export const InfoPanel: React.FC<InfoPanelProps> = ({ sumCIFRB, sumCIFRBIn10Min }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

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
                <span className={styles.label}>Date / Time:</span>
                <span className={styles.value}>{formatDateTime(currentTime)}</span>
            </div>

            <div className={styles.divider} />

            <div className={styles.row}>
                <span className={styles.label}>Total CIFRB:</span>
                <span className={styles.value}>{formatNumber(sumCIFRB)}</span>
            </div>

            <div className={styles.row}>
                <span className={styles.label}>CIFRB (10min):</span>
                <span className={styles.value}>{formatNumber(sumCIFRBIn10Min)}</span>
            </div>
        </div>
    );
};
