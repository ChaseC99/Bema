import { useEffect, useState } from "react";
import LoadingSpinner from "../../LoadingSpinner";
import SidebarItem from "../../SidebarItem/SidebarItem";
import { fetchContests } from "./fetchContestData";
import "../sidebars.css";

interface Contest {
  contest_name: string
  contest_id: number
}

type ContestSidebarProps = {
  rootPath: string
}

function ContestsSidebar(props: ContestSidebarProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchContests()
      .then((data) => {
        setContests(data);
        setIsLoading(false);
      });
  });

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
            <SidebarItem text={c.contest_name} to={props.rootPath + "/" + c.contest_id} />
          );
        })}
      </div>
    </div>
  );
}

export default ContestsSidebar;