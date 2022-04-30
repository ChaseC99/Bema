import "../Table.css";

type TableProps = {
  children: React.ReactChild | React.ReactChild[]
  label?: string
  testId?: string
  cols?: number
  noCard?: boolean
}

function Table(props: TableProps) {
  return (
    <div className={(props.noCard ? "" : "card table-card ") + "col-" + (props.cols || 12)}>
      {props.label && <h3>{props.label}</h3>}

      <table data-testid={props.testId}>
        {props.children}
      </table>
    </div>
  );
}

export default Table;