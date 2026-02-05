import React, { useMemo } from 'react';
import { PanelProps } from '@grafana/data';
import { Options as TopologyOptions } from '../config/panelCfg';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';
import { ThreeVisualize3D } from './3dVisualize';
import { parseNodesFromDataFrame } from '../utils/dataUtils';

interface Props extends PanelProps<TopologyOptions> { }

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const styles = useStyles2(getStyles);

  // Parse nodes from Grafana data
  const nodes = useMemo(() => {
    return parseNodesFromDataFrame(data.series);
  }, [data.series]);

  // Show error if no data or no nodes
  if (data.series.length === 0 || nodes.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <ThreeVisualize3D
        width={width}
        height={height}
        nodes={nodes}
        numberOfLayers={options.numberOfLayers}
      />
    </div>
  );
};

