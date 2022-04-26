import spinner from "./loading-spinner.svg";
import "./LoadingSpinner.css";

type LoadingSpinnerProps = {
  size: Size
  testId?: string
}

type Size = "SMALL" | "MEDIUM" | "LARGE"

function LoadingSpinner(props: LoadingSpinnerProps) {
  return (
    <img src={spinner}
      className={"loading-spinner " + props.size.toLowerCase()}
      data-testid={props.testId}
      alt=""
    />
  );
}

export default LoadingSpinner;