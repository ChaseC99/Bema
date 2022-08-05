import request from "../util/request";

export async function fetchAppState() {
  const userProfileQuery = `
    query getFullUserProfile {
      currentUser {
        isAdmin
        isImpersonated
        loggedIn
        originId
        user {
          id
          kaid
          name
          nickname
          username
          email
          accountLocked
          permissions {
            add_entries
            add_users
            assign_entry_groups
            assign_evaluator_groups
            assume_user_identities
            change_user_passwords
            delete_all_evaluations
            delete_all_tasks
            delete_contests
            delete_entries
            delete_errors
            delete_kb_content
            edit_all_evaluations
            edit_all_tasks
            edit_contests
            edit_entries
            edit_kb_content
            edit_user_profiles
            judge_entries
            manage_announcements
            manage_judging_criteria
            manage_judging_groups
            manage_winners
            publish_kb_content
            view_admin_stats
            view_all_evaluations
            view_all_tasks
            view_all_users
            view_errors
            view_judging_settings
          }
        }
      }
    }
  `;

  const data = await request("POST", "/api/internal/graphql", {
    query: userProfileQuery,
    operationName: "getFullUserProfile",
  });

  return data;
}