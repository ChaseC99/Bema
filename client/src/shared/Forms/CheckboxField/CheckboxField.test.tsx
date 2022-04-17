import { screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { renderWithRouter } from "../../../util/testing-utils";
import CheckboxField from "./CheckboxField";

test("renders the checkbox correctly", () => {
    renderWithRouter(<CheckboxField name="test_checkbox" id="test-checkbox" value={false} onChange={jest.fn()} size="LARGE" label="Test Checkbox" testId="test-checkbox" />);

    const checkbox = screen.getByTestId("test-checkbox");
    expect(checkbox.innerHTML).toMatch("test_checkbox");
    expect(checkbox.innerHTML).toMatch("test-checkbox");
    expect(checkbox.innerHTML).toMatch("Test Checkbox");
});

test("displays the checkmark svg when checked", () => {
    renderWithRouter(<CheckboxField name="test_checkbox" id="test-checkbox" value={true} onChange={jest.fn()} size="LARGE" label="Test Checkbox" testId="test-checkbox" />);

    const checkbox = screen.getByTestId("test-checkbox");
    expect(checkbox.innerHTML).toMatch("svg");
});

test("does not display the checkmark svg when not checked", () => {
    renderWithRouter(<CheckboxField name="test_checkbox" id="test-checkbox" value={false} onChange={jest.fn()} size="LARGE" label="Test Checkbox" testId="test-checkbox" />);

    const checkbox = screen.getByTestId("test-checkbox");
    expect(checkbox.innerHTML).not.toMatch("svg");
});

test("displays the description section when given a description", () => {
    renderWithRouter(<CheckboxField name="test_checkbox" id="test-checkbox" value={false} onChange={jest.fn()} size="LARGE" label="Test Checkbox" description="Sample description" testId="test-checkbox" />);

    const checkbox = screen.getByTestId("test-checkbox");
    expect(checkbox.innerHTML).toMatch("form-item-description");
    expect(checkbox.innerHTML).toMatch("Sample description");
});

test("does not display the description section when no description is given", () => {
    renderWithRouter(<CheckboxField name="test_checkbox" id="test-checkbox" value={false} onChange={jest.fn()} size="LARGE" label="Test Checkbox" testId="test-checkbox" />);

    const checkbox = screen.getByTestId("test-checkbox");
    expect(checkbox.innerHTML).not.toMatch("form-item-description");
});

test("calls the change handler when the checkbox is clicked", () => {
    const changeHandler = jest.fn();
    renderWithRouter(<CheckboxField name="test_checkbox" id="test-checkbox" value={false} onChange={changeHandler} size="LARGE" label="Test Checkbox" testId="test-checkbox" />);

    const checkbox = screen.getByTestId("test-checkbox-input");

    act(() => {
        checkbox.click();
    });

    expect(changeHandler).toHaveBeenCalled();
});