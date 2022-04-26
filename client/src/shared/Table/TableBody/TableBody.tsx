type TableBodyProps = {
  children: React.ReactChild | React.ReactChild[]
  testId?: string
}

function TableBody(props: TableBodyProps) {
  return (
    <tbody data-testid={props.testId}>
      {props.children}
    </tbody>
  );
}

export default TableBody;