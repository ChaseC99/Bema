import { WinningEntry } from ".";
import ActionMenu from "../../shared/ActionMenu";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import useAppState from "../../state/useAppState";

type WinnersCardProps = {
  winners: WinningEntry[]
  handleRemoveWinner: (id: number) => void
}

function WinnersCard(props: WinnersCardProps) {
  const { state } = useAppState();

  return (
    <Table label="Winning Entries" cols={12}>
      <TableHead>
        <Row>
          <Cell header>ID</Cell>
          <Cell header>Title</Cell>
          <Cell header>Author</Cell>
          <Cell header>Skill Level</Cell>
          <Cell header permissions={["manage_winners"]} width="15px"></Cell>
        </Row>
      </TableHead>
      <TableBody testId="winners-table-body">
        {props.winners.map((e) => {
          return (
            <Row>
              <Cell>{e.entry_id}</Cell>
              <Cell>{e.entry_title}</Cell>
              <Cell>{e.entry_author}</Cell>
              <Cell>{e.entry_level}</Cell>
              {(state.user?.permissions.manage_winners || state.is_admin) ?
                <Cell>
                  <ActionMenu testId={"winner-action-" + e.entry_id} actions={[
                    {
                      role: "button",
                      action: props.handleRemoveWinner,
                      text: "Remove",
                      data: e.entry_id,
                      testId: "winner-action-" + e.entry_id + "-remove"
                    }
                  ]} />
                </Cell>
                : ""}
            </Row>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default WinnersCard;