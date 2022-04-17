type TableHeadProps = {
  children: React.ReactChild | React.ReactChild[]
  testId?: string
}

function TableHead(props: TableHeadProps) {
  return (
    <thead data-testid={props.testId}>
      {props.children}
    </thead>
  );
}

export default TableHead;