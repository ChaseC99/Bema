import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import { EntryLevel } from "./Results";

type EntriesPerLevelCardProps = {
  entriesPerLevel: EntryLevel[]
  testId?: string
}

function EntriesPerLevelCard(props: EntriesPerLevelCardProps) {
  return (
    <Table label="Entries Per Skill Level" cols={4} testId={props.testId}>
      <TableHead>
        <Row>
          <Cell header>Level</Cell>
          <Cell header>Entry Count</Cell>
        </Row>
      </TableHead>
      <TableBody>
        {props.entriesPerLevel.map((e) => {
          return (
            <Row key={"entries-per-level-row-" + e.level}>
              <Cell>{e.level}</Cell>
              <Cell>{e.count}</Cell>
            </Row>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default EntriesPerLevelCard;