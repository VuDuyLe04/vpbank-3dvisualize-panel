
export type NodeSize = 'sm' | 'md' | 'lg';

export interface RawNode3DData {
  id: string;
  label: string;
  layerOrder: number;
  size: NodeSize;
  isCenter?: boolean;
  metric1?: number;
  metric2?: number;
  metric3?: number;
  metric4?: number;
  nameMetric1?: string;
  nameMetric2?: string;
  nameMetric3?: string;
  nameMetric4?: string;
}

export interface RawCIFRBData {
  left_metric1: number;
  left_metric2: number;
  left_metric3: number;
  left_metric4: number;
  nameLeftMetric1?: string;
  nameLeftMetric2?: string;
  nameLeftMetric3?: string;
  nameLeftMetric4?: string;
}

export interface RawTransactionsData {
  right_metric1: number;
  right_metric2: number;
  right_metric3: number;
  right_metric4: number;
  nameRightMetric1?: string;
  nameRightMetric2?: string;
  nameRightMetric3?: string;
  nameRightMetric4?: string;
}