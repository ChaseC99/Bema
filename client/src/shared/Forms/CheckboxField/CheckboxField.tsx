type CheckboxFieldProps = {
  name: string
  id: string
  value: boolean
  onChange: (name: string, value: any) => void
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  description?: string
  disabled?: boolean
  testId?: string
}

function CheckboxField(props: CheckboxFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checkbox = e.target;
    props.onChange(checkbox.name, checkbox.checked);
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
    <div className={"form-item " + size + " checkbox"} data-testid={props.testId}>
      <div>
        <input type="checkbox" checked={props.value} key={props.id + "-" + props.value} name={props.name} id={props.id} onChange={handleChange} disabled={props.disabled} data-testid={props.testId ? (props.testId + "-input") : ""} />
        {props.value && <svg width="16" height="16" viewBox="0 0 16 16"><path fill={props.disabled ? "rgba(33, 36, 44, 0.32)" : "#ffffff"} d="M11.263 4.324a1 1 0 1 1 1.474 1.352l-5.5 6a1 1 0 0 1-1.505-.036l-2.5-3a1 1 0 1 1 1.536-1.28L6.536 9.48l4.727-5.157z"></path></svg> }
        <label htmlFor={props.id}>{props.label}</label>
      </div>
      {props.description && <p className="form-item-description">{props.description}</p>}
    </div>
  );
}

export default CheckboxField;