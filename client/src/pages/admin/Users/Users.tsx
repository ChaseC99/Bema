import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { User } from ".";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../../shared/Modals";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import useAppState from "../../../state/useAppState";
import useAppError from "../../../util/errors";
import request from "../../../util/request";
import UserCard from "./UserCard";

type UserProps = {
  inactive?: boolean
}

type GetUsersResponse = {
  users: User[]
}

type GetUserPermissionsResponse = {
  user: {
    permissions: {
      add_entries: boolean
      add_users: boolean
      assign_entry_groups: boolean
      assign_evaluator_groups: boolean
      assume_user_identities: boolean
      change_user_passwords: boolean
      delete_all_evaluations: boolean
      delete_all_tasks: boolean
      delete_contests: boolean
      delete_entries: boolean
      delete_errors: boolean
      delete_kb_content: boolean
      edit_all_evaluations: boolean
      edit_all_tasks: boolean
      edit_contests: boolean
      edit_entries: boolean
      edit_kb_content: boolean
      edit_user_profiles: boolean
      judge_entries: boolean
      manage_announcements: boolean
      manage_judging_criteria: boolean
      manage_judging_groups: boolean
      manage_winners: boolean
      publish_kb_content: boolean
      view_admin_stats: boolean
      view_all_evaluations: boolean
      view_all_tasks: boolean
      view_all_users: boolean
      view_errors: boolean
      view_judging_settings: boolean
    }
  }
}

const GET_ACTIVE_USERS = gql`
  query GetActiveUsers {
    users: users{
      id
      name
      kaid
      username
      nickname
      email
      notificationsEnabled
      termStart
      termEnd
      lastLogin
      accountLocked
      isAdmin
    }
  }
`;

const GET_INACTIVE_USERS = gql`
  query GetInactiveUsers {
    users: inactiveUsers{
      id
      name
      kaid
      username
      nickname
      email
      notificationsEnabled
      termStart
      termEnd
      lastLogin
      accountLocked
      isAdmin
    }
  }
`;

const GET_USER_PERMISSIONS = gql`
  query GetUserPermissions($userId: ID!) {
    user(id: $userId) {
      permissions {
        add_entries
        add_users
        assign_entry_groups
        assign_evaluator_groups
        assume_user_identities
        change_user_passwords
        delete_all_evaluations
        delete_all_tasks
        delete_contests
        delete_entries
        delete_errors
        delete_kb_content
        edit_all_evaluations
        edit_all_tasks
        edit_contests
        edit_entries
        edit_kb_content
        edit_user_profiles
        judge_entries
        manage_announcements
        manage_judging_criteria
        manage_judging_groups
        manage_winners
        publish_kb_content
        view_admin_stats
        view_all_evaluations
        view_all_tasks
        view_all_users
        view_errors
        view_judging_settings
      }
    }
  }
`;

type ChangePasswordResponse = {
  success: boolean
}

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($id: ID!, $password: String!) {
    success: changePassword(id: $id, password: $password)
  }
`;

type CreateUserResponse = {
  user: User
}

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      kaid
      username
      nickname
      email
      notificationsEnabled
      termStart
      termEnd
      lastLogin
      accountLocked
      isAdmin
    }
  }
`;

