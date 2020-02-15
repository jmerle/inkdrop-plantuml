import { markdownRenderer } from 'inkdrop';
import { PlantUML } from './PlantUML';

export const config = {
  mode: {
    title: 'Mode',
    description:
      'Whether to use the PlantUML jar provided by the plugin or the server specified below.',
    type: 'string',
    enum: ['Local', 'Server'],
    default: 'Local',
  },
  serverUrl: {
    title: 'Server URL',
    description:
      "The PlantUML server to use when the 'Server' mode is selected.",
    type: 'string',
    default: 'https://plantuml.com/plantuml',
  },
};

export function activate() {
  if (markdownRenderer) {
    markdownRenderer.remarkCodeComponents.plantuml = PlantUML;
  }
}

export function deactivate() {
  if (markdownRenderer) {
    markdownRenderer.remarkCodeComponents.plantuml = null;
  }
}
