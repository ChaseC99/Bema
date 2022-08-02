import { useEffect } from "react"
import { Form, FormFields } from "../../Forms";
import "../Modals.css";

type FormModalProps = {
  title: string
  submitLabel: string
  handleSubmit: (values: { [name: string]: any }) => void
  handleCancel: () => void
  fields: FormFields[]
  testId?: string
  cols?: number
  loading?: boolean
  disabled?: boolean
}

/**
 * Renders a modal that contains a data form. The programmer can specify handlers for form submission and cancellation.
 * @param props title (string), submitLabel (string), handleSubmit (receives an object with the form data), handleCancel, fields (a list of FormFields), cols (the width of the modal)
 * @returns 
 */
function FormModal(props: FormModalProps) {
  useEffect(() => {
    document.body.classList.add("stop-scrolling");
  }, []);

  const handleClose = () => {
    document.body.classList.remove("stop-scrolling");
    props.handleCancel();
  }

  const handleSubmit = (values: { [name: string]: any }) => {
    document.body.classList.remove("stop-scrolling");

    props.handleSubmit(values);
  }

  return (
    <div className="modal-background-container">
      <div className={"modal-container col-" + (props.cols || 6)} data-testid={props.testId}>
        <div className="modal-header">
          <h2>{props.title}</h2>
          <button className="close-modal" onClick={handleClose} data-testid={props.testId + "-close"}>
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 10.586L7.706 6.293a1 1 0 1 0-1.413 1.413L10.586 12l-4.293 4.294a1 1 0 0 0 1.413 1.413L12 13.414l4.294 4.293a1 1 0 0 0 1.413-1.413L13.414 12l4.293-4.294a1 1 0 1 0-1.413-1.413L12 10.586z"></path></svg>
          </button>
        </div>
        <Form onSubmit={handleSubmit} onCancel={handleClose} submitLabel={props.submitLabel} fields={props.fields} testId={props.testId + "-form"} loading={props.loading} disabled={props.disabled} />
      </div>
    </div>
  );
}

export default FormModal;