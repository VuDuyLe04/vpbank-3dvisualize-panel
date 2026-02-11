import React, { useState, useEffect } from 'react';
import { css } from '@emotion/css';
import { RawCIFRBData } from 'types';

const styles = {
    panel: css`
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(0, 20, 40, 0.85);
        border: 1px solid #0099FF;
        border-radius: 8px;
        padding: 20px 26px;
        color: #fff;
        font-family: 'Roboto', 'Arial', sans-serif;
        width: clamp(280px, 25vw, 400px);
        max-width: calc(100vw - 40px);
        box-shadow: 0 0 20px rgba(0, 153, 255, 0.4);
        z-index: 1000;

        @media (max-width: 768px) {
            width: clamp(240px, 90vw, 340px);
            left: 10px;
            top: 10px;
            padding: 16px 20px;
        }

        @media (max-width: 480px) {
            width: calc(100vw - 20px);
            left: 10px;
            padding: 12px 16px;
        }
    `,
    row: css`
        margin-bottom: 14px;
        font-size: clamp(13px, 2.5vw, 15px);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;

        &:last-child {
            margin-bottom: 0;
        }

        @media (max-width: 768px) {
            margin-bottom: 10px;
            flex-wrap: wrap;
        }
    `,
    label: css`
        color: #88ccff;
        font-weight: 500;
        white-space: nowrap;
        flex-shrink: 0;
    `,
    value: css`
        color: #ffffff;
        font-weight: 600;
        font-size: clamp(14px, 3vw, 16px);
        text-align: right;
        word-break: break-word;
    `,
    divider: css`
        height: 1px;
        background: rgba(0, 153, 255, 0.3);
        margin: 8px 0;

        @media (max-width: 768px) {
            margin: 6px 0;
        }
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

export const InfoPanel: React.FC<RawCIFRBData> = ({ sumCIFRB, sumCIFRBIn10Min }) => {
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
                <span className={styles.label}>Date Time:</span>
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
