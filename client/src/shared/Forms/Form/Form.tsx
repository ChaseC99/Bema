import { useEffect, useState } from "react";
import { FormFields } from "..";
import Button from "../../Button";
import CheckboxField from "../CheckboxField/CheckboxField";
import DateField from "../DateField/DateField";
import InputField from "../InputField/InputField";
import SelectField from "../SelectField/SelectField";
import SliderField from "../SliderField/SliderField";
import TextAreaField from "../TextAreaField/TextAreaField";
import TextEditorField from "../TextEditorField/TextEditorField";
import "./Form.css";

type FormProps = {
  onSubmit: (values: { [name: string]: any }) => void
  onCancel?: () => void
  fields: FormFields[]
  submitLabel: string
  cols?: number
  disabled?: boolean
  loading?: boolean
  testId?: string
}

type Error = {
  message: string
  isVisible: boolean
}

function Form(props: FormProps) {
  const [values, setValues] = useState<{ [name: string]: any }>({});
  const [errors, setErrors] = useState<{ [name: string]: Error }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const newValues: { [name: string]: any } = {};
    const newErrors: { [name: string]: Error } = {};

    props.fields.forEach((field) => {
      const value = field.defaultValue;
      newValues[field.name] = value;

      if ((field.fieldType === "INPUT" || field.fieldType === "TEXTAREA" || field.fieldType === "SELECT" || field.fieldType === "DATE") && field.required) {
        let e = requiredValidator(field.defaultValue || "");
        
        if (e) {
          newErrors[field.name] = {
            message: e,
            isVisible: false
          };
        }
      }
      
      if (field.fieldType === "INPUT" && field.validate) {
        let e = field.validate(field.defaultValue || "");

        if (e) {
          newErrors[field.name] = {
            message: e,
            isVisible: false
          };
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
        if ((field.fieldType === "INPUT" || field.fieldType === "TEXTAREA" || field.fieldType === "SELECT" || field.fieldType === "DATE") && field.required) {
          let e = requiredValidator(value);
          
          if (e === null) {
            e = "";
      
            const newErrors = {
              ...errors,
              [name]: {
                message: e,
                isVisible: true
              }
            }
      
            delete newErrors[name];
            setErrors(newErrors);
          }
          else {
            const newErrors = {
              ...errors,
              [name]: {
                message: e,
                isVisible: true
              }
            }
            setErrors(newErrors);
          }
        }

        if (field.fieldType === "INPUT" && field.validate) {
          let e = field.validate(value);
          
          if (e === null) {
            e = "";
      
            const newErrors = {
              ...errors,
              [name]: {
                message: e,
                isVisible: true
              }
            }
      
            delete newErrors[name];
            setErrors(newErrors);
          }
          else {
            const newErrors = {
              ...errors,
              [name]: {
                message: e,
                isVisible: true
              }
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

  const requiredValidator = (value: string): string | null => {
    if (value.length === 0) {
      return "This field is required";
    }

    return null;
  }

  return (
    <div className="form col-12" data-testid={props.testId}>
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
                  error={errors[field.name]?.isVisible ? errors[field.name].message : ""}
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
                  button={field.button}
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
                  disabled={field.disabled}
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
            else if (field.fieldType === "SLIDER") {
              return (
                <SliderField 
                  name={field.name}
                  id={field.id}
                  value={values[field.name]}
                  size={field.size}
                  label={field.label}
                  onChange={handleChange}
                  description={field.description}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  tickStep={field.tickStep}
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
        {props.onCancel && <Button type="tertiary" role="button" action={props.onCancel} text="Cancel" testId={props.testId + "-cancel"} disabled={props.loading} />}
        <Button type="primary" role="button" action={handleSubmit} text={props.submitLabel} testId={props.testId + "-submit"} disabled={Object.keys(errors).length > 0 || props.disabled} loading={props.loading} />
      </div>
    </div>
  );
}

export default Form;