import React, { PropTypes } from 'react';
import Radium  from 'radium';
import { convertColor } from './Color';
import WindowFocusComponent from './DesktopComponent/WindowFocusComponent';
import PlaceholderStyleComponent from './DesktopComponent/PlaceholderStyleComponent';
import CommonStylingComponent from './DesktopComponent/CommonStylingComponent';

export const WindowFocus = 'WindowFocus';
export const PlaceholderStyle = 'PlaceholderStyle';
export const Dimension = 'Dimension';
export const Margin = 'Margin';
export const Padding = 'Padding';
export const HorizontalAlignment = 'HorizontalAlignment';
export const VerticalAlignment = 'VerticalAlignment';
export const Alignment = 'Alignment';
export const Hidden = 'Hidden';

function ExtendComposedComponent(options, ComposedComponent) {
  @Radium
  class Component extends ComposedComponent {
    static propTypes = {
      children: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.array]),
      style: PropTypes.object,
      visible: PropTypes.bool,
      display: PropTypes.bool,
      color: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      background: PropTypes.string,
      requestedTheme: PropTypes.string,
      ...ComposedComponent.propTypes
    };

    static childContextTypes = {
      parent: PropTypes.oneOfType([PropTypes.element, PropTypes.object]),
      color: PropTypes.string,
      background: PropTypes.string,
      requestedTheme: PropTypes.string,
      storage: PropTypes.object,
      ...ComposedComponent.childContextTypes
    };

    static contextTypes = {
      parent: PropTypes.oneOfType([PropTypes.element, PropTypes.object]),
      color: PropTypes.string,
      background: PropTypes.string,
      requestedTheme: PropTypes.string,
      storage: PropTypes.object,
      ...ComposedComponent.contextTypes
    };

    _components = [];

    constructor(props, context, updater) {
      const { visible, display, requestedTheme, storage, color, background, ...properties } = props;
      super(props, context, updater);
      this._requestedTheme = requestedTheme;
      this._background = background;
      this._color = color;

      this.context = this.context || {};
      this.state = this.state || {};
    
      this.state.visible = this.state.visible || visible !== false;
      this.state.display = this.state.display || display !== false;

      if (!context.storage) {
        this.context.storage = storage ? storage : null;
      }
      this.storage = storage ? storage : this.context.storage;

      if (!context.requestedTheme) {
        this.context.requestedTheme = requestedTheme ? requestedTheme : 'light';
      }
      this.state.requestedTheme = requestedTheme ? requestedTheme : this.context.requestedTheme;

      if (!context.color) {
        this.context.color = color && typeof color !== 'boolean' ? convertColor(color) : convertColor('blue');
      }
      this.state.color = color && typeof color !== 'boolean' ? convertColor(color) : this.context.color;

      if (!context.background) {
        this.context.background = background ? convertColor(background) : null;
      }
      this.state.background = background ? convertColor(background) : this.context.background;

      this.init();
    }

    init() {
      if (options.indexOf(WindowFocus) !== -1) {
        this._components = [...this._components, new WindowFocusComponent(this)];
      }
      if (options.indexOf(PlaceholderStyle) !== -1) {
        this._components = [...this._components, new PlaceholderStyleComponent(this)];
      }
      if (
        options.indexOf(Dimension) !== -1 ||
        options.indexOf(Margin) !== -1 ||
        options.indexOf(Padding) !== -1 ||
        options.indexOf(HorizontalAlignment) !== -1 ||
        options.indexOf(VerticalAlignment) !== -1 ||
        options.indexOf(Alignment) !== -1 ||
        options.indexOf(Hidden) !== -1
      ) {
        let componentOptions = {
          dimension: options.indexOf(Dimension) !== -1,
          margin: options.indexOf(Margin) !== -1,
          padding: options.indexOf(Padding) !== -1,
          horizontalAlignment: options.indexOf(HorizontalAlignment) !== -1,
          verticalAlignment: options.indexOf(VerticalAlignment) !== -1,
          alignment: options.indexOf(Alignment) !== -1,
          hidden: options.indexOf(Hidden) !== -1
        };
        Component.propTypes = { ...Component.propTypes, ...CommonStylingComponent.propTypes(componentOptions) };
        this._components = [...this._components, new CommonStylingComponent(this, componentOptions)];
      }
    }

    getChildContext() {
      const childContext = {
        parent: this,
        color: this.state.color,
        background: this.state.background,
        requestedTheme: this.state.requestedTheme,
        storage: this.storage
      };

      if (super.getChildContext) {
        return {
          ...childContext,
          ...super.getChildContext()
        };
      }

      return childContext;
    }

    setState(state) {
      if (state.requestedTheme) {
        this._updateRequestedTheme = true;
        this.context.requestedTheme = state.requestedTheme;
      }
      if (state.color) {
        this._updateColor = true;
        this.context.color = state.color;
      }
      if (state.background) {
        this._updateBackground = true;
        this.context.background = state.background;
      }
      super.setState(state);
    }

    componentDidMount() {
      if (super.componentDidMount) {
        super.componentDidMount();
      }

      for (const component of this._components) {
        if (component.componentDidMount) {
          component.componentDidMount();
        }
      }
    }

    componentDidUpdate() {
      if (super.componentDidUpdate) {
        super.componentDidUpdate();
      }

      for (const component of this._components) {
        if (component.componentDidUpdate) {
          component.componentDidUpdate();
        }
      }
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) {
        super.componentWillUnmount();
      }

      for (const component of this._components) {
        if (component.componentWillUnmount) {
          component.componentWillUnmount();
        }
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (super.shouldComponentUpdate) {
        return super.shouldComponentUpdate();
      }

      for (var prop in nextState) {
        if (nextState.hasOwnProperty(prop)) {
          if (typeof this.state[prop] === 'undefined' || nextState[prop] !== this.state[prop]) {
            return true;
          }
        }
      }

      return false;
    }

    render(...params) {
      if (!this._updateRequestedTheme && !this._requestedTheme) {
        this.state.requestedTheme = this.context.requestedTheme;
      }
      this._updateRequestedTheme = null;

      if (!this._updateColor && !this._color) {
        this.state.color = this.context.color;
      }
      this._updateColor = null;

      if (!this._updateBackground && !this._background) {
        this.state.background = this.context.background;
      }
      this._updateBackground = null;

      let rendered = super.render(params);

      if (super.getPlaceholderStyle) {
        rendered = <div ref="container">{rendered}</div>;
      }

      for (const component of this._components) {
        if (component.render) {
          rendered = component.render(rendered);
        }
      }

      return rendered;
    }
  }

  return Component;
}

export default function DesktopComponent(...options) {
  if (options.length === 1 && typeof options[0] === 'function') {
    return ExtendComposedComponent.apply(null, [[], options[0]]);
  }

  return ExtendComposedComponent.bind(null, options);
}
