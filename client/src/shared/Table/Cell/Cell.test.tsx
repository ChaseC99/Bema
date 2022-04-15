import { screen } from "@testing-library/react";
import useAppState from "../../../state/useAppState";
import { defaultAppStateLoggedIn, defaultAppStateLoggedOut, renderWithRouter } from "../../../util/testing-utils";
import Cell from "./Cell";

jest.mock("../../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

test("renders a header cell correctly", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<Cell header testId="test-cell">Sample Data</Cell>);

  const cell = screen.getByTestId("test-cell");
  expect(cell.outerHTML).toMatch("th");
  expect(cell.innerHTML).toMatch("Sample Data");
});

test("renders a body cell correctly", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<Cell testId="test-cell">Sample Data</Cell>);

  const cell = screen.getByTestId("test-cell");
  expect(cell.outerHTML).toMatch("td");
  expect(cell.innerHTML).toMatch("Sample Data");
});

test("always renders the cell for admin users", () => {
  let s = defaultAppStateLoggedIn();
  s.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: s
  });

  renderWithRouter(<Cell header permissions={["view_all_users"]} testId="test-cell">Sample Data</Cell>);

  const cell = screen.queryByTestId("test-cell");
  expect(cell).toBeInTheDocument();
});

test("renders the cell for users with one of the required permissions", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ view_all_users: true })
  });

  renderWithRouter(<Cell header permissions={["view_all_users"]} testId="test-cell">Sample Data</Cell>);

  const cell = screen.queryByTestId("test-cell");
  expect(cell).toBeInTheDocument();
});

test("does not render the cell for users with none of the required permissions", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<Cell header permissions={["view_all_users"]} testId="test-cell">Sample Data</Cell>);

  const cell = screen.queryByTestId("test-cell");
  expect(cell).not.toBeInTheDocument();
});

test("renders the cell when a user has all required permissions", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ view_all_users: true, edit_contests: true })
  });

  renderWithRouter(<Cell header permissions={["view_all_users", "edit_contests"]} requireAllPermissions testId="test-cell">Sample Data</Cell>);

  const cell = screen.queryByTestId("test-cell");
  expect(cell).toBeInTheDocument();
});

test("does not render the cell when a user does not have all of the required permissions", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ view_all_users: true })
  });

  renderWithRouter(<Cell header permissions={["view_all_users", "edit_contests"]} requireAllPermissions testId="test-cell">Sample Data</Cell>);

  const cell = screen.queryByTestId("test-cell");
  expect(cell).not.toBeInTheDocument();
});

test("does not render a cell with permissions required when a user is not logged in", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<Cell header permissions={["view_all_users"]} testId="test-cell">Sample Data</Cell>);

  const cell = screen.queryByTestId("test-cell");
  expect(cell).not.toBeInTheDocument();
});