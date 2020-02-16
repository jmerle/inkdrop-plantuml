import * as React from 'react';
import PropTypes from 'prop-types';
import { CompositeDisposable } from 'event-kit';
import { createImageURL } from './generator';

export class PlantUML extends React.Component {
  constructor(props) {
    super(props);

    this.currentPromise = null;

    this.state = {
      image: '',
      error: null,
    };

    this.containerRef = React.createRef();
  }

  componentWillMount() {
    this.subscriptions = new CompositeDisposable();

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
    return (
      this.hasCodeChanged(nextProps) ||
      nextState.image !== this.state.image ||
      nextState.error !== this.state.error
    );
  }

  render() {
    const { image, error } = this.state;
    const code = this.getCode();

    if (code.trim().length === 0) {
      return this.renderError('No PlantUML code given.');
    }

    if (error !== null) {
      return this.renderError(error.message);
    }

    if (image === 'data:image/png;base64,') {
      return <div ref={this.containerRef} />;
    }

    return <img src={image} ref={this.containerRef} />;
  }

  renderError(message) {
    return (
      <div className="ui error message plantuml-error" ref={this.containerRef}>
        <div className="header">Failed to render PlantUML</div>
        <div>{message}</div>
      </div>
    );
  }

  renderDiagram() {
    if (this.currentPromise !== null) {
      this.currentPromise.cancel();
    }

    this.currentPromise = createImageURL(this.getCode());
    this.currentPromise
      .then(url => {
        this.setState({
          image: url,
          error: null,
        });
      })
      .catch(err => {
        this.setState({
          image: '',
          error: err,
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

PlantUML.propTypes = {
  children: PropTypes.node,
};
