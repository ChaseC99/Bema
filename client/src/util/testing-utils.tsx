import { render } from "@testing-library/react";
import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en.json';
import { act } from "react-dom/test-utils";
import { BrowserRouter, MemoryRouter, Router } from "react-router-dom";
import { AppState, Permissions } from "../state/appStateReducer";

/**
 * Renders a given component wrapped in a MemoryRouter. This allows components with
 * router Links to be tested without having to be mocked.
 * @param component The component to render
 * @param routes An option list of route history names that will be passed to the router
 */
export function renderWithRouter(component: React.ReactElement<any, string | React.JSXElementConstructor<any>>, routes?: string[]) {
  TimeAgo.setDefaultLocale(en.locale)
  TimeAgo.addLocale(en)
  
  if (routes) {
    render(
      <MemoryRouter initialEntries={routes}>
        {component}
      </MemoryRouter>
    );
  }
  else {
    render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  }
}

/**
 * Creates an object with the default app state when logged out.
 * @returns The default app state
 */
export function defaultAppStateLoggedOut(): AppState {
  return {
    user: null,
    loggedIn: false,
    isAdmin: false,
    isImpersonated: false,
    originId: null,
  }
}

/**
 * Creates an object with the default app state when logged in.
 * The logged in user also has the default permissions.
 * @returns The default app state
 */
export function defaultAppStateLoggedIn(permissions?: {[Property in keyof Permissions]+?: boolean}): AppState {
  return {
    user: {
      id: "10",
      name: "Test Evaluator 10",
      kaid: "kaid_1234567890",
      email: "evaluator10@kachallengecouncil.org",
      username: "evaluator10",
      nickname: "Test Evaluator",
      permissions: permissions ? customPermissions(permissions) : defaultPermissions()
    },
    loggedIn: true,
    isAdmin: false,
    isImpersonated: false,
    originId: null,
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

/**
 * Creates an object with custom permissions. All permissions not specified
 * by the user in the config object will default to false.
 * @param permissions A configuration object that will override the default permissions
 * @returns A permissions object
 */
export function customPermissions(permissions: {[Property in keyof Permissions]+?: boolean}): Permissions {
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