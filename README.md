# PlantUML plugin for Inkdrop

[![Build Status](https://dev.azure.com/jmerle/inkdrop-plantuml/_apis/build/status/Build?branchName=master)](https://dev.azure.com/jmerle/inkdrop-plantuml/_build/latest?definitionId=19&branchName=master)
[![Latest release](https://img.shields.io/github/v/release/jmerle/inkdrop-plantuml)](https://my.inkdrop.app/plugins/plantuml)
[![License](https://img.shields.io/github/license/jmerle/inkdrop-plantuml)](https://github.com/jmerle/inkdrop-plantuml/blob/master/LICENSE)

This plugin makes it possible to add PlantUML diagrams to notes.

## Install

```
ipm install plantuml
```

## Usage

    ```plantuml
    @startuml
    autonumber
    Bob -> Alice : Authentication Request
    Bob <- Alice : Authentication Response
    @enduml
    ```

Will be rendered as:

![](https://i.imgur.com/o7bFhvy.png)

The plugin has two modes, which can be configured in the plugin's settings:
- Local (default): diagrams are generated using the PlantUML jar provided by the plugin. To be able to generate all diagram types [Graphviz](https://graphviz.org/) needs to be installed separately.
- Server: diagrams are generated using the PlantUML server located at the server url provided in the plugin's settings.

## Changelog

See the [GitHub releases](https://github.com/jmerle/inkdrop-plantuml/releases) for an overview of what changed in each update.

## Contributing

All contributions are welcome. Please read the [Contributing Guide](https://github.com/jmerle/inkdrop-plantuml/blob/master/CONTRIBUTING.md) first as it contains information regarding the tools used by the project and instructions on how to set up a development environment.
