import { MouseEventHandler } from "react";
import { Link } from "react-router-dom";
import "./Button.css";

type ButtonProps =
  | {
    style: "primary" | "secondary" | "tertiary"
    role: "link"
    action: string
    text: string
    inverse?: boolean
    destructive?: boolean
    testId?: string
  }
  | {
    style: "primary" | "secondary" | "tertiary"
    role: "button"
    action: MouseEventHandler<HTMLSpanElement>
    text: string
    inverse?: boolean
    destructive?: boolean
    testId?: string
  }

/**
 * Creates a button component. The button can be either a link, or an actionable button with a
 * click handler.
 * @param props style (primary, secondary, or tertiary), role (link or button), action (string or click handler), text
 * @returns 
 */
function Button(props: ButtonProps) {
  let c = "btn-" + props.style;
  if (props.inverse && props.style === "tertiary") {
    c += "-inverse";
  }

  if (props.destructive) {
    c = "btn-destructive-" + props.style;
  }

  if (props.role === "link") {
    return (
      <Link to={props.action} data-testid={props.testId}>
        <span className={c}>
          {props.text}
        </span>
      </Link>
    );
  }
  else {
    return (
      <span className={c} onClick={props.action} data-testid={props.testId}>
        {props.text}
      </span>
    );
  }
}

export default Button;