type TestAreaFieldProps = {
  name: string
  id: string
  value: string
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  onChange: (name: string, value: string) => void
  description?: string
  rows?: number
  required?: boolean
  testId?: string
}

function TestAreaField(props: TestAreaFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.onChange(e.target.name, e.target.value);
  }

  let size;
  if (props.size === "SMALL") {
    size = "col-3";
  }
  else if (props.size === "MEDIUM") {
    size = "col-6";
  }
  else {
    size = "col-12";
  }

  return (
    <div className={"form-item " + size} data-testid={props.testId}>
      <label htmlFor={props.id}>{props.label}</label>

      {props.description &&
        <p className="form-item-description">{props.description}</p>
      }

      <textarea id={props.id} name={props.name} rows={props.rows || 8} onChange={handleChange} required={props.required} value={props.value} data-testid={props.testId ? props.testId + "-input" : ""} />
    </div>
  );
}

export default TestAreaField;