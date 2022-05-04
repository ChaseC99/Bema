import React, { ReactChild } from "react";

type ExternalLinkProps = {
  to: string
  target?: "_blank" | "_self" | "_parent" | "_top"
  children: ReactChild | ReactChild[]
}

function ExternalLink(props: ExternalLinkProps) {
  const handleClick = () => {
    window.open(props.to, props.target || "_blank");
  }

  return (
    <a href={props.to} target={props.target} onClick={handleClick}>{props.children}</a>
  );
}

export default ExternalLink;