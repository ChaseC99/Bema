import ActionMenu from "../../shared/ActionMenu";
import { Action } from "../../shared/ActionMenu/ActionMenu";
import "./TaskCard.css";

type TaskCardProps = {
  title: string
  status: "Not Started" | "Started"
  id: number
  dueDate: string
  assigned: boolean
  updateTaskStatus: React.MouseEventHandler<HTMLSpanElement>
  signupForTask: React.MouseEventHandler<HTMLSpanElement>
  testId?: string
}

function TaskCard(props: TaskCardProps) {
  let actions: Action[] = [];

  if (!props.assigned) {
    actions = [{
      role: "button",
      action: props.signupForTask,
      text: "Sign up for task"
    }];
  }
  else if (props.status === "Not Started") {
    actions = [{
      role: "button",
      action: props.updateTaskStatus,
      text: "Mark as started"
    }];
  }
  else {
    actions = [{
      role: "button",
      action: props.updateTaskStatus,
      text: "Mark as completed"
    }];
  }

  return (
    <article className="card task-card" data-testid={props.testId}>
      <div className="card-header">
        <h3>{props.title}</h3>
        <ActionMenu actions={actions} />
      </div>
      <div className="card-body">
        <p><span className="label">Status:</span> {props.status}</p>
        <p><span className="label">Due by:</span> {props.dueDate}</p>
      </div>
    </article>
  );
}

export default TaskCard;