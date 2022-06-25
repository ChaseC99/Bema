import useAppState from "../../../state/useAppState";
import SidebarItem from "../../SidebarItem/SidebarItem";
import "../sidebars.css";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import { gql, useQuery } from "@apollo/client";
import useAppError from "../../../util/errors";

type GetCurrentContestResponse = {
  currentContest: {
    id: string
  }
}

const GET_CURRENT_CONTEST = gql`
  query GetCurrentContest {
    currentContest {
      id
    }
  }
`;

type GetContestsEvaluatedByUserResponse = {
  contests: {
    id: string
  }[]
}

const GET_CONTESTS_EVALUATED_BY_USER = gql`
  query GetContestsEvaluatedByUser($userId: ID!) {
    contests: contestsEvaluatedByUser(id: $userId) {
      id
    }
  }
`;

function AdminSidebar() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const permissions = state.user?.permissions;

  const { loading: currentContestIsLoading, data: currentContestData } = useQuery<GetCurrentContestResponse>(GET_CURRENT_CONTEST, { onError: handleGQLError });
  const { loading: contestsEvaluatedByUserIsLoading, data: contestsEvaluatedByUserData } = useQuery<GetContestsEvaluatedByUserResponse>(GET_CONTESTS_EVALUATED_BY_USER, { 
    variables: {
      userId: state.user?.id || 0
    },
    onError: handleGQLError 
  });

  if (currentContestIsLoading || contestsEvaluatedByUserIsLoading) {
    return (
      <div className="sidebar">
        <LoadingSpinner size="SMALL" testId="sidebar-spinner" />
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>Info</h3>
        <SidebarItem text="Dashboard" to="/admin/dashboard" testId="sidebar-dashboard" />
        <SidebarItem text="Contests" to="/admin/contests" testId="sidebar-contests" />
        <SidebarItem text="Entries" to={"/entries/" + currentContestData?.currentContest.id} testId="sidebar-entries" />

        {state.loggedIn && <SidebarItem text="Contestants" to="/contestants" testId="sidebar-contestants" />}

        {state.loggedIn && contestsEvaluatedByUserData && <SidebarItem text="Evaluations"
          to={contestsEvaluatedByUserData.contests.length > 0 ?
            ("/admin/evaluations/" + state.user?.id + "/" + contestsEvaluatedByUserData.contests[0].id) :
            ("/admin/evaluations/" + state.user?.id + "/" + currentContestData?.currentContest.id)}
          testId="sidebar-evaluations" />}

        <SidebarItem text="Results" to={"/results/" + currentContestData?.currentContest.id} testId="sidebar-results" />
      </div>

      {state.loggedIn && (permissions?.view_all_tasks || permissions?.view_judging_settings || permissions?.view_all_users || permissions?.view_errors || state.isAdmin) &&
        <div className="sidebar-section">
          <h3>Admin</h3>
          {state.isAdmin && <SidebarItem text="Skill Levels" to="/admin/skill-levels" testId="sidebar-skill-levels" />}
          {(state.isAdmin || permissions?.view_all_tasks) && <SidebarItem text="Tasks" to="/admin/tasks" testId="sidebar-tasks" />}
          {(state.isAdmin || permissions?.view_judging_settings) && <SidebarItem text="Judging" to="/admin/judging" testId="sidebar-judging" />}
          {(state.isAdmin || permissions?.view_all_users) && <SidebarItem text="Users" to="/admin/users" testId="sidebar-users" />}
          {(state.isAdmin || permissions?.view_errors) && <SidebarItem text="Errors" to="/admin/errors" testId="sidebar-errors" />}
          {(state.isAdmin || permissions?.view_errors) && <SidebarItem text="API Explorer" to="/admin/graphql" testId="sidebar-api-explorer" />}
        </div>
      }
    </div>
  );
}

export default AdminSidebar;