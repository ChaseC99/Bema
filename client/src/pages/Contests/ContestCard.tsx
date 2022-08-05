import { Link } from "react-router-dom";
import { Contest } from ".";
import ActionMenu, { Action } from "../../shared/ActionMenu";
import useAppState from "../../state/useAppState";

type ContestCardProps = {
  contest: Contest
  handleEditContest: (id: number) => void
  handleDeleteContest: (id: number) => void
  testId?: string
}

function ContestCard(props: ContestCardProps) {
  const { state } = useAppState();

  const actions: Action[] = [];

  if (state.isAdmin || state.user?.permissions.edit_contests) {
    actions.push({
      role: "button",
      action: props.handleEditContest,
      text: "Edit",
      data: props.contest.id,
      testId: "edit-contest-action"
    });
  }

  if (state.isAdmin || state.user?.permissions.delete_contests) {
    actions.push({
      role: "button",
      action: props.handleDeleteContest,
      text: "Delete",
      data: props.contest.id,
      testId: "delete-contest-action"
    });
  }

  return (
    <article className="card col-4" data-testid={props.testId}>
      <div className="card-header">
        <h3>
          {props.contest.name}
          {props.contest.isCurrent && <span className="badge">Active</span>}
        </h3>
        <ActionMenu actions={actions}/>
      </div>
      <div className="card-body">
        <img src={props.contest.url + "/latest.png"} alt="" style={{width: "200px", height: "200px"}} />
        <p><span className="label">Start:</span> {props.contest.startDate}</p>
        <p><span className="label">End:</span> {props.contest.endDate}</p>
        <p><Link to={"/entries/" + props.contest.id}>View Entries</Link></p>
        {state.loggedIn && <p><Link to={"/evaluations/" + state.user?.id + "/" + props.contest.id}>Evaluations</Link></p>}
        <p><Link to={"/results/" + props.contest.id}>View Results</Link></p>
      </div>
    </article>
  );
}

export default ContestCard;