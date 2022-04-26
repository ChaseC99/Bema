import { act, screen } from "@testing-library/react";
import { renderWithRouter } from "../../../util/testing-utils";
import InfoModal from "./InfoModal";

test("renders the modal correctly", () => {
  renderWithRouter(
    <InfoModal title="Test Modal" handleClose={jest.fn()} testId="info-modal">
      <p>Test body content</p>
    </InfoModal>
  );

  const modal = screen.getByTestId("info-modal");
  expect(modal.innerHTML).toMatch("Test Modal");
  expect(modal.innerHTML).toMatch("<p>Test body content</p>");
});

test("clicking the close button calls the close handler", () => {
  const handleClose = jest.fn();
  renderWithRouter(
    <InfoModal title="Test Modal" handleClose={handleClose} testId="info-modal">
      <p>Test body content</p>
    </InfoModal>
  );

  const closeBtn = screen.getByTestId("info-modal-close");

  act(() => {
    closeBtn.click();
  });

  expect(handleClose).toHaveBeenCalled();
});