function Users(props: UserProps) {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [changePasswordUserId, setChangePasswordUserId] = useState<number | null>(null);
  const [editUserPermissionsId, setEditUserPermissionsId] = useState<number | null>(null);
  const [impersonateUserId, setImpersonateUserId] = useState<number | null>(null);

  const { loading: userIsLoading, data: usersData, refetch: refetchUsers } = useQuery<GetUsersResponse>(props.inactive ? GET_INACTIVE_USERS : GET_ACTIVE_USERS, { onError: handleGQLError });
  const [getUserPermissions, { loading: permissionsIsLoading, data: permissionsData }] = useLazyQuery<GetUserPermissionsResponse>(GET_USER_PERMISSIONS, { onError: handleGQLError });
  const [changePassword, { loading: changePasswordIsLoading }] = useMutation<ChangePasswordResponse>(CHANGE_PASSWORD, { onError: handleGQLError });
  const [createUser, { loading: createUserIsLoading }] = useMutation<CreateUserResponse>(CREATE_USER, { onError: handleGQLError });

  const openAddUserModal = () => {
    setShowAddUserModal(true);
  }

  const closeAddUserModal = () => {
    setShowAddUserModal(false);
  }

  const handleAddUser = async (values: { [name: string]: any }) => {
    await createUser({
      variables: {
        input: {
          name: values.name,
          email: values.email,
          kaid: values.kaid,
          username: values.username,
          termStart: values.term_start
        }
      }
    });

    closeAddUserModal();
    refetchUsers();
  }

  const openEditUserModal = (user: User) => {
    setEditUser(user);
  }

  const closeEditUserModal = () => {
    setEditUser(null);
  }

  const handleEditUser = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/users", {
      edit_user_id: editUser?.id,
      edit_user_name: values.name,
      edit_user_kaid: values.kaid,
      edit_user_username: values.username,
      edit_user_nickname: values.nickname,
      edit_user_email: values.email,
      edit_user_start: values.term_start,
      edit_user_end: values.term_end,
      edit_user_is_admin: state.is_admin ? values.is_admin : editUser?.isAdmin,
      edit_user_account_locked: state.is_admin ? values.account_disabled : editUser?.accountLocked,
      edit_user_receive_emails: values.receive_emails
    });

    refetchUsers();

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
    await changePassword({
      variables: {
        id: changePasswordUserId,
        password: values.password
      }
    });

    closeChangePasswordModal();
  }

  const openEditPermissionsModal = (userId: number) => {
    setEditUserPermissionsId(userId);

    getUserPermissions({
      variables: {
        userId: userId
      }
    });
  }

  const closeEditPermissionsModal = () => {
    setEditUserPermissionsId(null);
  }

  const handleEditPermissions = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/users/permissions", {
      evaluator_id: editUserPermissionsId,
      ...values
    });

    closeEditPermissionsModal();
  }

  const openImpersonateUserModal = (userId: number) => {
    setImpersonateUserId(userId);
  }

  const closeImpersonateUserModal = () => {
    setImpersonateUserId(null);
  }

  const handleImpersonateUser = async (userKaid: number) => {
    await request("POST", "/api/auth/assumeUserIdentity", {
      evaluator_kaid: userKaid
    });

    window.location.reload();
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
            {userIsLoading && <LoadingSpinner size="LARGE" />}

            {!userIsLoading && usersData?.users.map((u) => {
              return (
                <UserCard
                  user={u}
                  handleEditProfile={openEditUserModal}
                  handleChangePassword={openChangePasswordModal}
                  handleEditPermissions={openEditPermissionsModal}
                  handleImpersonateUser={openImpersonateUserModal}
                  key={u.id}
                />
              );
            })}
          </div>
        </div>
      </section>

      {showAddUserModal &&
        <FormModal
          title="Create User"
          submitLabel="Create"
          handleSubmit={handleAddUser}
          handleCancel={closeAddUserModal}
          cols={4}
          loading={createUserIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "name",
              id: "name",
              label: "Full Name",
              defaultValue: "",
              required: true,
              size: "LARGE"
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "email",
              id: "email",
              label: "Email",
              defaultValue: "",
              size: "LARGE"
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "kaid",
              id: "kaid",
              label: "KAID",
              defaultValue: "",
              required: true,
              size: "LARGE"
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "username",
              id: "username",
              label: "Username",
              description: "This will be used to login to Bema. This should match their KA username.",
              defaultValue: "",
              required: true,
              size: "LARGE"
            },
            {
              fieldType: "DATE",
              name: "term_start",
              id: "term-start",
              label: "Term Start",
              defaultValue: "",
              size: "LARGE"
            }
          ]}
        />
      }

      {editUser &&
        <FormModal
          title="Edit User"
          submitLabel="Save"
          handleSubmit={handleEditUser}
          handleCancel={closeEditUserModal}
          cols={4}
          disabled
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "name",
              id: "name",
              label: "Name",
              defaultValue: editUser.name,
              size: "LARGE",
              required: true
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "kaid",
              id: "kaid",
              label: "KAID",
              defaultValue: editUser.kaid,
              size: "LARGE",
              required: true
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "username",
              id: "username",
              label: "Username",
              description: "This is used to login to Bema. Generally, this should match their KA username.",
              defaultValue: editUser.username,
              size: "LARGE",
              required: true
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "nickname",
              id: "nickname",
              label: "Nickname",
              description: "The name shown to other users.",
              defaultValue: editUser.nickname || "",
              size: "LARGE",
              required: true
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
              defaultValue: editUser.termStart || "",
              size: "MEDIUM"
            },
            {
              fieldType: "DATE",
              name: "term_end",
              id: "term-end",
              label: "Term End",
              defaultValue: editUser.termEnd || "",
              size: "MEDIUM"
            },
            {
              fieldType: "CHECKBOX",
              name: "is_admin",
              id: "is-admin",
              label: "Administrator",
              description: "Grants the user all permissions. Use this with caution.",
              defaultValue: editUser.isAdmin,
              disabled: !state.is_admin,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "account_disabled",
              id: "account-disabled",
              label: "Disable account",
              description: "Makes the user account inactive. The user will no longer be able to login.",
              defaultValue: editUser.accountLocked,
              disabled: !state.is_admin,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "receive_emails",
              id: "receive-emails",
              label: "Receive email notifications",
              defaultValue: editUser.notificationsEnabled,
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
          loading={changePasswordIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "password",
              name: "password",
              id: "password",
              label: "New Password",
              defaultValue: "",
              size: "LARGE",
              validate: validatePassword,
              required: true
            }
          ]}
        />
      }

      {(editUserPermissionsId && !permissionsIsLoading && permissionsData) &&
        <FormModal
          title="Edit Permissions"
          submitLabel="Save"
          handleSubmit={handleEditPermissions}
          handleCancel={closeEditPermissionsModal}
          cols={4}
          disabled
          fields={[
            {
              fieldType: "CHECKBOX",
              name: "judge_entries",
              id: "judge-entries",
              label: "Judge Entries",
              description: "Allows the user to score entries. Disable this for view-only users.",
              defaultValue: permissionsData.user.permissions.judge_entries,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "manage_announcements",
              id: "manage-announcements",
              label: "Manage Announcements",
              description: "Allows the user to create, edit, and delete announcements.",
              defaultValue: permissionsData.user.permissions.manage_announcements,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "view_admin_stats",
              id: "view-admin-stats",
              label: "View Admin Stats",
              description: "Allows the user to view admin stats on the dashboard page.",
              defaultValue: permissionsData.user.permissions.view_admin_stats,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "edit_contests",
              id: "edit-contests",
              label: "Edit Contests",
              description: "Allows the user to create and edit contests.",
              defaultValue: permissionsData.user.permissions.edit_contests,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "delete_contests",
              id: "delete-contests",
              label: "Delete Contests",
              description: "Allows the user to delete contests and all their associated data.",
              defaultValue: permissionsData.user.permissions.delete_contests,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "add_entries",
              id: "add-entries",
              label: "Import Entries",
              description: "Allows the user to bulk import and individually add entries.",
              defaultValue: permissionsData.user.permissions.add_entries,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "edit_entries",
              id: "edit-entries",
              label: "Edit Entries",
              description: "Allows the user to edit all entries.",
              defaultValue: permissionsData.user.permissions.edit_entries,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "delete_entries",
              id: "delete-entries",
              label: "Delete Entries",
              description: "Allows the user to delete entries and their associated data.",
              defaultValue: permissionsData.user.permissions.delete_entries,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "assign_entry_groups",
              id: "assign-entry-groups",
              label: "Assign Entry Groups",
              description: "Allows the user to assign entries to judging groups.",
              defaultValue: permissionsData.user.permissions.assign_entry_groups,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "manage_winners",
              id: "manage-winners",
              label: "Manage Winners",
              description: "Allows the user to add and remove winning entries.",
              defaultValue: permissionsData.user.permissions.manage_winners,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "view_all_evaluations",
              id: "view-all-evaluations",
              label: "View All Evaluations",
              description: "Allows the user to view all evaluations by other users.",
              defaultValue: permissionsData.user.permissions.view_all_evaluations,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "edit_all_evaluations",
              id: "edit-all-evaluations",
              label: "Edit All Evaluations",
              description: "Allows the user to edit all evaluations by other users.",
              defaultValue: permissionsData.user.permissions.edit_all_evaluations,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "delete_all_evaluations",
              id: "delete-all-evaluations",
              label: "Delete All Evaluations",
              description: "Allows the user to delete all evaluations by other users",
              defaultValue: permissionsData.user.permissions.delete_all_evaluations,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "view_all_tasks",
              id: "view-all-tasks",
              label: "View All Tasks",
              description: "Allows the user to view all created tasks.",
              defaultValue: permissionsData.user.permissions.view_all_tasks,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "edit_all_tasks",
              id: "edit-all-tasks",
              label: "Edit All Tasks",
              description: "Allows the user to edit all created tasks.",
              defaultValue: permissionsData.user.permissions.edit_all_tasks,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "delete_all_tasks",
              id: "delete-all-tasks",
              label: "Delete All Tasks",
              description: "Allows the user to delete all created tasks.",
              defaultValue: permissionsData.user.permissions.delete_all_tasks,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "view_judging_settings",
              id: "view-judging-settings",
              label: "View Judging Settings",
              description: "Allows the user to view the judging settings page.",
              defaultValue: permissionsData.user.permissions.view_judging_settings,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "manage_judging_groups",
              id: "manage-judging-groups",
              label: "Edit Judging Groups",
              description: "Allows the user to create and edit judging groups.",
              defaultValue: permissionsData.user.permissions.manage_judging_groups,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "assign_evaluator_groups",
              id: "assign-evaluator-groups",
              label: "Assign Judging Groups",
              description: "Allows the user to assign evaluators to judging groups.",
              defaultValue: permissionsData.user.permissions.assign_evaluator_groups,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "manage_judging_criteria",
              id: "manage-judging-criteria",
              label: "Manage Judging Criteria",
              description: "Allows the user to manage the judging criteria shown on the judging page.",
              defaultValue: permissionsData.user.permissions.manage_judging_criteria,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "edit_kb_content",
              id: "edit-kb-content",
              label: "Edit KB Content",
              description: "Allows the user to create and edit KB sections and articles.",
              defaultValue: permissionsData.user.permissions.edit_kb_content,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "publish_kb_content",
              id: "publish-kb-content",
              label: "Publish KB Content",
              description: "Allows the user to publish all draft KB articles.",
              defaultValue: permissionsData.user.permissions.publish_kb_content,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "delete_kb_content",
              id: "delete-kb-content",
              label: "Delete KB Content",
              description: "Allows the user to delete all KB sections and articles.",
              defaultValue: permissionsData.user.permissions.delete_kb_content,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "view_all_users",
              id: "view-all-users",
              label: "View All Users",
              description: "Allows the user to view all evaluator accounts and personal information.",
              defaultValue: permissionsData.user.permissions.view_all_users,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "add_users",
              id: "add-users",
              label: "Add Users",
              description: "Allows the user to create new evaluator accounts.",
              defaultValue: permissionsData.user.permissions.add_users,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "edit_user_profiles",
              id: "edit-user-profiles",
              label: "Edit User Profiles",
              description: "Allows the user to edit evaluator profile information.",
              defaultValue: permissionsData.user.permissions.edit_user_profiles,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "change_user_passwords",
              id: "change-user-passwords",
              label: "Change User Passwords",
              description: "Allows the user to change other evaluators' passwords.",
              defaultValue: permissionsData.user.permissions.change_user_passwords,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "assume_user_identities",
              id: "assume-user-identities",
              label: "Assume User Identities",
              description: "Allows the user to log in as another user.",
              defaultValue: permissionsData.user.permissions.assume_user_identities,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "view_errors",
              id: "view-errors",
              label: "View Errors",
              description: "Allows the user to view all logged errors.",
              defaultValue: permissionsData.user.permissions.view_errors,
              size: "LARGE"
            },
            {
              fieldType: "CHECKBOX",
              name: "delete_errors",
              id: "delete-errors",
              label: "Delete Errors",
              description: "Allows the user to delete all logged errors.",
              defaultValue: permissionsData.user.permissions.delete_errors,
              size: "LARGE"
            },
          ]}
        />
      }

      {impersonateUserId &&
        <ConfirmModal
          title="Impersonate user?"
          confirmLabel="Impersonate User"
          handleConfirm={handleImpersonateUser}
          handleCancel={closeImpersonateUserModal}
          data={impersonateUserId}
        >
          <p>Are you sure you want to impersonate this user?</p>
          <p>Any actions you take while impersonating the user will be as if the user took the actions themselves.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default Users;