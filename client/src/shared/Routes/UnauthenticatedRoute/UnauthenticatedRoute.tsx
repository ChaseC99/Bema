import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import useAppState from "../../../state/useAppState";

type UnauthenticatedRouteProps = {
  children: React.ReactChild | React.ReactChild[]
}

/**
 * Use this as a wrapper for pages that require a user NOT to be logged in.
 * If the user is logged in, the user will be redirected to the home page.
 */
function UnauthenticatedRoute(props: UnauthenticatedRouteProps) {
  const { state } = useAppState();
  const [searchParams] = useSearchParams();

  if (!state.logged_in) {
    return (
      <React.Fragment>
        {props.children}
      </React.Fragment>
    );
  }
  else {
    if (searchParams.has("continue")) {
      return (
        <Navigate to={searchParams.get("continue") || "/"} />
      );
    }
    else {
      return (
        <Navigate to="/" />
      );
    }
  }
}

export default UnauthenticatedRoute;