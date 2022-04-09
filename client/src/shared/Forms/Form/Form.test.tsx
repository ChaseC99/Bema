import { fireEvent, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { FormFields } from "..";
import { renderWithRouter } from "../../../util/testing-utils";
import Form from "./Form";

test("renders an input field correctly", () => {
  const fields: FormFields[] = [
    {
      fieldType: "INPUT",
      type: "text",
      name: "field_one",
      id: "field-one",
      label: "Sample Field 1",
      defaultValue: "Value 1",
      size: "LARGE",
    }
  ];

  renderWithRouter(<Form onSubmit={jest.fn()} onCancel={jest.fn()} fields={fields} submitLabel="Save" testId="test-form" />);

  const form = screen.getByTestId("test-form");
  expect(form.innerHTML).toMatch("field_one");
  expect(form.innerHTML).toMatch("value=\"Value 1\"");
});

test("editing an input field updates the state", () => {
  const fields: FormFields[] = [
    {
      fieldType: "INPUT",
      type: "text",
      name: "field_one",
      id: "field-one",
      label: "Sample Field 1",
      defaultValue: "Value 1",
      size: "LARGE",
      testId: "field-one"
    }
  ];

  renderWithRouter(<Form onSubmit={jest.fn()} onCancel={jest.fn()} fields={fields} submitLabel="Save" testId="test-form" />);

  const input = screen.getByTestId("field-one-input");
  
  fireEvent.change(input, {target: {value: "New Value"}});
  
  expect(input.outerHTML).toMatch("value=\"New Value\"");
});

test("renders the submit button correctly", () => {
  const fields: FormFields[] = [
    {
      fieldType: "INPUT",
      type: "text",
      name: "field_one",
      id: "field-one",
      label: "Sample Field 1",
      defaultValue: "Value 1",
      size: "LARGE",
    }
  ];

  renderWithRouter(<Form onSubmit={jest.fn()} onCancel={jest.fn()} fields={fields} submitLabel="Save" testId="test-form" />);

  const btn = screen.getByTestId("test-form-submit");
  expect(btn.innerHTML).toMatch("Save");
});

test("clicking the submit button calls the submit handler", () => {
  const fields: FormFields[] = [
    {
      fieldType: "INPUT",
      type: "text",
      name: "field_one",
      id: "field-one",
      label: "Sample Field 1",
      defaultValue: "Value 1",
      size: "LARGE",
    }
  ];

  const handleSubmit = jest.fn();
  renderWithRouter(<Form onSubmit={handleSubmit} onCancel={jest.fn()} fields={fields} submitLabel="Save" testId="test-form" />);

  const btn = screen.getByTestId("test-form-submit");
  
  act(() => {
    btn.click();
  });

  expect(handleSubmit).toHaveBeenCalled();
});

test("clicking the cancel button calls the cancel handler", () => {
  const fields: FormFields[] = [
    {
      fieldType: "INPUT",
      type: "text",
      name: "field_one",
      id: "field-one",
      label: "Sample Field 1",
      defaultValue: "Value 1",
      size: "LARGE",
    }
  ];

  const handleCancel = jest.fn();
  renderWithRouter(<Form onSubmit={jest.fn()} onCancel={handleCancel} fields={fields} submitLabel="Save" testId="test-form" />);

  const btn = screen.getByTestId("test-form-cancel");
  
  act(() => {
    btn.click();
  });

  expect(handleCancel).toHaveBeenCalled();
});

test("disables the submit button when there is at least one error", () => {
  const validator = (value: string) => {
    if (value.length < 5) {
      return "Input is too short";
    }
    return null;
  }

  const fields: FormFields[] = [
    {
      fieldType: "INPUT",
      type: "text",
      name: "field_one",
      id: "field-one",
      label: "Sample Field 1",
      defaultValue: "",
      validate: validator,
      size: "LARGE",
    }
  ];

  renderWithRouter(<Form onSubmit={jest.fn()} onCancel={jest.fn()} fields={fields} submitLabel="Save" testId="test-form" />);

  const btn = screen.getByTestId("test-form-submit") as HTMLButtonElement;
  expect(btn.disabled).toBe(true);
});