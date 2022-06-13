import spinner from "./loading-spinner.svg";
import "./LoadingSpinner.css";

type LoadingSpinnerProps = {
  size: Size
  testId?: string
}

type Size = "XSMALL" | "SMALL" | "MEDIUM" | "LARGE" 

function LoadingSpinner(props: LoadingSpinnerProps) {
  let size = "24"
  if (props.size === "SMALL") {
    size = "40";
  }
  else if (props.size === "MEDIUM") {
    size = "120";
  }
  else if (props.size === "LARGE") {
    size = "200";
  }

  return (
    <div className={"loading-spinner " + props.size.toLowerCase()}>
      <svg xmlns="http://www.w3.org/2000/svg" width={size + "px"} height={size + "px"} viewBox={"0 0 24 24"} preserveAspectRatio="xMidYMid meet">
        <path fillRule="nonzero" d="M10.598.943c-.093-.449-.362-.748-.732-.875a1.314 1.314 0 0 0-.723-.033C3.83 1.417 0 6.317 0 11.864 0 18.538 5.398 24 12 24c6.598 0 12-5.471 12-12.16a1.333 1.333 0 0 0-.154-.548c-.193-.368-.544-.606-1.023-.606-.472 0-.825.229-1.035.585-.117.2-.169.39-.189.582-.124 5.472-4.294 9.73-9.599 9.73-5.349 0-9.599-4.3-9.599-9.72 0-4.46 3.036-8.299 7.28-9.444.127-.036.291-.107.458-.232.373-.28.57-.711.46-1.244z"></path>
      </svg>
    </div>
  );
}

export default LoadingSpinner;