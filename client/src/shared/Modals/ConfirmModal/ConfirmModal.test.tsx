import { act, screen } from '@testing-library/react';
import { renderWithRouter } from '../../../util/testing-utils';
import ConfirmModal from "./ConfirmModal";

test("renders the modal correctly", () => {
  renderWithRouter(
    <ConfirmModal title="Modal Title" confirmLabel="OK" handleConfirm={jest.fn()} handleCancel={jest.fn()} testId="test-modal">
      <p>My modal body content.</p>
    </ConfirmModal>
  );

  const modal = screen.getByTestId("test-modal");
  expect(modal.innerHTML).toMatch("Modal Title");
  expect(modal.innerHTML).toMatch("OK");
  expect(modal.innerHTML).toMatch("My modal body content.");
});

test("renders modals with destructive actions correctly", () => {
  renderWithRouter(
    <ConfirmModal title="Modal Title" confirmLabel="OK" handleConfirm={jest.fn()} handleCancel={jest.fn()} destructive testId="test-modal">
      <p>My modal body content.</p>
    </ConfirmModal>
  );

  const modal = screen.getByTestId("test-modal");
  expect(modal.innerHTML).toMatch("btn-destructive-primary");
});

test("clicking the close button calls the cancel handler", () => {
  const cancelHandler = jest.fn();
  renderWithRouter(
    <ConfirmModal title="Modal Title" confirmLabel="OK" handleConfirm={jest.fn()} handleCancel={cancelHandler} destructive testId="test-modal">
      <p>My modal body content.</p>
    </ConfirmModal>
  );

  const closeBtn = screen.getByTestId("test-modal-close");
  act(() => {
    closeBtn.click();
  });

  expect(cancelHandler).toHaveBeenCalled();
});

test("clicking the cancel button calls the cancel handler", () => {
  const cancelHandler = jest.fn();
  renderWithRouter(
    <ConfirmModal title="Modal Title" confirmLabel="OK" handleConfirm={jest.fn()} handleCancel={cancelHandler} destructive testId="test-modal">
      <p>My modal body content.</p>
    </ConfirmModal>
  );

  const cancelBtn = screen.getByTestId("test-modal-cancel");
  act(() => {
    cancelBtn.click();
  });

  expect(cancelHandler).toHaveBeenCalled();
});

test("clicking the confirm button calls the confirm handler", () => {
  const confirmHandler = jest.fn();
  renderWithRouter(
    <ConfirmModal title="Modal Title" confirmLabel="OK" handleConfirm={confirmHandler} handleCancel={jest.fn()} destructive testId="test-modal">
      <p>My modal body content.</p>
    </ConfirmModal>
  );

  const confirmBtn = screen.getByTestId("test-modal-confirm");
  act(() => {
    confirmBtn.click();
  });

  expect(confirmHandler).toHaveBeenCalled();
});