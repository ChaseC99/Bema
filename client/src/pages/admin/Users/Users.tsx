import React, { useEffect, useState } from "react";
import { User } from ".";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import useAppState from "../../../state/useAppState";
import { fetchUsers } from "./fetchUsers";
import UserCard from "./UserCard";

type UserProps = {
  inactive?: boolean
}

function Users(props: UserProps) {
  const { state } = useAppState();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
                <UserCard user={u} key={u.evaluator_id} />
              );
            })}

            {(!isLoading && props.inactive) && users.filter((u) => u.account_locked).map((u) => {
              return (
                <UserCard user={u} key={u.evaluator_id} />
              );
            })}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

export default Users;