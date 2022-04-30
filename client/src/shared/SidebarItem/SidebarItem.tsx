import { Link, useLocation } from "react-router-dom";

type SidebarItemProps = {
  text: string
  to: string
  exact?: boolean
  testId?: string
}

function SidebarItem(props: SidebarItemProps) {
  const location = useLocation();
  let isActive = false;

  if (props.exact) {
    isActive = props.to === location.pathname;
  }
  else {
    isActive = location.pathname.includes(props.to);
  }

  return (
    <Link to={props.to}><p className={isActive ? "active sidebar-item" : "sidebar-item"} data-testid={props.testId}>{props.text}</p></Link>
  );
}

export default SidebarItem;