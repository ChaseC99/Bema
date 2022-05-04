import React from "react";
import { Navigate } from "react-router-dom";
import useAppState from "../../../state/useAppState";

type AuthenticatedRouteProps = {
  children: React.ReactChild | React.ReactChild[]
}

/**
 * Use this as a wrapper for pages that require user authentication.
 * If the user is not logged in, the user will be redirected to the login page
 * before being able to access the requested page.
 */
function AuthenticatedRoute(props: AuthenticatedRouteProps) {
  const { state } = useAppState();

  if (state.logged_in) {
    return (
      <React.Fragment>
        {props.children}
      </React.Fragment>
    );
  }
  else {
    return (
      <Navigate to="/login" />
    );
  }
}

export default AuthenticatedRoute;