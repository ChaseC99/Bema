import React from "react";
import AdminSidebar from "../../shared/Sidebars/AdminSidebar";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import ProgressRing from "../../shared/ProgressRing/ProgressRing";
import useAppState from "../../state/useAppState";
import ProgressBar from "../../shared/ProgressBar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import { gql, useQuery } from "@apollo/client";

type Progress = {
  count: number
  total: number
}

type EvaluatorProgress = {
  user: {
    nickname: string
  }
  count: number
  total: number
}

type JudgingProgress = {
  user: Progress
  group: Progress
  entries: Progress | null
  evaluations: Progress | null
  evaluators: EvaluatorProgress[] | null
}

type EntryCounts = {
  flagged: number
  disqualified: number
  total: number
}

type GetJudgingProgressResponse = {
  judgingProgress: JudgingProgress
  entryCounts: EntryCounts | null
}

const GET_JUDGING_PROGRESS = gql`
  query GetJudgingProgress {
    judgingProgress {
      user {
        count
        total
      }
      group {
        count
        total
      }
      entries {
        count
        total
      }
      evaluations {
        count
        total
      }
      evaluators {
        user {
          nickname
        }
        count
        total
      }
    }
    entryCounts {
      flagged
      disqualified
      total
    }
  }
`;

function Dashboard() {
  const { state } = useAppState();
  const { loading: isLoading, data: progressData } = useQuery<GetJudgingProgressResponse>(GET_JUDGING_PROGRESS);

  return (
    <React.Fragment>
      <AdminSidebar />

      <section id="dashboard-stats-section" className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2 data-testid="dashboard-header">Dashboard</h2>
          </div>
          <div className="section-body container col-12" data-testid="dashboard-section-body">
            {isLoading && <LoadingSpinner size="MEDIUM" testId="stats-spinner" />}

            {(!isLoading && progressData) && (
              <article className={(state.isAdmin || state.user?.permissions.view_admin_stats) ? "card col-12" : "card col-8"} data-testid="contest-summary">
                <div className="card-header">
                  <h3>Contest Summary</h3>
                </div>
                <div className="card-body no-footer container space-around col-12">
                  <ProgressRing label="Your Progress" count={progressData.judgingProgress.user.count} total={progressData.judgingProgress.user.total} />
                  <ProgressRing label="Group Progress" count={progressData.judgingProgress.group.count} total={progressData.judgingProgress.group.total} />

                  {(state.isAdmin || state.user?.permissions.view_admin_stats) &&
                    <ProgressRing label="Total Reviewed Entries" count={progressData.judgingProgress.entries?.count || 0} total={progressData.judgingProgress.entries?.total || 0} />
                  }
                  {(state.isAdmin || state.user?.permissions.view_admin_stats) &&
                    <ProgressRing label="Total Evaluations" count={progressData.judgingProgress.evaluations?.count || 0} total={progressData.judgingProgress.evaluations?.total || 0} />
                  }
                </div>
              </article>
            )}

            {!isLoading && (state.isAdmin || state.user?.permissions.view_admin_stats) && (
              <Table label="Evaluator Progress" cols={6}>
                <TableHead>
                  <Row>
                    <Cell></Cell>
                    <Cell></Cell>
                  </Row>
                </TableHead>
                <TableBody>
                  {progressData?.judgingProgress.evaluators ? progressData.judgingProgress.evaluators.map((e) => {
                    return (
                      <Row key={e.user.nickname + "-progress"}>
                        <Cell>
                          {e.user.nickname}
                        </Cell>
                        <Cell>
                          <ProgressBar count={e.count} total={e.total} />
                        </Cell>
                      </Row>
                    );
                  }) : ""}
                </TableBody>
              </Table>
            )}

            {!isLoading && (state.isAdmin || state.user?.permissions.view_admin_stats) && (
              <article className="card col-6" data-testid="entry-stats">
                <div className="card-header">
                  <h3>Entry Stats</h3>
                </div>
                <div className="card-body">
                  <p>Flagged Entries: {progressData?.entryCounts?.flagged}</p>
                  <p>Disqualified Entries: {progressData?.entryCounts?.disqualified}</p>
                  <p>Total Entries: {progressData?.entryCounts?.total}</p>
                </div>
              </article>
            )}
          </div>
        </div>
      </section>

    </React.Fragment>
  );
}

export default Dashboard;