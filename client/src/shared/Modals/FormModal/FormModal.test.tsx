import { act, render, screen } from '@testing-library/react';
import { renderWithRouter } from '../../../util/testing-utils';
import { FormFields } from '../../Forms';
import FormModal from "./FormModal";

const fields: FormFields[] = [
  {
    fieldType: "INPUT",
    type: "text",
    name: "field_one",
    id: "field-one",
    label: "Sample Field 1",
    defaultValue: "Value 1",
    size: "LARGE",
  },
  {
    fieldType: "INPUT",
    type: "text",
    name: "field_two",
    id: "field-two",
    label: "Sample Field 2",
    defaultValue: "Value 2",
    size: "LARGE",
  }
];

test("renders the modal correctly", () => {
  const submitHandler = jest.fn();
  const cancelHandler = jest.fn();
  renderWithRouter(
    <FormModal
      title="Sample Form"
      submitLabel="Save"
      handleSubmit={submitHandler}
      handleCancel={cancelHandler}
      fields={fields}
      testId={"test-modal"}
    />
  );

  const modal = screen.getByTestId("test-modal");
  expect(modal.innerHTML).toMatch("Sample Form");
  expect(modal.innerHTML).toMatch("Save");
  expect(modal.innerHTML).toMatch("field_one");
  expect(modal.innerHTML).toMatch("field_two");
});

test("clicking the close button calls the cancel handler", () => {
  const submitHandler = jest.fn();
  const cancelHandler = jest.fn();
  renderWithRouter(
    <FormModal
      title="Sample Form"
      submitLabel="Save"
      handleSubmit={submitHandler}
      handleCancel={cancelHandler}
      fields={fields}
      testId={"test-modal"}
    />
  );

  const closeBtn = screen.getByTestId("test-modal-close");
  act(() => {
    closeBtn.click();
  });

  expect(cancelHandler).toHaveBeenCalled();
});

test("clicking the cancel button calls the cancel handler", () => {
  const submitHandler = jest.fn();
  const cancelHandler = jest.fn();
  renderWithRouter(
    <FormModal
      title="Sample Form"
      submitLabel="Save"
      handleSubmit={submitHandler}
      handleCancel={cancelHandler}
      fields={fields}
      testId={"test-modal"}
    />
  );

  const cancelBtn = screen.getByTestId("test-modal-form-cancel");
  act(() => {
    cancelBtn.click();
  });

  expect(cancelHandler).toHaveBeenCalled();
});

test("clicking the submit button calls the submit handler", () => {
  const submitHandler = jest.fn();
  const cancelHandler = jest.fn();
  renderWithRouter(
    <FormModal
      title="Sample Form"
      submitLabel="Save"
      handleSubmit={submitHandler}
      handleCancel={cancelHandler}
      fields={fields}
      testId={"test-modal"}
    />
  );

  const submitBtn = screen.getByTestId("test-modal-form-submit");
  act(() => {
    submitBtn.click();
  });

  expect(submitHandler).toHaveBeenCalled();
});