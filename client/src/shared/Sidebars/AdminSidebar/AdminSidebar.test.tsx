import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import useAppState from "../../../state/useAppState";
import { defaultAppStateLoggedIn, defaultAppStateLoggedOut, renderWithRouter } from "../../../util/testing-utils";
import AdminSidebar from "./AdminSidebar";

jest.mock("../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

test("renders the info section correctly for public users", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const dashboard = screen.getByTestId("sidebar-dashboard");
  expect(dashboard.innerHTML).toMatch("Dashboard");
  const dashboardLink = dashboard.parentElement as HTMLAnchorElement;
  expect(dashboardLink.href).toMatch("/admin/dashboard");

  const contests = screen.getByTestId("sidebar-contests");
  expect(contests.innerHTML).toMatch("Contests");
  const contestsLink = contests.parentElement as HTMLAnchorElement;
  expect(contestsLink.href).toMatch("/admin/contests");

  const entries = screen.getByTestId("sidebar-entries");
  expect(entries.innerHTML).toMatch("Entries");
  const entriesLink = entries.parentElement as HTMLAnchorElement;
  expect(entriesLink.href).toMatch("/entries/1");

  const results = screen.getByTestId("sidebar-results");
  expect(results.innerHTML).toMatch("Results");
  const resultsLink = results.parentElement as HTMLAnchorElement;
  expect(resultsLink.href).toMatch("/results/1");

  const container = dashboard.parentElement as HTMLElement;
  expect(container.innerHTML).not.toMatch("Contestants");
  expect(container.innerHTML).not.toMatch("Evaluations");
  expect(container.innerHTML).not.toMatch("Skill Levels");
  expect(container.innerHTML).not.toMatch("Tasks");
  expect(container.innerHTML).not.toMatch("Judging");
  expect(container.innerHTML).not.toMatch("Users");
  expect(container.innerHTML).not.toMatch("Errors");
});

test("renders the contestants tab when logged in", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-contestants");
  expect(tab.innerHTML).toMatch("Contestants");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/contestants");
});

test("renders the evaluations tab when logged in", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-evaluations");
  expect(tab.innerHTML).toMatch("Evaluations");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/evaluations/10/2");
});

test("renders the skill levels tab for admins", async () => {
  const state = defaultAppStateLoggedIn();
  state.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: state
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-skill-levels");
  expect(tab.innerHTML).toMatch("Skill Levels");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/admin/skill-levels");
});

test("renders the tasks tab for admins", async () => {
  const state = defaultAppStateLoggedIn();
  state.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: state
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-tasks");
  expect(tab.innerHTML).toMatch("Tasks");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/admin/tasks");
});

test("renders the tasks tab for task managers", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ view_all_tasks: true }),
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-tasks");
  expect(tab.innerHTML).toMatch("Tasks");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/admin/tasks");
});

test("renders the judging tab for admins", async () => {
  const state = defaultAppStateLoggedIn();
  state.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: state
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-judging");
  expect(tab.innerHTML).toMatch("Judging");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/admin/judging");
});

test("renders the judging tab for judging setting viewers", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ view_judging_settings: true }),
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-judging");
  expect(tab.innerHTML).toMatch("Judging");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/admin/judging");
});

test("renders the users tab for admins", async () => {
  const state = defaultAppStateLoggedIn();
  state.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: state
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-users");
  expect(tab.innerHTML).toMatch("Users");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/admin/users");
});

test("renders the users tab for users who can view all users", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ view_all_users: true }),
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-users");
  expect(tab.innerHTML).toMatch("Users");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/admin/users");
});

test("renders the errors tab for admins", async () => {
  const state = defaultAppStateLoggedIn();
  state.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: state
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-errors");
  expect(tab.innerHTML).toMatch("Errors");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/admin/errors");
});

test("renders the errors tab for error viewers", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ view_errors: true }),
  });

  renderWithRouter(<AdminSidebar />);
  await waitForElementToBeRemoved(() => screen.getByTestId("sidebar-spinner"));

  const tab = screen.getByTestId("sidebar-errors");
  expect(tab.innerHTML).toMatch("Errors");
  const link = tab.parentElement as HTMLAnchorElement;
  expect(link.href).toMatch("/admin/errors");
});