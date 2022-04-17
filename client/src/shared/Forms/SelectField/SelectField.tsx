import { useState } from "react"

type SelectFieldProps = {
  name: string
  id: string
  value: string
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  choices: ({ value: string, text: string })[]
  onChange: (name: string, value: string) => void
  description?: string
  placeholder?: string
  testId?: string
}

function SelectField(props: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getLabelByValue = (value: string) => {
    const c = props.choices.find((choice) => {
      return choice.value === value;
    });

    return c?.text || "";
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  }

  const handleChange = (value: any) => {
    setIsOpen(false);
    props.onChange(props.name, value);
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

      <div className="select-wrapper">
        <div className="select-picker-container">
          <button className={"select-picker-button" + (props.value === "" ? " empty" : "")} onClick={handleClick} data-testid={props.testId ? props.testId + "-button" : ""}>
            <span>{getLabelByValue(props.value) || props.placeholder || "Select a value"}</span>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path fill="rgba(33,36,44,0.64)" d="M8 8.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 8.586z"></path></svg>
          </button>
        </div>

        {isOpen &&
          <div className="select-popup-container" data-testid={props.testId ? props.testId + "-choices" : ""}>
            {props.choices.map((choice) => {
              return (
                <div onClick={() => handleChange(choice.value)} className={choice.value === props.value ? "selected" : ""} key={props.id + "-" + choice.value}>
                  <svg width="16" height="16" viewBox="0 0 16 16"><path d="M6.072 10.4l6.175-7.058a1 1 0 1 1 1.506 1.317L6.769 12.64a1 1 0 0 1-1.55-.054L2.203 8.604a1 1 0 1 1 1.594-1.208L6.072 10.4z"></path></svg>
                  <span>{choice.text}</span>
                </div>
              );
            })}
          </div>
        }
      </div>
    </div>
  );
}

export default SelectField;