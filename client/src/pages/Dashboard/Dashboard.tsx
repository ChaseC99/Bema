import React, { useEffect, useState } from "react";
import AdminSidebar from "../../shared/Sidebars/AdminSidebar";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import ProgressRing from "../../shared/ProgressRing/ProgressRing";
import useAppState from "../../state/useAppState";
import { fetchStats } from "./fetchStats";
import ProgressBar from "../../shared/ProgressBar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import { gql, useQuery } from "@apollo/client";

type Progress = {
  count: number
  total: number
}

type JudgingProgress = {
  user: Progress
  group: Progress
  entries: Progress | null
  evaluations: Progress | null
}

type GetJudgingProgressResponse = {
  judgingProgress: JudgingProgress
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
              <article className={(state.is_admin || state.user?.permissions.view_admin_stats) ? "card col-12" : "card col-8"} data-testid="contest-summary">
                <div className="card-header">
                  <h3>Contest Summary</h3>
                </div>
                <div className="card-body no-footer container space-around col-12">
                  <ProgressRing label="Your Progress" count={progressData.judgingProgress.user.count} total={progressData.judgingProgress.user.total} />
                  <ProgressRing label="Group Progress" count={progressData.judgingProgress.group.count} total={progressData.judgingProgress.group.total} />

                  {(state.is_admin || state.user?.permissions.view_admin_stats) &&
                    <ProgressRing label="Total Reviewed Entries" count={progressData.judgingProgress.entries?.count || 0} total={progressData.judgingProgress.entries?.total || 0} />
                  }
                  {(state.is_admin || state.user?.permissions.view_admin_stats) &&
                    <ProgressRing label="Total Evaluations" count={progressData.judgingProgress.evaluations?.count || 0} total={progressData.judgingProgress.evaluations?.total || 0} />
                  }
                </div>
              </article>
            )}

            {/* {!isLoading && (state.is_admin || state.user?.permissions.view_admin_stats) && (
              <Table label="Evaluator Progress" cols={6}>
                <TableHead>
                  <Row>
                    <Cell></Cell>
                    <Cell></Cell>
                  </Row>
                </TableHead>
                <TableBody>
                  {stats.evaluationsPerEvaluator?.map((e) => {
                    const groupEntryCount = stats.entriesPerGroup?.find((g) => g.group_id === e.group_id)?.entry_count || 0;
                    return (
                      <Row key={e.nickname + "-progress"}>
                        <Cell>
                          {e.nickname}
                        </Cell>
                        <Cell>
                          <ProgressBar count={e.eval_count} total={groupEntryCount} />
                        </Cell>
                      </Row>
                    );
                  }) || <div></div>}
                </TableBody>
              </Table>
            )}

            {!isLoading && (state.is_admin || state.user?.permissions.view_admin_stats) && (
              <article className="card col-6" data-testid="entry-stats">
                <div className="card-header">
                  <h3>Entry Stats</h3>
                </div>
                <div className="card-body">
                  <p>Flagged Entries: {stats.totalFlaggedEntries}</p>
                  <p>Disqualified Entries: {stats.totalDisqualifiedEntries}</p>
                  <p>Total Entries: {stats.totalEntriesCount}</p>
                </div>
              </article>
            )} */}
          </div>
        </div>
      </section>

    </React.Fragment>
  );
}

export default Dashboard;