import { CSSProperties } from "react"

type ProgramEmbedProps = {
  programKaid: string
  height: number
  onLoad: () => void
  hidden?: boolean
}

function ProgramEmbed(props: ProgramEmbedProps) {
  const style: CSSProperties = {
    width: "100%",
    border: "none"
  }

  if (props.hidden) {
    style.display = "none";
  }

  return (
    <iframe onLoad={props.onLoad} src={"https://www.khanacademy.org/computer-programming/i/" + props.programKaid + "/embedded"} height={props.height + 68} style={style}></iframe>
  );
}

export default ProgramEmbed;