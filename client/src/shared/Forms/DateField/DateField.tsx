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
    props.onChange(props.name, date?.toLocaleString("en-US") || "");
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
        selected={new Date(props.value)}
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