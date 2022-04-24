import { useEffect } from "react"

type InfoModalProps = {
  title: string
  children: React.ReactChild | React.ReactChild[]
  handleClose: () => void
  testId?: string
}

function InfoModal(props: InfoModalProps) {
  useEffect(() => {
    document.body.classList.add("stop-scrolling");
  }, []);

  const closeModal = () => {
    document.body.classList.remove("stop-scrolling");
    props.handleClose();
  }

  return (
    <div className="modal-background-container">
      <div className="modal-container col-4" data-testid={props.testId}>
        <div className="modal-header">
          <h2>{props.title}</h2>
          <button className="close-modal" onClick={closeModal} data-testid={props.testId + "-close"}>
            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 10.586L7.706 6.293a1 1 0 1 0-1.413 1.413L10.586 12l-4.293 4.294a1 1 0 0 0 1.413 1.413L12 13.414l4.294 4.293a1 1 0 0 0 1.413-1.413L13.414 12l4.293-4.294a1 1 0 1 0-1.413-1.413L12 10.586z"></path></svg>
          </button>
        </div>
        <div className="modal-body">
          {props.children}
        </div>
      </div>
    </div>
  );
}

export default InfoModal;