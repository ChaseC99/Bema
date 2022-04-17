type RowProps = {
  children: React.ReactChild | React.ReactChild[]
  testId?: string
}

function Row(props: RowProps) {
  return (
    <tr data-testid={props.testId}>
      {props.children}
    </tr>
  );
}

export default Row;