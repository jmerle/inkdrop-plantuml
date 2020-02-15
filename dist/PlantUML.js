"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlantUML = void 0;

var React = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _eventKit = require("event-kit");

var _generator = require("./generator");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class PlantUML extends React.Component {
  constructor(props) {
    super(props);
    this.currentPromise = null;
    this.state = {
      image: '',
      error: null
    };
    this.containerRef = React.createRef();
  }

  componentWillMount() {
    this.subscriptions = new _eventKit.CompositeDisposable();

    const configCallback = () => this.renderDiagram();

    for (const key of ['mode', 'serverUrl']) {
      const configKey = `plantuml.${key}`;
      const disposable = inkdrop.config.onDidChange(configKey, configCallback);
      this.subscriptions.add(disposable);
    }
  }

  componentWillUnmount() {
    this.subscriptions.dispose();

    if (this.currentPromise !== null) {
      this.currentPromise.cancel();
    }
  }

  componentDidMount() {
    this.renderDiagram();
    this.containerRef.current.parentElement.classList.add('plantuml-container');
  }

  componentDidUpdate(previousProps) {
    if (this.hasCodeChanged(previousProps)) {
      this.renderDiagram();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.hasCodeChanged(nextProps) || nextState.image !== this.state.image || nextState.error !== this.state.error;
  }

  render() {
    const {
      image,
      error
    } = this.state;
    const code = this.getCode();

    if (code.trim().length === 0) {
      return this.renderError('No PlantUML code given.');
    }

    if (error !== null) {
      return this.renderError(error.message);
    }

    if (image === 'data:image/png;base64,') {
      return React.createElement("div", {
        ref: this.containerRef
      });
    }

    return React.createElement("img", {
      src: image,
      ref: this.containerRef
    });
  }

  renderError(message) {
    return React.createElement("div", {
      className: "ui error message plantuml-error",
      ref: this.containerRef
    }, React.createElement("div", {
      className: "header"
    }, "Failed to render PlantUML"), React.createElement("div", null, message));
  }

  renderDiagram() {
    if (this.currentPromise !== null) {
      this.currentPromise.cancel();
    }

    this.currentPromise = (0, _generator.createImageURL)(this.getCode()).then(url => {
      this.setState({
        image: url,
        error: null
      });
    }).catch(err => {
      this.setState({
        image: '',
        error: err
      });
    });
  }

  getCode(props = this.props) {
    return props.children[0];
  }

  hasCodeChanged(otherProps) {
    return this.getCode() !== this.getCode(otherProps);
  }

}

exports.PlantUML = PlantUML;
PlantUML.propTypes = {
  children: _propTypes.default.node
};
//# sourceMappingURL=PlantUML.js.map