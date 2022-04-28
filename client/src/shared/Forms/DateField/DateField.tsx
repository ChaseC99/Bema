import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type DateFieldProps = {
  name: string
  id: string
  value: string
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  onChange: (name: string, value: string) => void
  description?: string
  minDate?: string
  maxDate?: string
  testId?: string
}

function DateField(props: DateFieldProps) {
  const handleChange = (date: Date | null, event: React.SyntheticEvent<any, Event> | undefined) => {
    let d = date?.toLocaleString("en-US") || "";
    
    if (d.length > 0) {
      const parts = d.split(",")[0].split("/");
      d = parts[0] + "-" + parts[1] + "-" + parts[2];
    }

    props.onChange(props.name, d);
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

      <DatePicker
        selected={props.value ? new Date(props.value) : null}
        onChange={handleChange}
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
    </div>
  );
}

export default DateField;