import { useEffect, useState } from "react";
import { FormFields } from "..";
import Button from "../../Button";
import CheckboxField from "../CheckboxField/CheckboxField";
import DateField from "../DateField/DateField";
import InputField from "../InputField/InputField";
import SelectField from "../SelectField/SelectField";
import TextAreaField from "../TextAreaField/TextAreaField";
import TextEditorField from "../TextEditorField/TextEditorField";
import "./Form.css";

type FormProps = {
  onSubmit: (values: { [name: string]: any }) => void
  onCancel?: () => void
  fields: FormFields[]
  submitLabel: string
  cols?: number
  testId?: string
}

function Form(props: FormProps) {
  const [values, setValues] = useState<{ [name: string]: any }>({});
  const [errors, setErrors] = useState<{ [name: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const newValues: { [name: string]: any } = {};
    const newErrors: { [name: string]: string } = {};

    props.fields.forEach((field) => {
      const value = field.defaultValue;
      newValues[field.name] = value;

      if (field.fieldType === "INPUT" && field.validate) {
        let e = field.validate(field.defaultValue || "");

        if (e) {
          newErrors[field.name] = e;
        }
      }
    });

    setValues(newValues);
    setErrors(newErrors);
    setIsLoading(false);
  }, [props.fields]);

  const handleChange = (name: string, value: any) => {
    const newValues = {
      ...values,
      [name]: value
    }

    setValues(newValues);

    // Check for data errors
    for (let i = 0; i < props.fields.length; i++) {
      const field = props.fields[i];

      if (field.name === name) {
        if (field.fieldType === "INPUT" && field.validate) {
          let e = field.validate(value);
          
          if (e === null) {
            e = "";
      
            const newErrors = {
              ...errors,
              [name]: e
            }
      
            delete newErrors[name];
            setErrors(newErrors);
          }
          else {
            const newErrors = {
              ...errors,
              [name]: e
            }
            setErrors(newErrors);
          }
        }

        break;
      }
    }
  }

  const handleSubmit = () => {
    props.onSubmit(values);
  }

  return (
    <div className="form" data-testid={props.testId}>
      <div className={"form-fields-wrapper" + (props.cols ? " col-"+props.cols : "")}>
        <div className="form-fields-container">
          {!isLoading && props.fields.map((field) => {
            if (field.fieldType === "INPUT") {
              return (
                <InputField
                  type={field.type}
                  name={field.name}
                  id={field.id}
                  size={field.size}
                  value={values[field.name]}
                  onChange={handleChange}
                  error={errors[field.name]}
                  label={field.label}
                  description={field.description}
                  required={field.required}
                  readonly={field.readonly}
                  placeholder={field.placeholder}
                  pattern={field.pattern}
                  autocomplete={field.autocomplete}
                  autofocus={field.autofocus}
                  disabled={field.disabled}
                  max={field.max}
                  maxlength={field.maxlength}
                  min={field.min}
                  minlength={field.minlength}
                  step={field.step}
                  testId={field.testId}
                  key={field.id}
                />
              );
            }
            else if (field.fieldType === "CHECKBOX") {
              return (
                <CheckboxField
                  name={field.name}
                  id={field.id}
                  value={values[field.name]}
                  size={field.size}
                  label={field.label}
                  description={field.description}
                  onChange={handleChange}
                  testId={field.testId}
                  key={field.id}
                />
              );
            }
            else if (field.fieldType === "TEXTAREA") {
              return (
                <TextAreaField
                  name={field.name}
                  id={field.id}
                  value={values[field.name]}
                  size={field.size}
                  label={field.label}
                  onChange={handleChange}
                  description={field.description}
                  rows={field.rows}
                  required={field.required}
                  testId={field.testId}
                  key={field.id}
                />
              );
            }
            else if (field.fieldType === "TEXTEDITOR") {
              return (
                <TextEditorField
                  name={field.name}
                  id={field.id}
                  value={values[field.name]}
                  label={field.label}
                  description={field.description}
                  onChange={handleChange}
                  testId={field.testId}
                  key={field.id}
                />
              );
            }
            else if (field.fieldType === "SELECT") {
              return (
                <SelectField
                  name={field.name}
                  id={field.id}
                  value={values[field.name]}
                  size={field.size}
                  label={field.label}
                  description={field.description}
                  choices={field.choices}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  testId={field.testId}
                  key={field.id}
                />
              );
            }
            else if (field.fieldType === "DATE") {
              return (
                <DateField
                  name={field.name}
                  id={field.id}
                  value={values[field.name]}
                  size={field.size}
                  label={field.label}
                  onChange={handleChange}
                  description={field.description}
                  minDate={field.minDate}
                  maxDate={field.maxDate}
                  testId={field.testId}
                  key={field.id}
                />
              );
            }

            return null;
          })}
        </div>
      </div>

      <div className="form-actions">
        {props.onCancel && <Button type="tertiary" role="button" action={props.onCancel} text="Cancel" testId={props.testId + "-cancel"} />}
        <Button type="primary" role="button" action={handleSubmit} text={props.submitLabel} testId={props.testId + "-submit"} disabled={Object.keys(errors).length > 0} />
      </div>
    </div>
  );
}

export default Form;