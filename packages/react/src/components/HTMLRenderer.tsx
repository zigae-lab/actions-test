import React from 'react';

import parse from 'html-react-parser';
import domToReact, { HTMLReactParserOptions, DOMNode } from 'html-react-parser/lib/dom-to-react';

interface Props {
  html?: string;
  components?: Record<string, React.ComponentType<unknown>>;
  componentOverrides?: Record<
    string,
    (originalComponent: React.ComponentType<unknown>) => React.ComponentType<unknown>
  >;
}

interface Replace {
  name: string;
  attribs: Record<string, string>;
  children: DOMNode[];
}

const HTMLRenderer = ({ html = '', components = {}, componentOverrides = {} }: Props) => {
  const resolvedComponents = Object.keys(componentOverrides).reduce(
    (acc, key) => {
      const Comp = components[key] ?? ((props) => React.createElement(key, props));

      acc[key] = componentOverrides[key](Comp);

      return acc;
    },
    { ...components }
  );

  const parserOptions = {
    replace: ({ name, attribs, children: nodes }: Replace) => {
      const children = nodes
        ? domToReact(nodes, {
            ...(parserOptions as HTMLReactParserOptions),
          })
        : null;

      const Component = resolvedComponents[name];

      if (!Component) return;

      return React.createElement(Component, { ...attribs }, children);
    },
  };

  return parse(html, parserOptions as HTMLReactParserOptions) as JSX.Element;
};

export default HTMLRenderer;
