import { MouseEventHandler } from "react";
import ActionMenu from "./ActionMenu";

export type Action =
  | {
    role: "button"
    action: MouseEventHandler<HTMLSpanElement> | ((data: any) => any)
    text: string
    data?: any
    disabled?: boolean
    testId?: string
  }
  | {
    role: "link"
    action: string
    text: string
    disabled?: boolean
    testId?: string
  }

export default ActionMenu;