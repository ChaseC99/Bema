import { gql, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { logout } from "../../state/appStateReducer";
import useAppState from "../../state/useAppState";
import useAppError from "../../util/errors";

type LogoutResponse = {
  data: {
    success: boolean
  }
}

const LOGOUT = gql`
  mutation Logout {
    data: logout
  }
`;

function Logout() {
  const { handleGQLError } = useAppError();
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const { dispatch } = useAppState();
  const [logoutUser] = useMutation<LogoutResponse>(LOGOUT, { onError: handleGQLError });

  useEffect(() => {
    logoutUser({}).then(data => {
      dispatch(logout())
      setHasLoggedOut(true);
    });
  }, [dispatch]);

  if (hasLoggedOut) {
    return <Navigate replace to="/login" />;
  }
  else {
    return (
      <LoadingSpinner size="LARGE" />
    )
  }
}

export default Logout;