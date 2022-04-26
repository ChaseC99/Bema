import { MouseEvent } from "react";
import { Action } from ".";
import ActionItem from "./ActionItem";
import "./ActionMenu.css";

type ActionMenuProps = {
  actions: Action[]
  label?: string
  testId?: string
}

/**
 * Creates an actionable list menu that displays after clicking an action icon.
 * @param props An array of actions that each include a role (link or button), action (path or click handler), and text (string)
 * @returns 
 */
function ActionMenu(props: ActionMenuProps) {
  if (props.actions.length === 0) {
    return null;
  }

  return (
    <div className="actions-dropdown" data-testid={props.testId}>
      <div className="actions-dropdown-wrapper" >

        {!props.label && <i className="actions-dropdown-btn-icon" onClick={handleClick} />}

        {props.label &&
          <div className="actions-dropdown-text-container">
            <span className="actions-dropdown-btn-text btn-tertiary" onClick={handleClick}>{props.label}</span>
            <svg width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 8.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 8.586z"></path></svg>
          </div>
        }

        <div className={"actions-dropdown-content" + (props.label ? " actions-dropdown-content-text" : "")} hidden>
          {props.actions.map((a, index) => {
            if (a.role === "button") {
              return <ActionItem role={a.role} action={a.action} data={a.data} text={a.text} testId={a.testId} key={index} disabled={a.disabled} />
            }
            else {
              return <ActionItem role={a.role} action={a.action} text={a.text} testId={a.testId} key={index} disabled={a.disabled} />
            }
          })}
        </div>
      </div>
    </div>
  );
}

function handleClick(e: MouseEvent) {
  // Hide any menus that are already open
  const actionMenus = document.querySelectorAll(".actions-dropdown-content");
  actionMenus.forEach((m) => {
    const menu = m as HTMLDivElement;
    menu.hidden = true;
  });

  const t = e.target as HTMLElement;
  if (t.classList.contains("actions-dropdown-btn-icon")) {
    const actionContent = t.nextSibling as HTMLDivElement;
    actionContent.hidden = false;
  }

  if (t.classList.contains("actions-dropdown-btn-text")) {
    const actionContent = t.parentNode?.nextSibling as HTMLDivElement;
    actionContent.hidden = false;
  }
}

export default ActionMenu;