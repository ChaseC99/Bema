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
      label="Test Field"
      placeholder="enter value here"
      testId="test-field"
    />
  );

  const input = screen.getByTestId("test-field");
  expect(input.innerHTML).toMatch("test-field");
  expect(input.innerHTML).toMatch("input");
  expect(input.innerHTML).toMatch("Test Field");
  expect(input.innerHTML).toMatch("enter value here");
});

test("renders the description section when a description are given", () => {
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
      label="Test Field"
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
      label="Test Field"
      testId="test-field"
    />
  );

  const input = screen.getByTestId("test-field");
  expect(input.innerHTML).not.toMatch("form-item-error");
});