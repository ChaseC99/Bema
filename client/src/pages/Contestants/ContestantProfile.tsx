import React from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../shared/LoadingSpinner";
import AdminSidebar from "../../shared/Sidebars/AdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import "./ContestantProfile.css";
import { gql, useQuery } from "@apollo/client";
import useAppError from "../../util/errors";
import ExternalLink from "../../shared/ExternalLink";
import Badge from "../../shared/Badge";

type Entry = {
  id: string
  title: string
  contest: {
    name: string
  }
  skillLevel: string
  isWinner: boolean
  isDisqualified: boolean
  averageScore: number
  url: string
}

type Contestant = {
  name: string
  entryCount: number
  contestCount: number
  entries: Entry[]
}

type GetContestantProfileResponse = {
  contestant: Contestant
}

const GET_CONTESTANT_PROFILE = gql`
  query GetContestantProfile($kaid: String!) {
    contestant(kaid: $kaid) {
      name
      entryCount
      contestCount
      entries {
        id
        title
        contest {
          name
        }
        skillLevel
        isWinner
        isDisqualified
        averageScore
        url
      }
    }
  }
`;

function ContestantProfile() {
  const { contestantKaid } = useParams();
  const { handleGQLError } = useAppError();

  const { loading: profileIsLoading, data: profileData } = useQuery<GetContestantProfileResponse>(GET_CONTESTANT_PROFILE, {
    onError: handleGQLError,
    variables: {
      kaid: contestantKaid
    }
  });

  return (
    <React.Fragment>
      <AdminSidebar />

      <section id="contestant-section" className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2 data-testid="contestant-header">Contestant Profile</h2>
          </div>
          <div className="section-body" data-testid="contestant-section-body">
            {profileIsLoading && <LoadingSpinner size="LARGE" />}

            {!profileIsLoading &&
              <div className="card col-12 contestant-stats-card">
                <h2>{profileData?.contestant.name}</h2>
                <div className="col-12 stats-container">
                  <div className="stats-box">
                    <span className="stats-number">{profileData?.contestant.entryCount}</span>
                    <span className="label">Entries<br />Submitted</span>
                  </div>
                  <div className="stats-box">
                    <span className="stats-number">{profileData?.contestant.contestCount}</span>
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
                    {profileData ? profileData.contestant.entries.map((e) => {
                      return (
                        <Row key={e.id}>
                          <Cell>{e.id}</Cell>
                          <Cell><ExternalLink to={e.url}>{e.title}</ExternalLink>{e.isWinner ? <Badge type='primary' text='Winner' color='#9059ff' /> : ''}{e.isDisqualified ? <Badge type="primary" text="Disqualified" color="#d92916" /> : ''}</Cell>
                          <Cell>{e.contest.name}</Cell>
                          <Cell>{e.skillLevel}</Cell>
                          <Cell>{e.averageScore ? e.averageScore : "N/A"}</Cell>
                        </Row>
                      );
                    }) : ""}
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