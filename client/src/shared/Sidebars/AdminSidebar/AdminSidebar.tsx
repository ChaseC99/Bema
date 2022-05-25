import useAppState from "../../../state/useAppState";
import SidebarItem from "../../SidebarItem/SidebarItem";
import "../sidebars.css";
import { useEffect, useState } from "react";
import { fetchCurrentContest, fetchLastContestEvaluatedByUser } from "./fetchSidebarData";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";

function AdminSidebar() {
  const { state } = useAppState();
  const permissions = state.user?.permissions;
  const [currentContestId, setCurrentContestId] = useState<number>();
  const [evaluationContestId, setEvaluationContestId] = useState<number>();
  const [currentContestIdLoading, setCurrentContestIdLoading] = useState<boolean>(true);
  const [evaluationContestIdLoading, setEvaluationContestIdLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCurrentContest()
    .then(id => {
      setCurrentContestId(id);
      setCurrentContestIdLoading(false);
    });

    if (state.loggedIn && state.user) {
      fetchLastContestEvaluatedByUser(state.user.id)
      .then(id => {
        setEvaluationContestId(id);
        setEvaluationContestIdLoading(false);
      });
    }
    else {
      setEvaluationContestIdLoading(false);
    }
  }, [state.loggedIn, state.user]);

  if (currentContestIdLoading || evaluationContestIdLoading) {
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
        <SidebarItem text="Entries" to={"/entries/" + currentContestId} testId="sidebar-entries" />

        {state.loggedIn && <SidebarItem text="Contestants" to="/contestants" testId="sidebar-contestants" />}
        
        {state.loggedIn && <SidebarItem text="Evaluations" 
          to={evaluationContestId ? 
            ("/admin/evaluations/" + state.user?.id + "/" + evaluationContestId) : 
            ("/admin/evaluations/" + state.user?.id + "/" + currentContestId)} 
          testId="sidebar-evaluations" />}

        <SidebarItem text="Results" to={"/results/" + currentContestId} testId="sidebar-results" />
      </div>

      {state.loggedIn && (permissions?.view_all_tasks || permissions?.view_judging_settings || permissions?.view_all_users || permissions?.view_errors || state.isAdmin) && 
        <div className="sidebar-section">
          <h3>Admin</h3>
          {state.isAdmin && <SidebarItem text="Skill Levels" to="/admin/skill-levels" testId="sidebar-skill-levels" />}
          {(state.isAdmin || permissions?.view_all_tasks) && <SidebarItem text="Tasks" to="/admin/tasks" testId="sidebar-tasks" />}
          {(state.isAdmin || permissions?.view_judging_settings) && <SidebarItem text="Judging" to="/admin/judging" testId="sidebar-judging" />}
          {(state.isAdmin || permissions?.view_all_users) && <SidebarItem text="Users" to="/admin/users" testId="sidebar-users" />}
          {(state.isAdmin || permissions?.view_errors) && <SidebarItem text="Errors" to="/admin/errors" testId="sidebar-errors" />}
        </div>
      }
    </div>
  );
}

export default AdminSidebar;