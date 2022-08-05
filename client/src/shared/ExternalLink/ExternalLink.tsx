import React, { ReactChild } from "react";

type ExternalLinkProps = {
  to: string
  target?: "_blank" | "_self" | "_parent" | "_top"
  children: ReactChild | ReactChild[]
}

function ExternalLink(props: ExternalLinkProps) {
  return (
    <a href={props.to} target={props.target || "_blank"} >{props.children}</a>
  );
}

export default ExternalLink;