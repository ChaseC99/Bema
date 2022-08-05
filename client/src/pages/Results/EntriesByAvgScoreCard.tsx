import { Link } from "react-router-dom";
import ActionMenu, { Action } from "../../shared/ActionMenu";
import Badge from "../../shared/Badge";
import Button from "../../shared/Button";
import ExternalLink from "../../shared/ExternalLink";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import { Permissions } from "../../state/appStateReducer";
import useAppState from "../../state/useAppState";
import { Entry } from "./Results";

type EntriesByAvgScoreProps = {
  entriesByAvgScore: Entry[]
  votingEnabled: boolean
  handleShowEntryVotes: (id: string) => void
  showVoteForm: (id: string) => void
  handleAddWinner: (id: string) => void
  testId?: string
}

function EntriesByAvgScoreCard(props: EntriesByAvgScoreProps) {
  const { state } = useAppState();
  
  const permissionsRequired: (keyof Permissions)[] = ["manage_winners"];
  if (props.votingEnabled) {
    permissionsRequired.push("judge_entries");
  }

  return (
    <Table label={state.loggedIn ? "Entries by Average Score" : "All Entries"} testId={props.testId}>
      <TableHead>
        <Row>
          <Cell>ID</Cell>
          <Cell>Title</Cell>
          <Cell>Author</Cell>
          <Cell requireLoggedIn>Evaluations</Cell>
          <Cell requireLoggedIn>Skill Level</Cell>
          <Cell requireLoggedIn>Avg Score</Cell>
          <Cell requireLoggedIn>Votes</Cell>
          <Cell requireLoggedIn permissions={permissionsRequired}></Cell>
        </Row>
      </TableHead>
      <TableBody>

        {props.entriesByAvgScore.map((e) => {
          if (!state.loggedIn) {
            return (
              <Row key={"entry-score-" + e.id}>
                <Cell>{e.id}</Cell>
                <Cell><ExternalLink to={e.url}>{e.title}</ExternalLink></Cell>
                <Cell>{e.author ? e.author.name : "Unknown Author"}</Cell>
              </Row>
            );
          }
          else {
            const entryActions: Action[] = [];
            
            if ((props.votingEnabled && (state.user?.permissions.judge_entries || state.isAdmin)) && !e.isVotedByUser) {
              entryActions.push({
                role: "button",
                action: props.showVoteForm,
                text: "Vote for entry",
                data: e.id,
                testId: "entry-" + e.id + "-vote-action"
              });
            }

            if ((state.isAdmin || state.user?.permissions.manage_winners)) {
              entryActions.push({
                role: "button",
                action: props.handleAddWinner,
                text: "Mark as winner",
                data: e.id,
                testId: "entry-" + e.id + "-mark-as-winner-action"
              });
            }

            return (
              <Row key={"entry-score-" + e.id}>
                <Cell>{e.id}</Cell>
                <Cell><ExternalLink to={e.url}>{e.title}</ExternalLink>{e.isVotedByUser ? <Badge type='primary' text='Voted' color='#1865f2' /> : ''}</Cell>
                <Cell>{e.author ? <Link to={"/contestants/" + e.author.kaid}>{e.author.name}</Link> : "Unknown Author"}</Cell>
                <Cell>{e.evaluationCount}</Cell>
                <Cell>{e.skillLevel}</Cell>
                <Cell>{e.averageScore}</Cell>
                <Cell>{e.voteCount > 0 ? <Button type="tertiary" role="button" action={props.handleShowEntryVotes} data={e.id} text={"" + e.voteCount} testId={"entry-" + e.id + "-vote-count-btn"} /> : e.voteCount}</Cell>
                <Cell>
                  <ActionMenu actions={entryActions} />
                </Cell>
              </Row>
            );
          }
        })}
      </TableBody>
    </Table>
  );
}

export default EntriesByAvgScoreCard;