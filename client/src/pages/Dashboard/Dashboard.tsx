import React, { useEffect, useState } from "react";
import AdminSidebar from "../../shared/Sidebars/AdminSidebar";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import ProgressRing from "../../shared/ProgressRing/ProgressRing";
import useAppState from "../../state/useAppState";
import { fetchStats } from "./fetchStats";
import ProgressBar from "../../shared/ProgressBar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";

type ContestStats = {
  groupEntriesCount: number
  groupEvaluationsCount: number
  groupEvaluatorCount: number
  totalActiveEvaluators?: number
  totalDisqualifiedEntries?: number
  totalEntriesCount?: number
  totalEvaluationsCount?: number
  totalFlaggedEntries?: number
  totalReviewedEntries?: number
  yourReviewedEntriesCount: number
  evaluationsPerEvaluator?: {
    eval_count: number
    group_id: number
    nickname: string
  }[]
  entriesPerGroup?: {
    entry_count: number
    group_id: number
  }[]
}

const defaultStats = {
  groupEntriesCount: 50,
  groupEvaluationsCount: 80,
  groupEvaluatorCount: 3,
  yourReviewedEntriesCount: 10
}

function Dashboard() {
  const { state } = useAppState();
  const [stats, setStats] = useState<ContestStats>(defaultStats);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats()
      .then(data => {
        setStats(data);
        setStatsLoading(false);
      });
  }, []);

  return (
    <React.Fragment>
      <AdminSidebar />

      <section id="dashboard-stats-section" className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2 data-testid="dashboard-header">Dashboard</h2>
          </div>
          <div className="section-body container col-12" data-testid="dashboard-section-body">
            {statsLoading && <LoadingSpinner size="MEDIUM" testId="stats-spinner" />}

            {!statsLoading && (
              <article className={(state.is_admin || state.user?.permissions.view_admin_stats) ? "card col-12" : "card col-8"} data-testid="contest-summary">
                <div className="card-header">
                  <h3>Contest Summary</h3>
                </div>
                <div className="card-body no-footer container space-around col-12">
                  <ProgressRing label="Your Progress" count={stats.yourReviewedEntriesCount} total={stats.groupEntriesCount} />
                  <ProgressRing label="Group Progress" count={stats.groupEvaluationsCount} total={stats.groupEntriesCount * stats.groupEvaluatorCount} />

                  {(state.is_admin || state.user?.permissions.view_admin_stats) &&
                    <ProgressRing label="Total Reviewed Entries" count={stats.totalReviewedEntries || 0} total={stats.totalEntriesCount || 0} />
                  }
                  {(state.is_admin || state.user?.permissions.view_admin_stats) &&
                    <ProgressRing label="Total Evaluations" count={stats.totalEvaluationsCount || 0} total={(stats.totalActiveEvaluators || 0) * (stats.totalEntriesCount || 0)} />
                  }
                </div>
              </article>
            )}

            {!statsLoading && (state.is_admin || state.user?.permissions.view_admin_stats) && (
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

            {!statsLoading && (state.is_admin || state.user?.permissions.view_admin_stats) && (
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
            )}
          </div>
        </div>
      </section>

    </React.Fragment>
  );
}

export default Dashboard;