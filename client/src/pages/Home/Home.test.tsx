import { screen } from '@testing-library/react';
import useAppState from '../../state/useAppState';
import { defaultAppStateLoggedIn, defaultAppStateLoggedOut, renderWithRouter } from '../../util/testing-utils';
import Home from "./Home";

jest.mock("../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>; 

test("renders the announcements section", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<Home />);

  const section = screen.queryByTestId("announcement-header");
  expect(section).toBeInTheDocument();
});

test("renders the tasks section when logged in", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<Home />);

  const section = screen.queryByTestId("my-tasks-header");
  expect(section).toBeInTheDocument();
});

test("does not render the tasks section when logged out", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<Home />);

  const section = screen.queryByTestId("my-tasks-header");
  expect(section).not.toBeInTheDocument();
});