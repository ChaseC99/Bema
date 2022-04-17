import { fireEvent, screen } from "@testing-library/react";
import { renderWithRouter } from "../../../util/testing-utils";
import TextAreaField from "./TextAreaField";

test("renders the textarea correctly", () => {
    renderWithRouter(<TextAreaField name="test_textarea" id="test-textarea" value="Starting value" size="LARGE" label="Test Field" onChange={jest.fn()} testId="test-field" />);

    const field = screen.getByTestId("test-field");
    expect(field.innerHTML).toMatch("test-textarea");
    expect(field.innerHTML).toMatch("test_textarea");
    expect(field.innerHTML).toMatch("Starting value");
    expect(field.innerHTML).toMatch("Test Field");
});

test("renders the description section when given a description", () => {
    renderWithRouter(<TextAreaField name="test_textarea" id="test-textarea" value="Starting value" size="LARGE" label="Test Field" description="Sample description" onChange={jest.fn()} testId="test-field" />);

    const field = screen.getByTestId("test-field");
    expect(field.innerHTML).toMatch("Sample description");
});

test("does not render the description section when no description is given", () => {
    renderWithRouter(<TextAreaField name="test_textarea" id="test-textarea" value="Starting value" size="LARGE" label="Test Field" onChange={jest.fn()} testId="test-field" />);

    const field = screen.getByTestId("test-field");
    expect(field.innerHTML).not.toMatch("form-item-description");
});

test("calls the change handler when the textarea content is changed", () => {
    const changeHandler = jest.fn();
    renderWithRouter(<TextAreaField name="test_textarea" id="test-textarea" value="Starting value" size="LARGE" label="Test Field" onChange={changeHandler} testId="test-field" />);

    const field = screen.getByTestId("test-field-input");
    
    fireEvent.change(field, {target: {value: "New textarea content"}});
    
    expect(changeHandler).toHaveBeenCalled();
});