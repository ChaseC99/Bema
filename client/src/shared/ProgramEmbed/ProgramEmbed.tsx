type ProgramEmbedProps = {
  programKaid: string
  height: number
  onLoad: () => void
}

function ProgramEmbed(props: ProgramEmbedProps) {
  return (
    <iframe onLoad={props.onLoad} src={"https://www.khanacademy.org/computer-programming/i/" + props.programKaid + "/embedded"} height={props.height + 68} style={{width: "100%", border: "none"}}></iframe>
  );
}

export default ProgramEmbed;