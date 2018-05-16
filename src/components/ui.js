import React from "react";

export const Block = ({ $css, ...props }) => (
  <div style={{ display: "block", ...$css }} {...props} />
);

export const InlineBlock = ({ $css, ...props }) => (
  <div style={{ display: "inline-block", ...$css }} {...props} />
);

export const Inline = ({ $css, ...props }) => (
  <div style={{ display: "inline", ...$css }} {...props} />
);

export const FlexColumn = ({ $css, ...props }) => (
  <div
    style={{ display: "flex", flexDirection: "column", ...$css }}
    {...props}
  />
);

export const Image = ({ $css, alt, ...props }) => (
  <img style={{ verticalAlign: "middle", ...$css }} alt={alt} {...props} />
);

export const FlexRow = ({ $css, ...props }) => (
  <div style={{ display: "flex", flexDirection: "row", ...$css }} {...props} />
);
