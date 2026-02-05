import { FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { SimplePanel } from './components/SimplePanel';
import { Options as TopologyOptions } from './config/panelCfg';

export const plugin = new PanelPlugin<TopologyOptions>(SimplePanel)
  .useFieldConfig({
    disableStandardOptions: Object.values(FieldConfigProperty).filter((v) => v !== FieldConfigProperty.Links),
  })
  .setPanelOptions((builder, context) => {
    builder.addNumberInput({
      path: 'numberOfLayers',
      name: 'Number of Layers',
      description: 'Configure the number of layers for the 3D visualization',
      defaultValue: 3,
      settings: {
        min: 1,
        max: 10,
        step: 1,
        integer: true,
      },
    });
  });
