import "./ProgressRing.css";

type ProgressRingProps = {
  label: string
  count: number
  total: number
  testId?: string
}

function ProgressRing(props: ProgressRingProps) {
  const percent = Math.round((props.count / props.total) * 100) || 0;
  const offset = 564 - (564 * percent) / 100;
  
  return (
    <div className="progress-ring-container" data-testid={props.testId}>
      <div className="progress-ring">
        <svg>
          <circle cx="90" cy="90" r="90"></circle>
          <circle cx="90" cy="90" r="90" style={{strokeDashoffset: offset}}></circle>
        </svg>
        <div className="progress-ring-percent">
          <p>{percent}<span>%</span></p>
          <p className="progress-ring-percent-label">{props.count} / {props.total}</p>
        </div>
      </div>
      <p className="progress-ring-label">{props.label}</p>
    </div>
  );
}

export default ProgressRing;