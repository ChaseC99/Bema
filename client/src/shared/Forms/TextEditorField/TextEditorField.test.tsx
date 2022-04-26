import { screen } from "@testing-library/react";
import { renderWithRouter } from "../../../util/testing-utils";
import TextEditorField from "./TextEditorField";

test("renders the text editor correctly", () => {
  renderWithRouter(<TextEditorField name="test_editor" id="test-editor" value="<p>Sample starting value</p>" label="Test Field" onChange={jest.fn()} testId="test-editor" />);

  const editor = screen.getByTestId("test-editor");
  expect(editor.innerHTML).toMatch("test-editor");
  expect(editor.innerHTML).toMatch("<p>Sample starting value</p>");
  expect(editor.innerHTML).toMatch("Test Field");
});

test("renders the description section if a description is given", () => {
  renderWithRouter(<TextEditorField name="test_editor" id="test-editor" value="<p>Sample starting value</p>" label="Test Field" description="Sample field description" onChange={jest.fn()} testId="test-editor" />);

  const editor = screen.getByTestId("test-editor");
  expect(editor.innerHTML).toMatch("form-item-description");
  expect(editor.innerHTML).toMatch("Sample field description");
});

test("does not render the description section of a description is not given", () => {
  renderWithRouter(<TextEditorField name="test_editor" id="test-editor" value="<p>Sample starting value</p>" label="Test Field" onChange={jest.fn()} testId="test-editor" />);

  const editor = screen.getByTestId("test-editor");
  expect(editor.innerHTML).not.toMatch("form-item-description");
});