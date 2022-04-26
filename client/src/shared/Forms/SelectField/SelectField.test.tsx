import { screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { renderWithRouter } from "../../../util/testing-utils";
import SelectField from "./SelectField";

const choices = [
  {
    value: "1",
    text: "Choice 1"
  },
  {
    value: "2",
    text: "Choice 2"
  },
  {
    value: "3",
    text: "Choice 3"
  }
];

test("renders the select field correctly", () => {
  renderWithRouter(<SelectField name="test_select" id="test-select" value="" size="LARGE" label="Test Field" choices={choices} onChange={jest.fn()} testId="test-select" />);

  const select = screen.getByTestId("test-select");
  expect(select.innerHTML).toMatch("test-select");
  expect(select.innerHTML).toMatch("Test Field");
});

test("renders the description section when a description is provided", () => {
  renderWithRouter(<SelectField name="test_select" id="test-select" value="" size="LARGE" label="Test Field" description="Sample description" choices={choices} onChange={jest.fn()} testId="test-select" />);

  const select = screen.getByTestId("test-select");
  expect(select.innerHTML).toMatch("Sample description");
});

test("does not the description section when no description is provided", () => {
  renderWithRouter(<SelectField name="test_select" id="test-select" value="" size="LARGE" label="Test Field" choices={choices} onChange={jest.fn()} testId="test-select" />);

  const select = screen.getByTestId("test-select");
  expect(select.innerHTML).not.toMatch("form-item-description");
});

test("renders the default placeholder if no placeholder or value is provided", () => {
  renderWithRouter(<SelectField name="test_select" id="test-select" value="" size="LARGE" label="Test Field" choices={choices} onChange={jest.fn()} testId="test-select" />);

  const select = screen.getByTestId("test-select");
  expect(select.innerHTML).toMatch("Select a value");
});

test("renders the placeholder if given a placeholder and no value is provided", () => {
  renderWithRouter(<SelectField name="test_select" id="test-select" value="" placeholder="Sample Placeholder" size="LARGE" label="Test Field" choices={choices} onChange={jest.fn()} testId="test-select" />);

  const select = screen.getByTestId("test-select");
  expect(select.innerHTML).toMatch("Sample Placeholder");
  expect(select.innerHTML).not.toMatch("Select a value");
});

test("renders the selected value if a value is provided", () => {
  renderWithRouter(<SelectField name="test_select" id="test-select" value="1" placeholder="Sample Placeholder" size="LARGE" label="Test Field" choices={choices} onChange={jest.fn()} testId="test-select" />);

  const select = screen.getByTestId("test-select");
  expect(select.innerHTML).toMatch("Choice 1");
  expect(select.innerHTML).not.toMatch("Sample Placeholder");
  expect(select.innerHTML).not.toMatch("Select a value");
});

test("hides the select choices by default", () => {
  renderWithRouter(<SelectField name="test_select" id="test-select" value="" size="LARGE" label="Test Field" choices={choices} onChange={jest.fn()} testId="test-select" />);

  const select = screen.getByTestId("test-select");
  expect(select.innerHTML).not.toMatch("Choice 1");
});

test("clicking the select dropdown shows the select choices", () => {
  renderWithRouter(<SelectField name="test_select" id="test-select" value="" size="LARGE" label="Test Field" choices={choices} onChange={jest.fn()} testId="test-select" />);

  const select = screen.getByTestId("test-select");
  const btn = screen.getByTestId("test-select-button");

  act(() => {
    btn.click();
  });

  expect(select.innerHTML).toMatch("Choice 1");
  expect(select.innerHTML).toMatch("Choice 2");
  expect(select.innerHTML).toMatch("Choice 3");
});

test("clicking a select choice calls the change handler", async () => {
  const changeHandler = jest.fn();
  renderWithRouter(<SelectField name="test_select" id="test-select" value="" size="LARGE" label="Test Field" choices={choices} onChange={changeHandler} testId="test-select" />);

  const select = screen.getByTestId("test-select");
  const btn = screen.getByTestId("test-select-button");

  act(() => {
    btn.click();
  });

  const choicesContainer = screen.getByTestId("test-select-choices");
  
  act(() => {
    const choice = choicesContainer?.firstChild as HTMLDivElement;
    choice.click();
  });

  expect(changeHandler).toHaveBeenCalled();
});

test("clicking a select choice hides the select choices", () => {
  const changeHandler = jest.fn();
  renderWithRouter(<SelectField name="test_select" id="test-select" value="" size="LARGE" label="Test Field" choices={choices} onChange={changeHandler} testId="test-select" />);

  const select = screen.getByTestId("test-select");
  const btn = screen.getByTestId("test-select-button");

  act(() => {
    btn.click();
  });

  const choicesContainer = screen.getByTestId("test-select-choices");
  
  act(() => {
    const choice = choicesContainer?.firstChild as HTMLDivElement;
    choice.click();
  });

  expect(select.innerHTML).not.toMatch("Choice 2");
  expect(select.innerHTML).not.toMatch("Choice 3");
});