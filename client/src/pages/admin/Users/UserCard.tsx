import { Link } from "react-router-dom";
import { User } from ".";
import ActionMenu, { Action } from "../../../shared/ActionMenu";
import ExternalLink from "../../../shared/ExternalLink";
import useAppState from "../../../state/useAppState";

type UserCardProps = {
  user: User
  handleEditProfile: (user: User) => void 
  handleChangePassword: (userId: number) => void
  handleEditPermissions: (userId: number) => void
  handleImpersonateUser: (userId: number) => void
  testId?: string
}

function UserCard(props: UserCardProps) {
  const { state } = useAppState();

  const actions: Action[] = [];

  if (state.is_admin || state.user?.permissions.edit_user_profiles) {
    actions.push({
      role: "button",
      action: props.handleEditProfile,
      text: "Edit profile",
      data: props.user
    });
  }

  if (state.is_admin || state.user?.permissions.change_user_passwords) {
    actions.push({
      role: "button",
      action: props.handleChangePassword,
      text: "Change password",
      data: props.user.evaluator_id
    });
  }

  if (state.is_admin) {
    actions.push({
      role: "button",
      action: props.handleEditPermissions,
      text: "Edit permissions",
      data: props.user.evaluator_id
    });
  }

  if ((state.is_admin || state.user?.permissions.assume_user_identities) && !props.user.account_locked) {
    actions.push({
      role: "button",
      action: props.handleImpersonateUser,
      text: "Assume identity",
      data: props.user.evaluator_kaid
    });
  }


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
          <p><span className="label">Notifications Enabled: </span>{props.user.receive_emails ? "Yes" : "No"}</p>
          <p><span className="label">Term Start: </span>{props.user.dt_term_start}</p>
          <p><span className="label">Term End: </span>{props.user.dt_term_end}</p>
          <p><span className="label">Last Login: </span>{props.user.logged_in_tstz}</p>
        </div>
      </article>
  );
}

export default UserCard;