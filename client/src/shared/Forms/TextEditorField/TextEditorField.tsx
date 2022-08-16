import ReactQuill from "react-quill";
import { DeltaStatic, Sources } from "quill";
import 'react-quill/dist/quill.snow.css';

type TextEditorFieldProps = {
  name: string
  id: string
  value: string
  label: string
  description?: string
  onChange: (name: string, value: string) => void
  testId?: string
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean']
  ],
}

function TextEditorField(props: TextEditorFieldProps) {
  const handleChange = (value: string, delta: DeltaStatic, source: Sources, editor: ReactQuill.UnprivilegedEditor) => {
    props.onChange(props.name, value);
  }

  return (
    <div className={"form-item col-12"} data-testid={props.testId}>
      <label htmlFor={props.id}>{props.label}</label>

      {props.description &&
        <p className="form-item-description">{props.description}</p>
      }

      <ReactQuill theme="snow" value={props.value} onChange={handleChange} modules={modules} />
    </div>
  );
}

export default TextEditorField;