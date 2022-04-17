type InputFieldProps = {
  type: "email" | "number" | "password" | "text"
  name: string
  id: string
  value: string
  onChange: (name: string, value: string) => void
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  description?: string
  error?: string | null
  required?: boolean
  readonly?: boolean
  placeholder?: string
  pattern?: string
  autocomplete?: boolean
  autofocus?: boolean
  disabled?: boolean
  max?: number
  maxlength?: number
  min?: number
  minlength?: number
  step?: number
  testId?: string
}

function InputField(props: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      <input
        id={props.id}
        name={props.name}
        type={props.type}
        value={props.value}
        required={props.required}
        readOnly={props.readonly}
        placeholder={props.placeholder}
        pattern={props.pattern}
        autoComplete={props.autocomplete ? "on" : "off"}
        autoFocus={props.autofocus}
        disabled={props.disabled}
        max={props.max}
        maxLength={props.maxlength}
        min={props.min}
        minLength={props.minlength}
        step={props.step}
        onChange={handleChange}
        className={props.error ? "error" : ""}
        data-testid={props.testId + "-input"}
      />

      {props.error &&
        <p className="form-item-error">{props.error}</p>
      }
    </div>
  );
}

export default InputField;