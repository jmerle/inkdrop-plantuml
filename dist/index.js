"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.config = void 0;

var _inkdrop = require("inkdrop");

var _PlantUML = require("./PlantUML");

const config = {
  mode: {
    title: 'Mode',
    description: 'Whether to use the PlantUML jar provided by the plugin or the server specified below.',
    type: 'string',
    enum: ['Local', 'Server'],
    default: 'Local'
  },
  serverUrl: {
    title: 'Server URL',
    description: "The PlantUML server to use when the 'Server' mode is selected.",
    type: 'string',
    default: 'https://plantuml.com/plantuml'
  }
};
exports.config = config;

function activate() {
  if (_inkdrop.markdownRenderer) {
    _inkdrop.markdownRenderer.remarkCodeComponents.plantuml = _PlantUML.PlantUML;
  }
}

function deactivate() {
  if (_inkdrop.markdownRenderer) {
    _inkdrop.markdownRenderer.remarkCodeComponents.plantuml = null;
  }
}
//# sourceMappingURL=index.js.map