import { Permissions } from "../../../state/appStateReducer";
import useAppState from "../../../state/useAppState";

type PermissionName = keyof Permissions

type CellProps = {
  header?: boolean
  width?: string
  permissions?: PermissionName[]
  requireAllPermissions?: boolean
  requireLoggedIn?: boolean
  children?: React.ReactChild | React.ReactChild[]
  testId?: string
}

function Cell(props: CellProps) {
  const { state } = useAppState();

  if (props.requireLoggedIn && !state.logged_in) {
    return null;
  }

  if (props.permissions && !state.is_admin) {
    if (!state.logged_in) {
      return null;
    }

    let hasPermission;
    
    if (props.requireAllPermissions) {
      hasPermission = true;
      
      for (let i = 0; i < props.permissions.length; i++) {
        if (!state.user?.permissions[props.permissions[i]]) {
          hasPermission = false;
          break;
        }
      }
    }
    else {
      hasPermission = false;

      for (let i = 0; i < props.permissions.length; i++) {
        if (state.user?.permissions[props.permissions[i]]) {
          hasPermission = true;
          break;
        }
      }
    }

    if (!hasPermission) {
      return null;
    }
  }

  if (props.header) {
    let styles: React.CSSProperties = {};
    if (props.width) {
      styles.width = props.width;
    }

    return (
      <th style={styles} data-testid={props.testId}>
        {props.children}
      </th>
    );
  }

  return (
    <td data-testid={props.testId}>
      {props.children}
    </td>
  );
}

export default Cell;