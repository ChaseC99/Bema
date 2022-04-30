import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../shared/LoadingSpinner";
import AdminSidebar from "../../shared/Sidebars/AdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import { fetchContestantStats } from "./fetchContestantData";
import "./ContestantProfile.css";
import ErrorPage from "../../shared/ErrorPage";

type ContestantStats = {
  contestCount: number
  entryCount: number
  profileInfo: {
    name: string
    kaid: string
  }
}

type Entry = {
  avg_score: number
  contest_id: number
  contest_name: string
  disqualified: boolean
  entry_id: number
  entry_level: string
  entry_title: string
  is_winner: boolean
}

const defaultStats: ContestantStats = {
  contestCount: 0,
  entryCount: 0,
  profileInfo: {
    name: "",
    kaid: ""
  }
}

function ContestantProfile() {
  const { contestantKaid } = useParams();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<ContestantStats>(defaultStats);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchContestantStats(contestantKaid || "")
      .then((data) => {
        setEntries(data.entries);
        setStats(data.stats);
        setIsLoading(false);
      })
  }, [contestantKaid]);

  if (!isLoading && stats.profileInfo === undefined) {
    return <ErrorPage type="ERROR" message="This contestant does not exist." />
  }

  return (
    <React.Fragment>
      <AdminSidebar />

      <section id="contestant-section" className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2 data-testid="contestant-header">Contestant Profile</h2>
          </div>
          <div className="section-body" data-testid="contestant-section-body">
            {isLoading && <LoadingSpinner size="LARGE" />}

            {!isLoading &&
              <div className="card col-12 contestant-stats-card">
                <h2>{stats.profileInfo.name}</h2>
                <div className="col-12 stats-container">
                  <div className="stats-box">
                    <span className="stats-number">{stats.entryCount}</span>
                    <span className="label">Entries<br />Submitted</span>
                  </div>
                  <div className="stats-box">
                    <span className="stats-number">{stats.contestCount}</span>
                    <span className="label">Contests<br />Entered</span>
                  </div>
                </div>

                <Table noCard>
                  <TableHead>
                    <Row>
                      <Cell header>ID</Cell>
                      <Cell header>Title</Cell>
                      <Cell header>Contest</Cell>
                      <Cell header>Level</Cell>
                      <Cell header>Avg Score</Cell>
                    </Row>
                  </TableHead>
                  <TableBody>
                    {entries.map((e) => {
                      return (
                        <Row key={e.entry_id}>
                          <Cell>{e.entry_id}</Cell>
                          <Cell>{e.entry_title}</Cell>
                          <Cell>{e.contest_name}</Cell>
                          <Cell>{e.entry_level}</Cell>
                          <Cell>{e.avg_score}</Cell>
                        </Row>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            }
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

export default ContestantProfile;