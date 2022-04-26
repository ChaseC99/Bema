import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import AdminSidebar from "../../shared/Sidebars/AdminSidebar";
import useAppState from "../../state/useAppState";
import { defaultAppStateLoggedIn, defaultAppStateLoggedOut, renderWithRouter } from "../../util/testing-utils";
import Dashboard from "./Dashboard";
import { fetchStats } from "./fetchStats";

jest.mock("../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

jest.mock("./fetchStats", () => {
  return {
    __esModule: true,
    fetchStats: jest.fn(),
  }
});
const fetchStatsMock = fetchStats as unknown as jest.Mock<Partial<ReturnType<typeof fetchStats>>>;

jest.mock("../../shared/AdminSidebar", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const AdminSidebarMock = AdminSidebar as unknown as jest.Mock<Partial<ReturnType<typeof AdminSidebar>>>;

beforeEach(() => {
  AdminSidebarMock.mockReturnValue(<div></div>);
});

const regularStats = {
  groupEntriesCount: 50,
  groupEvaluationsCount: 80,
  groupEvaluatorCount: 3,
  yourReviewedEntriesCount: 10
}

const adminStats = {
  groupEntriesCount: 50,
  groupEvaluationsCount: 80,
  groupEvaluatorCount: 3,
  totalActiveEvaluators: 5,
  totalDisqualifiedEntries: 10,
  totalEntriesCount: 115,
  totalEvaluationsCount: 120,
  totalFlaggedEntries: 3,
  totalReviewedEntries: 45,
  yourReviewedEntriesCount: 10
}

test("renders the contest summary section correctly for public users", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });
  fetchStatsMock.mockReturnValue(new Promise(resolve => resolve(regularStats)));

  renderWithRouter(<Dashboard />);
  await waitForElementToBeRemoved(() => screen.queryByTestId("stats-spinner"));

  const summary = screen.getByTestId("contest-summary");
  expect(summary.innerHTML).toMatch("Your Progress");
  expect(summary.innerHTML).toMatch("10 / 50");
  expect(summary.innerHTML).toMatch("Group Progress");
  expect(summary.innerHTML).toMatch("80 / 150");
  expect(summary.innerHTML).not.toMatch("Total Reviewed Entries");
  expect(summary.innerHTML).not.toMatch("Total Evaluations");
});

test("renders the contest summary section correctly for admin users", async () => {
  let s = defaultAppStateLoggedIn();
  s.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: s
  });
  fetchStatsMock.mockReturnValue(new Promise(resolve => resolve(adminStats)));

  renderWithRouter(<Dashboard />);
  await waitForElementToBeRemoved(() => screen.queryByTestId("stats-spinner"));

  const summary = screen.getByTestId("contest-summary");
  expect(summary.innerHTML).toMatch("Your Progress");
  expect(summary.innerHTML).toMatch("10 / 50");
  expect(summary.innerHTML).toMatch("Group Progress");
  expect(summary.innerHTML).toMatch("80 / 150");
  expect(summary.innerHTML).toMatch("Total Reviewed Entries");
  expect(summary.innerHTML).toMatch("45 / 115");
  expect(summary.innerHTML).toMatch("Total Evaluations");
  expect(summary.innerHTML).toMatch("120 / 575");
});

test("renders the contest summary section correctly for users who can view admin stats", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ view_admin_stats: true })
  });
  fetchStatsMock.mockReturnValue(new Promise(resolve => resolve(adminStats)));

  renderWithRouter(<Dashboard />);
  await waitForElementToBeRemoved(() => screen.queryByTestId("stats-spinner"));

  const summary = screen.getByTestId("contest-summary");
  expect(summary.innerHTML).toMatch("Your Progress");
  expect(summary.innerHTML).toMatch("10 / 50");
  expect(summary.innerHTML).toMatch("Group Progress");
  expect(summary.innerHTML).toMatch("80 / 150");
  expect(summary.innerHTML).toMatch("Total Reviewed Entries");
  expect(summary.innerHTML).toMatch("45 / 115");
  expect(summary.innerHTML).toMatch("Total Evaluations");
  expect(summary.innerHTML).toMatch("120 / 575");
});

test("renders the entry stats section for admins", async () => {
  let s = defaultAppStateLoggedIn();
  s.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: s
  });
  fetchStatsMock.mockReturnValue(new Promise(resolve => resolve(adminStats)));

  renderWithRouter(<Dashboard />);
  await waitForElementToBeRemoved(() => screen.queryByTestId("stats-spinner"));

  const entryStats = screen.getByTestId("entry-stats");
  expect(entryStats.innerHTML).toMatch("Flagged Entries");
  expect(entryStats.innerHTML).toMatch("Disqualified Entries");
  expect(entryStats.innerHTML).toMatch("Total Entries");
});

test("renders the entry stats section for users who can view admin stats", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ view_admin_stats: true })
  });
  fetchStatsMock.mockReturnValue(new Promise(resolve => resolve(adminStats)));

  renderWithRouter(<Dashboard />);
  await waitForElementToBeRemoved(() => screen.queryByTestId("stats-spinner"));

  const entryStats = screen.getByTestId("entry-stats");
  expect(entryStats.innerHTML).toMatch("Flagged Entries");
  expect(entryStats.innerHTML).toMatch("Disqualified Entries");
  expect(entryStats.innerHTML).toMatch("Total Entries");
});

test("does not render the entry stats section for public users", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });
  fetchStatsMock.mockReturnValue(new Promise(resolve => resolve(regularStats)));

  renderWithRouter(<Dashboard />);
  await waitForElementToBeRemoved(() => screen.queryByTestId("stats-spinner"));

  const entryStats = screen.queryByTestId("entry-stats");
  expect(entryStats).not.toBeInTheDocument();
});

test("does not render the entry stats section for regular logged in users", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });
  fetchStatsMock.mockReturnValue(new Promise(resolve => resolve(regularStats)));

  renderWithRouter(<Dashboard />);
  await waitForElementToBeRemoved(() => screen.queryByTestId("stats-spinner"));

  const entryStats = screen.queryByTestId("entry-stats");
  expect(entryStats).not.toBeInTheDocument();
});