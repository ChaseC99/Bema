import { screen } from "@testing-library/react";
import useAppState from "../../state/useAppState";
import { defaultAppStateLoggedIn, defaultAppStateLoggedOut, renderWithRouter } from "../../util/testing-utils";
import ContestCard from "./ContestCard";

const contest = {
  badge_image_url: null,
  badge_name: null,
  contest_author: null,
  contest_id: 1,
  contest_name: "Test Contest",
  contest_url: "test-url",
  current: false,
  date_end: "test-date-end",
  date_start: "test-date-start",
  voting_enabled: null
}

jest.mock("../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

test("renders the card correctly", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<ContestCard contest={contest} handleEditContest={jest.fn()} handleDeleteContest={jest.fn()} testId="test-card" />);

  const card = screen.getByTestId("test-card");
  expect(card.innerHTML).toMatch("Test Contest");
  expect(card.innerHTML).toMatch("test-date-start");
  expect(card.innerHTML).toMatch("test-date-end");
  expect(card.innerHTML).not.toMatch("Evaluations");
});

test("renders the evaluations link for logged in users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<ContestCard contest={contest} handleEditContest={jest.fn()} handleDeleteContest={jest.fn()} testId="test-card" />);

  const card = screen.getByTestId("test-card");
  expect(card.innerHTML).toMatch("Evaluations");
});

test("renders the edit action for contest editors", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ edit_contests: true })
  });

  renderWithRouter(<ContestCard contest={contest} handleEditContest={jest.fn()} handleDeleteContest={jest.fn()} testId="test-card" />);

  const action = screen.queryByTestId("edit-contest-action");
  expect(action).toBeInTheDocument();
});

test("renders the edit action for admin users", () => {
  let s = defaultAppStateLoggedIn();
  s.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: s
  });

  renderWithRouter(<ContestCard contest={contest} handleEditContest={jest.fn()} handleDeleteContest={jest.fn()} testId="test-card" />);

  const action = screen.queryByTestId("edit-contest-action");
  expect(action).toBeInTheDocument();
});

test("does not render the edit action for default users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<ContestCard contest={contest} handleEditContest={jest.fn()} handleDeleteContest={jest.fn()} testId="test-card" />);

  const action = screen.queryByTestId("edit-contest-action");
  expect(action).not.toBeInTheDocument();
});

test("renders the delete action for contest deleters", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ delete_contests: true })
  });

  renderWithRouter(<ContestCard contest={contest} handleEditContest={jest.fn()} handleDeleteContest={jest.fn()} testId="test-card" />);

  const action = screen.queryByTestId("delete-contest-action");
  expect(action).toBeInTheDocument();
});

test("renders the delete action for admin users", () => {
  let s = defaultAppStateLoggedIn();
  s.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: s
  });

  renderWithRouter(<ContestCard contest={contest} handleEditContest={jest.fn()} handleDeleteContest={jest.fn()} testId="test-card" />);

  const action = screen.queryByTestId("delete-contest-action");
  expect(action).toBeInTheDocument();
});

test("does not render the delete action for default users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<ContestCard contest={contest} handleEditContest={jest.fn()} handleDeleteContest={jest.fn()} testId="test-card" />);

  const action = screen.queryByTestId("delete-contest-action");
  expect(action).not.toBeInTheDocument();
});

test("renders no actions for logged out users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<ContestCard contest={contest} handleEditContest={jest.fn()} handleDeleteContest={jest.fn()} testId="test-card" />);

  const editAction = screen.queryByTestId("edit-contest-action");
  expect(editAction).not.toBeInTheDocument();

  const deleteAction = screen.queryByTestId("delete-contest-action");
  expect(deleteAction).not.toBeInTheDocument();
});