
export type NodeSize = 'sm' | 'md' | 'lg';

export interface RawNode3DData {
  id: string;
  label: string;
  layerOrder: number;
  size: NodeSize;
  isCenter?: boolean;
  cifrb?: number;
  ccu?: number;
  transactions?: number;
  transactionsIn10Min?: number;
}

export interface RawCIFRBData {
  sumCIFRB: number;
  sumCIFRBIn10Min: number;
}

export interface RawTransactionsData {
  sumTransactions: number;
  sumTransactionsIn10Min: number;
}