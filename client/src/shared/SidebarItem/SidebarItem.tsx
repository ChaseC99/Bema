import { Link, useLocation } from "react-router-dom";

type SidebarItemProps = {
    text: string
    to: string
    testId?: string
}

function SidebarItem(props: SidebarItemProps) {
    const location = useLocation();
    const isActive = props.to === location.pathname;
    
    return (
        <Link to={props.to}><p className={isActive ? "active sidebar-item" : "sidebar-item"} data-testid={props.testId}>{props.text}</p></Link>
    );
}

export default SidebarItem;