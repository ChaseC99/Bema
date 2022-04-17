import { useEffect } from "react";

function NotFound() {
    useEffect(() => {
        reloadPage();
    }, []);

    return <div></div>
}

function reloadPage() {
    window.location.reload();
}

export default NotFound;