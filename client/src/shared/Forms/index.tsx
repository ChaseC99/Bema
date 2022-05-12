import Form from "./Form/Form";

export { Form };

/*
 * Defines the list of end-user field types. When adding a new field type, make sure that
 * it has a unique fieldType property. The Form component uses these values as props to render
 * the internal implementations of these fields, which may or may not have different properties
 * that are not visible to the end-user (front-end programmer).
 */

export type FormFields =
  InputField
  | CheckboxField
  | TextAreaField
  | TextEditorField
  | SelectField
  | DateField
  | SliderField

export type InputField = {
  fieldType: "INPUT"
  type: "email" | "number" | "password" | "text"
  name: string
  id: string
  size: "SMALL" | "MEDIUM" | "LARGE"
  validate?: (value: string) => string | null
  label: string
  defaultValue: string
  description?: string
  required?: boolean
  readonly?: boolean
  placeholder?: string
  pattern?: string
  autocomplete?: boolean
  autofocus?: boolean
  disabled?: boolean
  max?: number
  maxlength?: number
  min?: number
  minlength?: number
  step?: number
  button?: {
    text: string
    action: () => void
  }
  testId?: string
}

export type CheckboxField = {
  fieldType: "CHECKBOX"
  name: string
  id: string
  defaultValue: boolean
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  description?: string
  disabled?: boolean
  testId?: string
}

export type TextAreaField = {
  fieldType: "TEXTAREA"
  name: string
  id: string
  defaultValue: string
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  description?: string
  rows?: number
  required?: boolean
  testId?: string
}

export type TextEditorField = {
  fieldType: "TEXTEDITOR"
  name: string
  id: string
  defaultValue: string
  label: string
  description?: string
  testId?: string
}

export type SelectField = {
  fieldType: "SELECT"
  name: string
  id: string
  defaultValue: any
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  placeholder?: string
  choices: ({ text: string, value: any })[]
  description?: string
  disabled?: boolean
  required?: boolean
  testId?: string
}

export type DateField = {
  fieldType: "DATE"
  name: string
  id: string
  defaultValue: string
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  description?: string
  minDate?: string
  maxDate?: string
  required?: boolean
  testId?: string
}

export type SliderField = {
  fieldType: "SLIDER"
  name: string
  id: string
  defaultValue: number
  size: "SMALL" | "MEDIUM" | "LARGE"
  label: string
  description?: string
  min: number
  max: number
  step: number
  tickStep: number
  testId?: string
}