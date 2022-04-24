import { EntryWithScores, EntryWithScoresPublic } from ".";
import ActionMenu, { Action } from "../../shared/ActionMenu";
import Button from "../../shared/Button";
import ExternalLink from "../../shared/ExternalLink";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import { Permissions } from "../../state/appStateReducer";
import useAppState from "../../state/useAppState";

type EntriesByAvgScoreProps = {
  entriesByAvgScore: EntryWithScores[] | EntryWithScoresPublic[]
  votingEnabled: boolean
  handleShowEntryVotes: (id: number) => void
  showVoteForm: (id: number) => void
  handleRemoveVote: (id: number) => void
  handleAddWinner: (id: number) => void
  testId?: string
}

function EntriesByAvgScoreCard(props: EntriesByAvgScoreProps) {
  const { state } = useAppState();
  
  const permissionsRequired: (keyof Permissions)[] = ["manage_winners"];
  if (props.votingEnabled) {
    permissionsRequired.push("judge_entries");
  }

  return (
    <Table label={state.logged_in ? "Entries by Average Score" : "All Entries"} testId={props.testId}>
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
          if (!state.logged_in) {
            let entry = e as unknown as EntryWithScoresPublic;

            return (
              <Row key={"entry-score-" + entry.entry_id}>
                <Cell>{entry.entry_id}</Cell>
                <Cell><ExternalLink to={entry.entry_url}>{entry.title}</ExternalLink></Cell>
                <Cell>{entry.entry_author}</Cell>
              </Row>
            );
          }
          else {
            let entry = e as unknown as EntryWithScores;

            const entryActions: Action[] = [];
            
            if ((props.votingEnabled && (state.user?.permissions.judge_entries || state.is_admin)) && !entry.voted_by_user) {
              entryActions.push({
                role: "button",
                action: props.showVoteForm,
                text: "Vote for entry",
                data: entry.entry_id,
                testId: "entry-" + entry.entry_id + "-vote-action"
              });
            }

            if ((props.votingEnabled && (state.user?.permissions.judge_entries || state.is_admin)) && entry.voted_by_user) {
              entryActions.push({
                role: "button",
                action: props.handleRemoveVote,
                text: "Remove Vote",
                data: entry.entry_id,
                testId: "entry-" + entry.entry_id + "-remove-vote-action"
              });
            }

            if ((state.is_admin || state.user?.permissions.manage_winners)) {
              entryActions.push({
                role: "button",
                action: props.handleAddWinner,
                text: "Mark as winner",
                data: entry.entry_id,
                testId: "entry-" + entry.entry_id + "-mark-as-winner-action"
              });
            }

            return (
              <Row key={"entry-score-" + entry.entry_id}>
                <Cell>{entry.entry_id}</Cell>
                <Cell><ExternalLink to={entry.entry_url}>{entry.title}</ExternalLink></Cell>
                <Cell>{entry.entry_author}</Cell>
                <Cell>{entry.evaluations}</Cell>
                <Cell>{entry.entry_level}</Cell>
                <Cell>{entry.avg_score}</Cell>
                <Cell>{entry.vote_count > 0 ? <Button type="tertiary" role="button" action={props.handleShowEntryVotes} data={entry.entry_id} text={"" + entry.vote_count} testId={"entry-" + entry.entry_id + "-vote-count-btn"} /> : entry.vote_count}</Cell>
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