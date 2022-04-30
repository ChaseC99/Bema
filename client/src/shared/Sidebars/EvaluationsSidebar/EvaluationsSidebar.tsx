import { useEffect, useState } from "react";
import LoadingSpinner from "../../LoadingSpinner";
import SidebarItem from "../../SidebarItem/SidebarItem";
import { fetchContestData } from "./fetchContestData";

type Contest = {
  contest_name: string
  contest_id: number
}

type EvaluationsSidebarProps = {
  evaluatorId: number
}

function EvaluationsSidebar(props: EvaluationsSidebarProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchContestData(props.evaluatorId)
    .then((data) => {
      setContests(data.contests);
      setIsLoading(false);
    })
  }, []);

  if (isLoading) {
    return (
      <div className="sidebar">
        <LoadingSpinner size="SMALL" testId="sidebar-spinner" />
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>Contests</h3>

        {contests.map((c) => {
          return (
            <SidebarItem text={c.contest_name.split("Contest: ")[1]} to={"/admin/evaluations/" + props.evaluatorId + "/" + c.contest_id} key={"contest-sidebar-" + c.contest_id} />
          );
        })}
      </div>
    </div>
  );
}

export default EvaluationsSidebar;