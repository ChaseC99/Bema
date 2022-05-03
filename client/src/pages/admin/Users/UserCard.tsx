import { Link } from "react-router-dom";
import { User } from ".";
import ActionMenu, { Action } from "../../../shared/ActionMenu";
import ExternalLink from "../../../shared/ExternalLink";

type UserCardProps = {
  user: User
  testId?: string
}

function UserCard(props: UserCardProps) {

  const actions: Action[] = [];
  return (
    <article className="card col-4" data-testid={props.testId}>
        <div className="card-header">
          <h3>
            {props.user.evaluator_name}
            {props.user.is_admin && <span className="badge">Admin</span>}
          </h3>
          <ActionMenu actions={actions}/>
        </div>
        <div className="card-body">
          <p><ExternalLink to={"https://www.khanacademy.org/profile/" + props.user.evaluator_kaid} target="_blank">KA Profile</ExternalLink></p>
          <p><Link to={"/evaluator/" + props.user.evaluator_id}>Bema Profile</Link></p>
          <p><span className="label">ID: </span>{props.user.evaluator_id}</p>
          <p><span className="label">KAID: </span>{props.user.evaluator_kaid}</p>
          <p><span className="label">Username: </span>{props.user.username}</p>
          <p><span className="label">Nickname: </span>{props.user.nickname}</p>
          <p><span className="label">Email: </span>{props.user.email}</p>
          <p><span className="label">Notifications Enabled: </span>{props.user.receive_emails}</p>
          <p><span className="label">Term Start: </span>{props.user.dt_term_start}</p>
          <p><span className="label">Term End: </span>{props.user.dt_term_end}</p>
          <p><span className="label">Last Login: </span>{props.user.logged_in_tstz}</p>
        </div>
      </article>
  );
}

export default UserCard;