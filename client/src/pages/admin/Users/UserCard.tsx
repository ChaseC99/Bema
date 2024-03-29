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

  if (state.isAdmin || state.user?.permissions.edit_user_profiles) {
    actions.push({
      role: "button",
      action: props.handleEditProfile,
      text: "Edit profile",
      data: props.user
    });
  }

  if (state.isAdmin || state.user?.permissions.change_user_passwords) {
    actions.push({
      role: "button",
      action: props.handleChangePassword,
      text: "Change password",
      data: props.user.id
    });
  }

  if (state.isAdmin) {
    actions.push({
      role: "button",
      action: props.handleEditPermissions,
      text: "Edit permissions",
      data: props.user.id
    });
  }

  if ((state.isAdmin || state.user?.permissions.assume_user_identities) && !props.user.accountLocked) {
    actions.push({
      role: "button",
      action: props.handleImpersonateUser,
      text: "Assume identity",
      data: props.user.id
    });
  }


  return (
    <article className="card col-4" data-testid={props.testId}>
        <div className="card-header">
          <h3>
            {props.user.name}
            {props.user.isAdmin && <span className="badge">Admin</span>}
          </h3>
          <ActionMenu actions={actions}/>
        </div>
        <div className="card-body">
          <p><ExternalLink to={"https://www.khanacademy.org/profile/" + props.user.kaid} target="_blank">KA Profile</ExternalLink></p>
          <p><Link to={"/evaluator/" + props.user.id}>Bema Profile</Link></p>
          <p><span className="label">ID: </span>{props.user.id}</p>
          <p><span className="label">KAID: </span>{props.user.kaid}</p>
          <p><span className="label">Username: </span>{props.user.username}</p>
          <p><span className="label">Nickname: </span>{props.user.nickname}</p>
          <p><span className="label">Email: </span>{props.user.email}</p>
          <p><span className="label">Notifications Enabled: </span>{props.user.notificationsEnabled ? "Yes" : "No"}</p>
          <p><span className="label">Term Start: </span>{props.user.termStart}</p>
          <p><span className="label">Term End: </span>{props.user.termEnd}</p>
          <p><span className="label">Last Login: </span>{props.user.lastLogin}</p>
        </div>
      </article>
  );
}

export default UserCard;