import React, { useEffect, useState } from "react";
import { User } from ".";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { FormModal } from "../../../shared/Modals";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import useAppState from "../../../state/useAppState";
import request from "../../../util/request";
import { fetchUsers } from "./fetchUsers";
import UserCard from "./UserCard";

type UserProps = {
  inactive?: boolean
}

function Users(props: UserProps) {
  const { state } = useAppState();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [changePasswordUserId, setChangePasswordUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        setUsers(data.users);
        setIsLoading(false);
      });
  }, []);

  const openAddUserModal = () => {

  }

  const closeAddUserModal = () => {

  }

  const handleAddUser = () => {

  }

  const openEditUserModal = (user: User) => {
    setEditUser(user);
  }

  const closeEditUserModal = () => {
    setEditUser(null);
  }

  const handleEditUser = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/users", {
      edit_user_id: editUser?.evaluator_id,
      edit_user_name: values.name,
      edit_user_kaid: values.kaid,
      edit_user_username: values.username,
      edit_user_nickname: values.nickname,
      edit_user_email: values.email,
      edit_user_start: values.term_start,
      edit_user_end: values.term_end,
      edit_user_is_admin: state.is_admin ? values.is_admin : editUser?.is_admin,
      edit_user_account_locked: state.is_admin ? values.account_disabled : editUser?.account_locked,
      edit_user_receive_emails: values.receive_emails
    });

    const newUsers = [...users];
    for (let i = 0; i < newUsers.length; i++) {
      if (newUsers[i].evaluator_id === editUser?.evaluator_id) {
        newUsers[i].evaluator_name = values.name;
        newUsers[i].evaluator_kaid = values.kaid;
        newUsers[i].username = values.username;
        newUsers[i].nickname = values.nickname;
        newUsers[i].email = values.email;
        newUsers[i].dt_term_start = values.term_start;
        newUsers[i].dt_term_end = values.term_end;
        newUsers[i].is_admin = state.is_admin ? values.is_admin : editUser?.is_admin;
        newUsers[i].account_locked = state.is_admin ? values.account_disabled : editUser?.account_locked;
        newUsers[i].receive_emails = values.receive_emails;

        break;
      }
    }
    setUsers(newUsers);

    closeEditUserModal();
  }

  const openChangePasswordModal = (userId: number) => {
    setChangePasswordUserId(userId);
  }

  const closeChangePasswordModal = () => {
    setChangePasswordUserId(null);
  }

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters"
    }

    return null;
  }

  const handleChangePassword = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/auth/changePassword", {
      evaluator_id: changePasswordUserId,
      new_password: values.password
    });

    closeChangePasswordModal();
  }

  return (
    <React.Fragment>
      <AdminSidebar />

      <section className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>{props.inactive ? "Inactive Users" : "Users"}</h2>

            <span className="section-actions">
              {!props.inactive && <Button type="tertiary" role="link" action="/admin/users/inactive" text="View deactivated users" />}
              {props.inactive && <Button type="tertiary" role="link" action="/admin/users" text="View active users" />}
              {(state.is_admin || state.user?.permissions.add_users) && <Button type="primary" role="button" action={openAddUserModal} text="Add User" />}
            </span>
          </div>
          <div className="section-body">
            {isLoading && <LoadingSpinner size="LARGE" />}

            {(!isLoading && !props.inactive) && users.filter((u) => !u.account_locked).map((u) => {
              return (
                <UserCard
                  user={u}
                  handleEditProfile={openEditUserModal}
                  handleChangePassword={openChangePasswordModal}
                  key={u.evaluator_id}
                />
              );
            })}

            {(!isLoading && props.inactive) && users.filter((u) => u.account_locked).map((u) => {
              return (
                <UserCard
                  user={u}
                  handleEditProfile={openEditUserModal}
                  handleChangePassword={openChangePasswordModal}
                  key={u.evaluator_id}
                />
              );
            })}
          </div>
        </div>
      </section>

      {editUser && 
        <FormModal
          title="Edit User"
          submitLabel="Save"
          handleSubmit={handleEditUser}
          handleCancel={closeEditUserModal}
          cols={4}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "name",
              id: "name",
              label: "Name",
              defaultValue: editUser.evaluator_name,
              size: "LARGE"
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "kaid",
              id: "kaid",
              label: "KAID",
              defaultValue: editUser.evaluator_kaid,
              size: "LARGE"
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "username",
              id: "username",
              label: "Username",
              description: "This is used to login to Bema. Generally, this should match their KA username.",
              defaultValue: editUser.username,
              size: "LARGE"
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "nickname",
              id: "nickname",
              label: "Nickname",
              description: "The name shown to other users.",
              defaultValue: editUser.nickname,
              size: "LARGE"
            },
            {
              fieldType: "INPUT",
              type: "email",
              name: "email",
              id: "email",
              label: "Email",
              defaultValue: editUser.email || "",
              size: "LARGE"
            },
            {
              fieldType: "DATE",
              name: "term_start",
              id: "term-start",
              label: "Term Start",
              defaultValue: editUser.dt_term_start,
              size: "MEDIUM"
            },
            {
              fieldType: "DATE",
              name: "term_end",
              id: "term-end",
              label: "Term End",
              defaultValue: editUser.dt_term_end,
              size: "MEDIUM"
            },
            {
              fieldType: "CHECKBOX",
              name: "is_admin",
              id: "is-admin",
              label: "Administrator",
              description: "Grants the user all permissions. Use this with caution.",
              defaultValue: editUser.is_admin,
              disabled: !state.is_admin,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "account_disabled",
              id: "account-disabled",
              label: "Disable account",
              description: "Makes the user account inactive. The user will no longer be able to login.",
              defaultValue: editUser.account_locked,
              disabled: !state.is_admin,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "receive_emails",
              id: "receive-emails",
              label: "Receive email notifications",
              defaultValue: editUser.receive_emails,
              size: "LARGE"
            }
          ]}
        />
      }

      {changePasswordUserId &&
        <FormModal
          title="Change Password"
          submitLabel="Change Password"
          handleSubmit={handleChangePassword}
          handleCancel={closeChangePasswordModal}
          cols={4}
          fields={[
            {
              fieldType: "INPUT",
              type: "password",
              name: "password",
              id: "password",
              label: "New Password",
              defaultValue: "",
              size: "LARGE",
              validate: validatePassword
            }
          ]}
        />
      }
    </React.Fragment>
  );
}

export default Users;