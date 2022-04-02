import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { logout } from "../state/appStateReducer";
import useAppState from "../state/useAppState";

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
    }, []);

    if (hasLoggedOut) {
        return <Navigate replace to="/login" />;
    }
    else {
        // TODO: Add loading spinner
        return <div>Logging out...</div>
    }
}

export default Logout;