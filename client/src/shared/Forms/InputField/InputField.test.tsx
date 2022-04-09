import { screen } from "@testing-library/react";
import { renderWithRouter } from "../../../util/testing-utils";
import InputField from "./InputField";

test("renders the input field correctly", () => {
  const onChange = jest.fn();

  renderWithRouter(
    <InputField
      type="text"
      name="test-field"
      id="test-field"
      value=""
      onChange={onChange}
      size="SMALL"
      error={null}
      placeholder="enter value here"
      testId="test-field"
    />
  );

  const input = screen.getByTestId("test-field");
  expect(input.innerHTML).toMatch("test-field");
  expect(input.innerHTML).toMatch("input");
  expect(input.innerHTML).toMatch("enter value here");
});

test("renders the label section when given a label", () => {
  const onChange = jest.fn();

  renderWithRouter(
    <InputField
      type="text"
      name="test-field"
      id="test-field"
      value=""
      onChange={onChange}
      size="SMALL"
      error={null}
      label="Test Field"
      testId="test-field"
    />
  );

  const input = screen.getByTestId("test-field");
  expect(input.innerHTML).toMatch("Test Field");
});

test("does not render the label section when no label is given", () => {
  const onChange = jest.fn();

  renderWithRouter(
    <InputField
      type="text"
      name="test-field"
      id="test-field"
      value=""
      onChange={onChange}
      size="SMALL"
      error={null}
      testId="test-field"
    />
  );

  const input = screen.getByTestId("test-field");
  expect(input.innerHTML).not.toMatch("label");
});

test("renders the description section when a label and description are given", () => {
  const onChange = jest.fn();

  renderWithRouter(
    <InputField
      type="text"
      name="test-field"
      id="test-field"
      value=""
      onChange={onChange}
      size="SMALL"
      error={null}
      label="Test Field"
      description="Sample field description"
      testId="test-field"
    />
  );

  const input = screen.getByTestId("test-field");
  expect(input.innerHTML).toMatch("form-item-description");
  expect(input.innerHTML).toMatch("Sample field description");
});

test("does not render the description section when no description is given", () => {
  const onChange = jest.fn();

  renderWithRouter(
    <InputField
      type="text"
      name="test-field"
      id="test-field"
      value=""
      onChange={onChange}
      size="SMALL"
      error={null}
      label="Test Field"
      testId="test-field"
    />
  );

  const input = screen.getByTestId("test-field");
  expect(input.innerHTML).not.toMatch("form-item-description");
});

test("does not render the description section when no label is given", () => {
  const onChange = jest.fn();

  renderWithRouter(
    <InputField
      type="text"
      name="test-field"
      id="test-field"
      value=""
      onChange={onChange}
      size="SMALL"
      error={null}
      description="Sample field description"
      testId="test-field"
    />
  );

  const input = screen.getByTestId("test-field");
  expect(input.innerHTML).not.toMatch("form-item-description");
  expect(input.innerHTML).not.toMatch("Sample field description");
});

test("renders the error section when an error is given", () => {
  const onChange = jest.fn();

  renderWithRouter(
    <InputField
      type="text"
      name="test-field"
      id="test-field"
      value=""
      onChange={onChange}
      size="SMALL"
      error="Sample error message"
      testId="test-field"
    />
  );

  const input = screen.getByTestId("test-field");
  expect(input.innerHTML).toMatch("Sample error message");
});

test("does not render the error section when no error is given", () => {
  const onChange = jest.fn();

  renderWithRouter(
    <InputField
      type="text"
      name="test-field"
      id="test-field"
      value=""
      onChange={onChange}
      size="SMALL"
      error={null}
      testId="test-field"
    />
  );

  const input = screen.getByTestId("test-field");
  expect(input.innerHTML).not.toMatch("form-item-error");
});