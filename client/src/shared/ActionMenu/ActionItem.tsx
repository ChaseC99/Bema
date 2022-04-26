import { MouseEventHandler } from "react";
import { Link } from "react-router-dom";

type ActionItemProps =
  | {
    role: "button"
    action: MouseEventHandler<HTMLSpanElement> | ((data: any) => any)
    text: string
    disabled?: boolean
    testId?: string
    data?: any
  }
  | {
    role: "link"
    action: string
    text: string
    disabled?: boolean
    testId?: string
  }

/**
 * Used only internally by the ActionMenu component. The component can be either
 * a link or a clickable button.
 * @param props role (button or link), action (click handler or path), text (string), optional testId (string)
 * @returns 
 */
function ActionItem(props: ActionItemProps) {
  if (props.disabled) {
    return (
      <span className="disabled" data-testid={props.testId}>{props.text}</span>
    );
  }

  if (props.role === "button") {
    if (props.data) {
      return (
        <span onClick={() => props.action(props.data)} data-testid={props.testId}>{props.text}</span>
      );
    }

    return (
      <span onClick={props.action} data-testid={props.testId}>{props.text}</span>
    );
  }
  else {
    return (
      <Link to={props.action} data-testid={props.testId}><span>{props.text}</span></Link>
    );
  }
}

export default ActionItem;