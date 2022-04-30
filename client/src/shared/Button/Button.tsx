import { MouseEventHandler } from "react";
import { Link } from "react-router-dom";
import "./Button.css";

type ButtonProps =
  | {
    type: "primary" | "secondary" | "tertiary"
    role: "link"
    action: string
    text: string
    inverse?: boolean
    destructive?: boolean
    testId?: string
  }
  | {
    type: "primary" | "secondary" | "tertiary"
    role: "button"
    action: MouseEventHandler<HTMLSpanElement> | ((data: any) => any)
    text: string
    data?: any
    inverse?: boolean
    destructive?: boolean
    disabled?: boolean
    testId?: string
  }

/**
 * Creates a button component. The button can be either a link, or an actionable button with a
 * click handler.
 * @param props style (primary, secondary, or tertiary), role (link or button), action (string or click handler), text
 * @returns 
 */
function Button(props: ButtonProps) {
  let c = "btn-" + props.type;
  if (props.inverse && props.type === "tertiary") {
    c += "-inverse";
  }

  if (props.destructive) {
    c = "btn-destructive-" + props.type;
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
    if (props.data) {
      return (
        <button className={c} onClick={() => props.action(props.data)} data-testid={props.testId} disabled={props.disabled}>
          <span>
            {props.text}
          </span>
        </button>
      );
    }

    return (
      <button className={c} onClick={props.action} data-testid={props.testId} disabled={props.disabled}>
        <span>
          {props.text}
        </span>
      </button>
    );
  }
}

export default Button;