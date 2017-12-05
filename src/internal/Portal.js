// @flow

import PropTypes from 'prop-types';
import React from 'react';
import type { Node } from 'react';
import ReactDOM from 'react-dom';
import canUseDom from 'dom-helpers/util/inDOM';

export type Props = {
  /**
   * The content to portal in order to escape the parent DOM node.
   */
  children?: Node,
  /**
   * If `true` the children will be mounted into the DOM.
   */
  open?: boolean,
};

/**
 * @ignore - internal component.
 */
class Portal extends React.Component<Props> {
  static contextTypes = {
    document: PropTypes.object,
  };

  static defaultProps = {
    open: false,
  };

  componentDidMount() {
    // Support react@15.x, will be removed at some point
    if (!ReactDOM.createPortal) {
      this.renderLayer();
    }
  }

  componentDidUpdate() {
    // Support react@15.x, will be removed at some point
    if (!ReactDOM.createPortal) {
      this.renderLayer();
    }
  }

  componentWillUnmount() {
    this.unrenderLayer();
  }

  getDocument() {
    const { document: contextDocument } = this.context;
    return contextDocument || document;
  }

  getLayer() {
    const doc = this.getDocument();

    if (!this.layer) {
      this.layer = doc.createElement('div');
      this.layer.setAttribute('data-mui-portal', 'true');
      if (doc.body && this.layer) {
        doc.body.appendChild(this.layer);
      }
    }

    return this.layer;
  }

  layer: ?HTMLElement = null;

  unrenderLayer() {
    if (!this.layer) {
      return;
    }

    // Support react@15.x, will be removed at some point
    if (!ReactDOM.createPortal) {
      ReactDOM.unmountComponentAtNode(this.layer);
    }

    const doc = this.getDocument();

    if (doc.body) {
      doc.body.removeChild(this.layer);
    }
    this.layer = null;
  }

  renderLayer() {
    const { children, open } = this.props;

    if (open) {
      // By calling this method in componentDidMount() and
      // componentDidUpdate(), you're effectively creating a "wormhole" that
      // funnels React's hierarchical updates through to a DOM node on an
      // entirely different part of the page.
      const layerElement = React.Children.only(children);
      ReactDOM.unstable_renderSubtreeIntoContainer(this, layerElement, this.getLayer());
    } else {
      this.unrenderLayer();
    }
  }

  render() {
    const { children, open } = this.props;

    // Support react@15.x, will be removed at some point
    if (!ReactDOM.createPortal) {
      return null;
    }

    // Can't be rendered server-side.
    if (canUseDom) {
      if (open) {
        const layer = this.getLayer();
        // $FlowFixMe layer is non-null
        return ReactDOM.createPortal(children, layer);
      }

      this.unrenderLayer();
    }

    return null;
  }
}

export default Portal;
