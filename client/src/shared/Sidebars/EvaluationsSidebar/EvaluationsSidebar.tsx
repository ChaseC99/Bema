import { gql, useQuery } from "@apollo/client";
import useAppError from "../../../util/errors";
import LoadingSpinner from "../../LoadingSpinner";
import SidebarItem from "../../SidebarItem/SidebarItem";

type EvaluationsSidebarProps = {
  evaluatorId: number
}

type Contest = {
  id: string
  name: string
}

type GetContestsEvaluatedByUserResponse = {
  contests: Contest[]
}

const GET_CONTESTS_EVALUATED_BY_USER = gql`
  query GetContestsEvaluatedByUser($userId: ID!) {
    contests: contestsEvaluatedByUser(id: $userId) {
      id
      name
    }
  }
`;

function EvaluationsSidebar(props: EvaluationsSidebarProps) {
  const { handleGQLError } = useAppError();
  const { loading: isLoading, data: contestsData } = useQuery<GetContestsEvaluatedByUserResponse>(GET_CONTESTS_EVALUATED_BY_USER, {
    variables: {
      userId: props.evaluatorId
    },
    onError: handleGQLError
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
        {contestsData?.contests.map((c) => {
          return (
            <SidebarItem text={c.name.split("Contest: ")[1]} to={"/admin/evaluations/" + props.evaluatorId + "/" + c.id} key={"contest-sidebar-" + c.id} />
          );
        })}
      </div>
    </div>
  );
}

export default EvaluationsSidebar;