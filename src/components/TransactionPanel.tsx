import React from 'react';
import { css } from '@emotion/css';
import { RawTransactionsData } from '../types';

const styles = {
    panel: css`
        position: absolute;
        top: 20px;
        right: 20px;
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
            right: 10px;
            top: 10px;
            padding: 16px 20px;
        }

        @media (max-width: 480px) {
            width: calc(100vw - 20px);
            right: 10px;
            padding: 12px 16px;
        }
    `,
    title: css`
        text-align: center;
        font-size: clamp(14px, 3vw, 16px);
        font-weight: 600;
        color: #0099FF;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(0, 153, 255, 0.3);

        @media (max-width: 768px) {
            margin-bottom: 12px;
            padding-bottom: 8px;
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

export const TransactionPanel: React.FC<RawTransactionsData> = ({ sumTransactions, sumTransactionsIn10Min }) => {
    return (
        <div className={styles.panel}>
            <div className={styles.title}>
                Number of Transactions
            </div>

            <div className={styles.row}>
                <span className={styles.label}>Transaction:</span>
                <span className={styles.value}>{formatNumber(sumTransactions)}</span>
            </div>

            <div className={styles.row}>
                <span className={styles.label}>Transaction (10min):</span>
                <span className={styles.value}>{formatNumber(sumTransactionsIn10Min)}</span>
            </div>
        </div>
    );
};
