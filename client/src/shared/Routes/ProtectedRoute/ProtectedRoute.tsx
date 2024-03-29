import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Permissions } from "../../../state/appStateReducer";
import useAppState from "../../../state/useAppState";
import ErrorPage from "../../ErrorPage";

type PermissionName = keyof Permissions

type ProtectedRouteProps = {
  children: React.ReactChild | React.ReactChild[]
  permissions: PermissionName[]
  requireAll?: boolean
  requireAdmin?: boolean
}

/**
 * Use this as a wrapper for pages that require elevated permissions.
 * If the user is not logged in, the user is redirected to the login page.
 * If the user lacks the required permissions, the user is shown an error page.
 * To require the is_admin property, leave the permissions prop blank.
 */
function ProtectedRoute(props: ProtectedRouteProps) {
  const { state } = useAppState();
  const location = useLocation();

  if (!state.loggedIn) {
    return (
      <Navigate to={"/login?continue=" + location.pathname} />
    );
  }

  if (state.isAdmin) {
    return (
      <React.Fragment>
        {props.children}
      </React.Fragment>
    );
  }
  else if (props.requireAdmin && !state.isAdmin) {
    return (
      <ErrorPage type="NO PERMISSION" />
    );
  }
  else if (props.permissions.length > 0 && props.requireAll) {
    for (let i = 0; i < props.permissions.length; i++) {
      if (!state.user?.permissions[props.permissions[i]]) {
        return (
          <ErrorPage type="NO PERMISSION" />
        );
      }
    }

    return (
      <React.Fragment>
        {props.children}
      </React.Fragment>
    );
  }
  else if (props.permissions.length > 0) {
    for (let i = 0; i < props.permissions.length; i++) {
      if (state.user?.permissions[props.permissions[i]]) {
        return (
          <React.Fragment>
            {props.children}
          </React.Fragment>
        );
      }
    }

    return (
      <ErrorPage type="NO PERMISSION" />
    );
  }
  else {
    return (
      <ErrorPage type="NO PERMISSION" />
    );
  }
}

export default ProtectedRoute;