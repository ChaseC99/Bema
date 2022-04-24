import "./ProgressBar.css";

type ProgressBarProps = {
  count: number
  total: number
  testId?: string
}

function ProgressBar(props: ProgressBarProps) {
  const percent = props.total === 0 ? 0 : Math.round((props.count / props.total) * 100);

  return (
    <div className="progress-bar-wrapper" data-testid={props.testId}>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: percent + "%" }}></div>
      </div>
      <div className="progress-bar-info">
        <span>{percent}%</span>
      </div>
    </div>
  );
}

export default ProgressBar;