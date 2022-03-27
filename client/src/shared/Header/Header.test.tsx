import { screen } from '@testing-library/react';
import Header from "./Header";
import useAppState from '../../state/useAppState';
import { defaultAppStateLoggedIn, defaultAppStateLoggedOut, renderWithRouter } from '../../util/testing-utils';

jest.mock("../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

test("renders logo", () => {

  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<Header />);
  
  const logoIcon = screen.getByTestId("logo-icon");
  expect(logoIcon).toBeInTheDocument();

  const logoText = screen.getByTestId("logo-text");
  expect(logoText).toBeInTheDocument();
  expect(logoText.innerHTML).toBe("Bema");
});

test("shows correct nav links when logged out", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<Header />);

  const dashboard: HTMLAnchorElement = screen.getByTestId("/admin/dashboard");
  expect(dashboard).toBeInTheDocument();
  expect(dashboard.href).toMatch("/admin/dashboard");

  const judge: HTMLAnchorElement = screen.getByTestId("/judging");
  expect(judge).toBeInTheDocument();
  expect(judge.href).toMatch("/judging");

  const resources: HTMLAnchorElement = screen.getByTestId("/kb");
  expect(resources).toBeInTheDocument();
  expect(resources.href).toMatch("/kb");

  const login: HTMLAnchorElement = screen.getByTestId("/login");
  expect(login).toBeInTheDocument();
  expect(login.href).toMatch("/login");

  const navlinks = screen.getByTestId("nav-links");
  expect(navlinks.innerHTML).not.toMatch("Profile");
  expect(navlinks.innerHTML).not.toMatch("Logout");
});

test("shows correct nav links when logged in", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<Header />);

  const dashboard: HTMLAnchorElement = screen.getByTestId("/admin/dashboard");
  expect(dashboard).toBeInTheDocument();
  expect(dashboard.href).toMatch("/admin/dashboard");

  const resources: HTMLAnchorElement = screen.getByTestId("/kb");
  expect(resources).toBeInTheDocument();
  expect(resources.href).toMatch("/kb");

  const profile: HTMLAnchorElement = screen.getByTestId("/evaluator");
  expect(profile).toBeInTheDocument();
  expect(profile.href).toMatch("/evaluator/10");

  const logout: HTMLAnchorElement = screen.getByTestId("/logout");
  expect(logout).toBeInTheDocument();
  expect(logout.href).toMatch("/logout");

  const navlinks = screen.getByTestId("nav-links");
  expect(navlinks.innerHTML).not.toMatch("Judge");
  expect(navlinks.innerHTML).not.toMatch("Login");
});

test("shows judging link for judges", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ judge_entries: true })
  });

  renderWithRouter(<Header />);

  const judge: HTMLAnchorElement = screen.getByTestId("/judging");
  expect(judge).toBeInTheDocument();
  expect(judge.href).toMatch("/judging");
})