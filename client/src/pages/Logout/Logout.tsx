import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { logout } from "../../state/appStateReducer";
import useAppState from "../../state/useAppState";

function Logout() {
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const { dispatch } = useAppState();

  useEffect(() => {
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(data => {
      setHasLoggedOut(true);
      dispatch(logout());
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