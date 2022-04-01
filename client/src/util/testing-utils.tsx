import { render } from "@testing-library/react";
import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en.json';
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { AppState, Permissions } from "../state/appStateReducer";

/**
 * Renders a given component wrapped in a MemoryRouter. This allows components with
 * router Links to be tested without having to be mocked.
 * @param component The component to render
 */
export function renderWithRouter(component: React.ReactElement<any, string | React.JSXElementConstructor<any>>) {
  TimeAgo.setDefaultLocale(en.locale)
  TimeAgo.addLocale(en)

  render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
}

/**
 * Creates an object with the default app state when logged out.
 * @returns The default app state
 */
export function defaultAppStateLoggedOut(): AppState {
  return {
    user: null,
    logged_in: false,
    is_admin: false,
    is_impersonated: false,
    origin_kaid: null,
  }
}

/**
 * Creates an object with the default app state when logged in.
 * The logged in user also has the default permissions.
 * @returns The default app state
 */
export function defaultAppStateLoggedIn(permissions?: PermissionsConfig): AppState {
  return {
    user: {
      evaluator_id: 10,
      evaluator_name: "Test Evaluator 10",
      evaluator_kaid: "kaid_1234567890",
      account_locked: false,
      email: "evaluator10@kachallengecouncil.org",
      username: "evaluator10",
      nickname: "Test Evaluator",
      permissions: permissions ? customPermissions(permissions) : defaultPermissions()
    },
    logged_in: true,
    is_admin: false,
    is_impersonated: false,
    origin_kaid: null,
  }
}

/**
 * Creates an object with the default permissions (no permissions granted). 
 * @returns A permissions object
 */
export function defaultPermissions(): Permissions {
  return {
    judge_entries: false,
    view_admin_stats: false,
    manage_announcements: false,
    manage_winners: false,
    edit_contests: false,
    delete_contests: false,
    add_entries: false,
    edit_entries: false,
    delete_entries: false,
    assign_entry_groups: false,
    view_all_evaluations: false,
    edit_all_evaluations: false,
    delete_all_evaluations: false,
    view_all_tasks: false,
    edit_all_tasks: false,
    delete_all_tasks: false,
    view_judging_settings: false,
    manage_judging_groups: false,
    assign_evaluator_groups: false,
    manage_judging_criteria: false,
    view_all_users: false,
    add_users: false,
    edit_user_profiles: false,
    change_user_passwords: false,
    assume_user_identities: false,
    view_errors: false,
    delete_errors: false,
    edit_kb_content: false,
    delete_kb_content: false,
    publish_kb_content: false,
  }
}

type PermissionsConfig = {
  judge_entries?: boolean
  view_admin_stats?: boolean
  manage_announcements?: boolean
  manage_winners?: boolean
  edit_contests?: boolean
  delete_contests?: boolean
  add_entries?: boolean
  edit_entries?: boolean
  delete_entries?: boolean
  assign_entry_groups?: boolean
  view_all_evaluations?: boolean
  edit_all_evaluations?: boolean
  delete_all_evaluations?: boolean
  view_all_tasks?: boolean
  edit_all_tasks?: boolean
  delete_all_tasks?: boolean
  view_judging_settings?: boolean
  manage_judging_groups?: boolean
  assign_evaluator_groups?: boolean
  manage_judging_criteria?: boolean
  view_all_users?: boolean
  add_users?: boolean
  edit_user_profiles?: boolean
  change_user_passwords?: boolean
  assume_user_identities?: boolean
  view_errors?: boolean
  delete_errors?: boolean
  edit_kb_content?: boolean
  delete_kb_content?: boolean
  publish_kb_content?: boolean
}

/**
 * Creates an object with custom permissions. All permissions not specified
 * by the user in the config object will default to false.
 * @param permissions A configuration object that will override the default permissions
 * @returns A permissions object
 */
export function customPermissions(permissions: PermissionsConfig): Permissions {
  return {
    judge_entries: false,
    view_admin_stats: false,
    manage_announcements: false,
    manage_winners: false,
    edit_contests: false,
    delete_contests: false,
    add_entries: false,
    edit_entries: false,
    delete_entries: false,
    assign_entry_groups: false,
    view_all_evaluations: false,
    edit_all_evaluations: false,
    delete_all_evaluations: false,
    view_all_tasks: false,
    edit_all_tasks: false,
    delete_all_tasks: false,
    view_judging_settings: false,
    manage_judging_groups: false,
    assign_evaluator_groups: false,
    manage_judging_criteria: false,
    view_all_users: false,
    add_users: false,
    edit_user_profiles: false,
    change_user_passwords: false,
    assume_user_identities: false,
    view_errors: false,
    delete_errors: false,
    edit_kb_content: false,
    delete_kb_content: false,
    publish_kb_content: false,
    ...permissions
  }
}