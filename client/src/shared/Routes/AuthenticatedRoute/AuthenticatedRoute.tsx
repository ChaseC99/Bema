import React from "react";
import { Navigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  if (state.logged_in) {
    return (
      <React.Fragment>
        {props.children}
      </React.Fragment>
    );
  }
  else {
    if (location.pathname !== "/logout") {
      return (
        <Navigate to={"/login?continue=" + location.pathname} />
      );
    }
    return (
      <Navigate to="/login" />
    );
  }
}

export default AuthenticatedRoute;