import LoadingSpinner from "../../LoadingSpinner";
import SidebarItem from "../../SidebarItem/SidebarItem";
import "../sidebars.css";
import { gql, useQuery } from "@apollo/client";
import { handleGqlError } from "../../../util/errors";

type ContestSidebarProps = {
  rootPath: string
}

type Contest = {
  id: number
  name: string
}

type GetAllContestsResponse = {
  contests: Contest[]
}

const GET_ALL_CONTESTS = gql`
  query GetAllContests {
    contests {
      id
      name
    }
  }
`;

function ContestsSidebar(props: ContestSidebarProps) {
  const { loading, data, error } = useQuery<GetAllContestsResponse>(GET_ALL_CONTESTS);

  if (loading) {
    return (
      <div className="sidebar">
        <LoadingSpinner size="SMALL" testId="sidebar-spinner" />
      </div>
    );
  }

  if (error) {
    return handleGqlError(error);
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>Contests</h3>

        {data?.contests.map((c) => {
          return (
            <SidebarItem text={c.name.split("Contest: ")[1]} to={props.rootPath + "/" + c.id} key={"contest-sidebar-" + c.id} />
          );
        })}
      </div>
    </div>
  );
}

export default ContestsSidebar;