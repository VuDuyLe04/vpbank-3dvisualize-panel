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
        min-width: 340px;
        box-shadow: 0 0 20px rgba(0, 153, 255, 0.4);
        z-index: 1000;
    `,
    title: css`
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        color: #0099FF;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(0, 153, 255, 0.3);
    `,
    row: css`
        margin-bottom: 14px;
        font-size: 15px;
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
        font-size: 16px;
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
