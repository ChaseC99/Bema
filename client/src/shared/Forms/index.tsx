import Form from "./Form/Form";

export { Form };

export type FormFields = InputField | SelectField

export type InputField = {
    fieldType: "INPUT"
    type: "email" | "number" | "password" | "text"
    name: string
    id: string
    size: "SMALL" | "MEDIUM" | "LARGE"
    validate?: (value: string) => string | null
    label?: string
    description?: string
    defaultValue?: string
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
    testId?: string
}

export type SelectField = {
    fieldType: "SELECT"
    id: string
    name: string
    defaultValue?: string
}