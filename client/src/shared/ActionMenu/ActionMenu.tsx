import { MouseEvent, MouseEventHandler } from "react";
import ActionItem from "./ActionItem";
import "./ActionMenu.css";

export type Action =
    | {
        role: "button"
        action: MouseEventHandler<HTMLSpanElement> | ((data: any) => any)
        text: string
        data?: any
        testId?: string
    }
    | {
        role: "link"
        action: string
        text: string
        testId?: string
    }

type ActionMenuProps = {
    actions: Action[]
    testId?: string
}

/**
 * Creates an actionable list menu that displays after clicking an action icon.
 * @param props An array of actions that each include a role (link or button), action (path or click handler), and text (string)
 * @returns 
 */
function ActionMenu(props: ActionMenuProps) {
    return (
        <div className="actions-dropdown" data-testid={props.testId}>
            <div className="actions-dropdown-wrapper" >
                <i className="actions-dropdown-btn" onClick={handleClick} />
                <div className="actions-dropdown-content" hidden>
                    {props.actions.map((a, index) => {
                        if (a.role === "button") {
                            return <ActionItem role={a.role} action={a.action} data={a.data} text={a.text} testId={a.testId} key={index} />
                        }
                        else {
                            return <ActionItem role={a.role} action={a.action} text={a.text} testId={a.testId} key={index} />
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

    const icon = e.target as Node;
    const actionContent = icon.nextSibling as HTMLDivElement;
    actionContent.hidden = false;
}

export default ActionMenu;