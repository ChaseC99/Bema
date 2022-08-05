import { Reducer } from "react";

export type Permissions = {
  judge_entries: boolean
  view_admin_stats: boolean
  manage_announcements: boolean
  manage_winners: boolean
  edit_contests: boolean
  delete_contests: boolean
  add_entries: boolean
  edit_entries: boolean
  delete_entries: boolean
  assign_entry_groups: boolean
  view_all_evaluations: boolean
  edit_all_evaluations: boolean
  delete_all_evaluations: boolean
  view_all_tasks: boolean
  edit_all_tasks: boolean
  delete_all_tasks: boolean
  view_judging_settings: boolean
  manage_judging_groups: boolean
  assign_evaluator_groups: boolean
  manage_judging_criteria: boolean
  view_all_users: boolean
  add_users: boolean
  edit_user_profiles: boolean
  change_user_passwords: boolean
  assume_user_identities: boolean
  view_errors: boolean
  delete_errors: boolean
  edit_kb_content: boolean
  delete_kb_content: boolean
  publish_kb_content: boolean
}

export type User = {
  id: string
  name: string
  kaid: string
  email: string
  username: string
  nickname: string
  permissions: Permissions

  // Deprecated fields
  evaluator_id: number
}

export type AppState = {
  user: User | null
  loggedIn: boolean
  isAdmin: boolean
  isImpersonated: boolean
  originId: string | null
  
  // Deprecated fields
  logged_in: boolean
  is_admin: boolean
  is_impersonated: boolean
  origin_id: string | null
}

export type Action =
  | {
      type: "LOGOUT"
    }
  | {
      type: "LOGIN"
      payload: AppState
    }

export const reducer: Reducer<AppState, Action> = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "LOGOUT": {
      return {
        user: null,
        loggedIn: false,
        isAdmin: false,
        isImpersonated: false,
        originId: null,
        logged_in: false,
        is_admin: false,
        is_impersonated: false,
        origin_id: null,
      }
    }
    case "LOGIN": {
      return action.payload;
    }
  
    default:
      return state
  }
}
  
export const initialState = {
  user: null,
  loggedIn: false,
  isAdmin: false,
  isImpersonated: false,
  originId: null,
  logged_in: false,
  is_admin: false,
  is_impersonated: false,
  origin_id: null,
}

export function logout(): Action {
  return {
    type: "LOGOUT"
  }
}

export function login(user: AppState): Action {
  return {
    type: "LOGIN",
    payload: user
  }
}