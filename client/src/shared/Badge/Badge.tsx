type BadgeProps = {
  text: string
  color: string
  type: "primary" | "secondary"
}

function Badge(props: BadgeProps) {
  const badgeStylesPrimary: React.CSSProperties = {
    backgroundColor: props.color,
    color: "#ffffff",
    padding: "8px 12px",
    marginLeft: "10px",
    borderRadius: "24px",
    fontSize: "12px",
    textTransform: "uppercase"
  }

  const badgeStylesSecondary: React.CSSProperties = {
    backgroundColor: "#ffffff",
    color: props.color,
    border: "1px solid " + props.color,
    padding: "8px 12px",
    marginLeft: "10px",
    borderRadius: "24px",
    fontSize: "12px",
    textTransform: "uppercase"
  }
  
  return (
    <span style={props.type === "primary" ? badgeStylesPrimary : badgeStylesSecondary}>{props.text}</span>
  );
}

export default Badge;