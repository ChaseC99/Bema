type SliderFieldProps = {
  name: string
  id: string
  value: number
  onChange: (name: string, value: number) => void
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  description?: string
  min: number
  max: number
  step: number
  tickStep: number
  testId?: string
}

function SliderField(props: SliderFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.target.name, parseInt(e.target.value) * props.step);
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

      <div className="slider-container">
        <div className="slider-wrapper">
          <input
            type="range"
            name={props.name}
            id={props.id}
            min={props.min}
            max={props.max / props.step}
            onChange={handleChange}
            value={props.value / props.step}
          />

          <div className="slider-ticks">
            {[...Array((props.max / props.tickStep) + 1)].map((_, i) => {
              return (
                <div className="tick" key={i}>
                  <p>|</p>
                  <p>{i * props.tickStep}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p>{props.value}</p>
      </div>
    </div>
  );
}

export default SliderField;