import { Link } from "react-router-dom";
import ActionMenu from "../../shared/ActionMenu";
import ExternalLink from "../../shared/ExternalLink";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import useAppState from "../../state/useAppState";
import { Entry } from "./Results";

type WinnersCardProps = {
  winners: Entry[]
  handleRemoveWinner: (id: string) => void
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
            <Row key={"winner-table-row-" + e.id}>
              <Cell>{e.id}</Cell>
              <Cell><ExternalLink to={e.url}>{e.title}</ExternalLink></Cell>
              <Cell><Link to={"/contestant/" + e.author?.kaid}>{e.author?.name}</Link></Cell>
              <Cell>{e.skillLevel}</Cell>
              {(state.user?.permissions.manage_winners || state.isAdmin) ?
                <Cell>
                  <ActionMenu testId={"winner-action-" + e.id} actions={[
                    {
                      role: "button",
                      action: props.handleRemoveWinner,
                      text: "Remove",
                      data: e.id,
                      testId: "winner-action-" + e.id + "-remove"
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