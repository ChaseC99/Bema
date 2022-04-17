import { MouseEventHandler } from "react";
import ActionMenu from "./ActionMenu";

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

export default ActionMenu;