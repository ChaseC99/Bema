import { screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import useAppState from "../../state/useAppState";
import { defaultAppStateLoggedIn, defaultAppStateLoggedOut, renderWithRouter } from "../../util/testing-utils";
import WinnersCard from "./WinnersCard";

jest.mock("../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

const winners = [
  {
    entry_author: "Test User 1",
    entry_id: 100,
    entry_level: "Beginner",
    entry_title: "Test Entry 1",
    entry_url: ""
  },
  {
    entry_author: "Test User 2",
    entry_id: 101,
    entry_level: "Advanced",
    entry_title: "Test Entry 2",
    entry_url: ""
  }
];

test("renders the card correctly", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<WinnersCard winners={winners} handleRemoveWinner={jest.fn()} />);

  const table = screen.getByTestId("winners-table-body");

  expect(table.innerHTML).toMatch("Test User 1");
  expect(table.innerHTML).toMatch("Beginner");
  expect(table.innerHTML).toMatch("Test Entry 1");
  expect(table.innerHTML).toMatch("Test User 2");
  expect(table.innerHTML).toMatch("Advanced");
  expect(table.innerHTML).toMatch("Test Entry 2");
});

test("renders the action menu for admin users", () => {
  let s = defaultAppStateLoggedIn();
  s.is_admin = true;

  useAppStateMock.mockReturnValue({
    state: s
  });

  renderWithRouter(<WinnersCard winners={winners} handleRemoveWinner={jest.fn()} />);

  const actions = screen.queryByTestId("winner-action-100");
  expect(actions).toBeInTheDocument();
});

test("renders the action menu for users who can manage winners", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ manage_winners: true })
  });

  renderWithRouter(<WinnersCard winners={winners} handleRemoveWinner={jest.fn()} />);

  const actions = screen.queryByTestId("winner-action-100");
  expect(actions).toBeInTheDocument();
});

test("does not render the action menu for standard users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<WinnersCard winners={winners} handleRemoveWinner={jest.fn()} />);

  const actions = screen.queryByTestId("winner-action-100");
  expect(actions).not.toBeInTheDocument();
});

test("does not render the action menu for logged out users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<WinnersCard winners={winners} handleRemoveWinner={jest.fn()} />);

  const actions = screen.queryByTestId("winner-action-100");
  expect(actions).not.toBeInTheDocument();
});

test("clicking the remove action calls the remove handler", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ manage_winners: true })
  });

  const handleRemoveWinner = jest.fn();
  renderWithRouter(<WinnersCard winners={winners} handleRemoveWinner={handleRemoveWinner} />);

  const removeBtn = screen.queryByTestId("winner-action-100-remove");

  act(() => {
    removeBtn?.click();
  });

  expect(handleRemoveWinner).toHaveBeenCalled();
});