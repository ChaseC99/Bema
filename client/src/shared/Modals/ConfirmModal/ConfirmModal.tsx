import { MouseEventHandler, useEffect } from "react"
import Button from "../../Button/Button"
import "../Modals.css";

type ConfirmModalProps = {
  title: string
  confirmLabel: string
  handleConfirm: ((data: any) => any) | MouseEventHandler<HTMLSpanElement>
  handleCancel: ((data: any) => any) | MouseEventHandler<HTMLSpanElement>
  children: React.ReactChild | React.ReactChild[]
  destructive?: boolean
  data?: any
  testId?: string
}

/**
 * Renders a modal that confirms a user wants to take the presented action. The programmer can specify cancel and confirm handlers, 
 * that will either be called with a default click event or a optionally provided data property.
 * @param props title (string), confirmLabel (string), handleConfirm (click handler or function with data parameter), handleCancel (click handler or function with data parameter), children (ReactChild or ReactChild[]), destructive (optional boolean), data (optional any)
 * @returns 
 */
function ConfirmModal(props: ConfirmModalProps) {
  useEffect(() => {
    document.body.classList.add("stop-scrolling");
  }, []);

  const handleClose = () => {
    document.body.classList.remove("stop-scrolling");
    props.handleCancel(props.data)
  }

  const handleConfirm = (data: any) => {
    document.body.classList.remove("stop-scrolling");
    props.handleConfirm(props.data);
  }

  return (
    <div className="modal-background-container">
      <div className="modal-container col-4" data-testid={props.testId}>
        <div className="modal-header">
          <h2>{props.title}</h2>
          <button className="close-modal" onClick={handleClose} data-testid={props.testId + "-close"}>
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 10.586L7.706 6.293a1 1 0 1 0-1.413 1.413L10.586 12l-4.293 4.294a1 1 0 0 0 1.413 1.413L12 13.414l4.294 4.293a1 1 0 0 0 1.413-1.413L13.414 12l4.293-4.294a1 1 0 1 0-1.413-1.413L12 10.586z"></path></svg>
          </button>
        </div>
        <div className="modal-body">
          {props.children}
        </div>
        <div className="modal-footer">
          <div className="confirm-modal-actions">
            <Button type="tertiary" role="button" action={handleClose} text="Cancel" testId={props.testId + "-cancel"} />
            <Button type="primary" role="button" action={handleConfirm} text={props.confirmLabel} destructive={props.destructive} testId={props.testId + "-confirm"} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;