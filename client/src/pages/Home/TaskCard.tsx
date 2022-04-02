import ActionMenu from "../../shared/ActionMenu";
import { Action } from "../../shared/ActionMenu/ActionMenu";
import "./TaskCard.css";

type TaskCardProps = {
  title: string
  status: "Not Started" | "Started"
  id: number
  dueDate: string
  assigned: boolean
  updateTaskStatus: (data: any) => any
  signupForTask: (data: any) => any
  testId?: string
}

function TaskCard(props: TaskCardProps) {
  let actions: Action[] = [];

  if (!props.assigned) {
    actions = [{
      role: "button",
      action: props.signupForTask,
      data: props.id,
      text: "Sign up for task",
      testId: props.testId ? props.testId + "-actions-1" : undefined
    }];
  }
  else if (props.status === "Not Started") {
    actions = [{
      role: "button",
      action: props.updateTaskStatus,
      data: props.id,
      text: "Mark as started",
      testId: props.testId ? props.testId + "-actions-1" : undefined
    }];
  }
  else {
    actions = [{
      role: "button",
      action: props.updateTaskStatus,
      data: props.id,
      text: "Mark as completed",
      testId: props.testId ? props.testId + "-actions-1" : undefined
    }];
  }

  return (
    <article className="card task-card" data-testid={props.testId}>
      <div className="card-header">
        <h3>{props.title}</h3>
        <ActionMenu actions={actions} testId={props.testId ? props.testId + "-actions" : undefined} />
      </div>
      <div className="card-body">
        <p><span className="label">Status:</span> {props.status}</p>
        <p><span className="label">Due by:</span> {props.dueDate}</p>
      </div>
    </article>
  );
}

export default TaskCard;