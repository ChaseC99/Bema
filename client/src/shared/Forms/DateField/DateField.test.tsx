import { screen } from "@testing-library/react";
import { renderWithRouter } from "../../../util/testing-utils";
import DateField from "./DateField";

test("renders the date field correctly", () => {
  renderWithRouter(<DateField name="test_date_field" id="test-date-field" size="LARGE" value="4/13/2022, 12:00:00 AM" label="Test Field" onChange={jest.fn()} testId="test-date-field" />);

  const dateField = screen.getByTestId("test-date-field");
  expect(dateField.innerHTML).toMatch("test-date-field");
  expect(dateField.innerHTML).toMatch("4/13/2022");
  expect(dateField.innerHTML).toMatch("Test Field");
});

test("renders the description section if a description is given", () => {
  renderWithRouter(<DateField name="test_date_field" id="test-date-field" size="LARGE" value="4/13/2022, 12:00:00 AM" label="Test Field" description="Sample field description" onChange={jest.fn()} testId="test-date-field" />);

  const dateField = screen.getByTestId("test-date-field");
  expect(dateField.innerHTML).toMatch("form-item-description");
  expect(dateField.innerHTML).toMatch("Sample field description");
});

test("does not render the description section of a description is not given", () => {
  renderWithRouter(<DateField name="test_date_field" id="test-date-field" size="LARGE" value="4/13/2022, 12:00:00 AM" label="Test Field" onChange={jest.fn()} testId="test-date-field" />);

  const dateField = screen.getByTestId("test-date-field");
  expect(dateField.innerHTML).not.toMatch("form-item-description");
});