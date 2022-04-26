import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import useAppState from '../../state/useAppState';
import { defaultAppStateLoggedIn, renderWithRouter } from '../../util/testing-utils';
import { fetchAvailableTasks, fetchMyTasks } from './fetchTasks';
import Tasks from "./Tasks";

jest.mock("../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

jest.mock("./fetchTasks.tsx", () => {
  return {
    __esModule: true,
    fetchMyTasks: jest.fn(),
    fetchAvailableTasks: jest.fn()
  }
});
const fetchMyTasksMock = fetchMyTasks as unknown as jest.Mock<Partial<ReturnType<typeof fetchMyTasks>>>;
const fetchAvailableTasksMock = fetchAvailableTasks as unknown as jest.Mock<Partial<ReturnType<typeof fetchAvailableTasks>>>;

beforeEach(() => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  fetchMyTasksMock.mockReturnValue(new Promise(resolve => {
    resolve(myTasks)
  }));

  fetchAvailableTasksMock.mockReturnValue(new Promise(resolve => {
    resolve(availableTasks)
  }));
});

const myTasks = [
  {
    task_id: 1,
    task_title: "Sample task 1",
    assigned_member: 1,
    task_status: "Not Started",
    due_date: "4-1-2022",
    testId: "task-1"
  },
  {
    task_id: 2,
    task_title: "Sample task 2",
    assigned_member: 1,
    task_status: "Started",
    due_date: "5-15-2022",
    testId: "task-2"
  }
];

const availableTasks = [
  {
    task_id: 3,
    task_title: "Sample task 3",
    assigned_member: null,
    task_status: "Not Started",
    due_date: "4-1-2022",
    testId: "task-3"
  },
  {
    task_id: 4,
    task_title: "Sample task 4",
    assigned_member: null,
    task_status: "Not Started",
    due_date: "5-15-2022",
    testId: "task-4"
  }
];

test("renders the available tasks section if there are available tasks", async () => {
  renderWithRouter(<Tasks />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("available-tasks-spinner"));

  const section = screen.getByTestId("available-tasks-header");
  expect(section.innerHTML).toMatch("Available Tasks");
});

test("does not render the available tasks section if there are no available tasks", async () => {
  fetchAvailableTasksMock.mockReturnValue(new Promise(resolve => {
    resolve([])
  }));

  renderWithRouter(<Tasks />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("available-tasks-spinner"));

  const section = screen.queryByTestId("available-tasks-header");
  expect(section).not.toBeInTheDocument();
});

test("renders the available tasks section correctly", async () => {
  renderWithRouter(<Tasks />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("available-tasks-spinner"));

  const header = screen.getByTestId("available-tasks-header");
  expect(header.innerHTML).toMatch("Available Tasks");

  const body = screen.getByTestId("available-tasks-section-body");
  expect(body.innerHTML).toMatch("Sample task 3");
  expect(body.innerHTML).toMatch("Sample task 4");
});

test("does not render the my tasks section if there are no assigned tasks", async () => {
  fetchMyTasksMock.mockReturnValue(new Promise(resolve => {
    resolve([])
  }));

  renderWithRouter(<Tasks />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("my-tasks-spinner"));

  const section = screen.queryByTestId("my-tasks-header");
  expect(section).not.toBeInTheDocument();
});

test("renders the my tasks section correctly", async () => {
  renderWithRouter(<Tasks />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("my-tasks-spinner"));

  const header = screen.getByTestId("my-tasks-header");
  expect(header.innerHTML).toMatch("My Tasks");

  const body = screen.getByTestId("my-tasks-section-body");
  expect(body.innerHTML).toMatch("Sample task 1");
  expect(body.innerHTML).toMatch("Sample task 2");
});

test("signing up for a task moves the task to the My Tasks section", async () => {
  renderWithRouter(<Tasks />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("available-tasks-spinner"));

  const btn = screen.getByTestId("task-3-actions-1");

  act(() => {
    btn.click();
  });

  const availableTasks = screen.getByTestId("available-tasks-section-body");
  expect(availableTasks.innerHTML).not.toMatch("Sample task 3");

  const myTasks = screen.getByTestId("my-tasks-section-body");
  expect(myTasks.innerHTML).toMatch("Sample task 3");
});

test("correctly marks a task as started", async () => {
  renderWithRouter(<Tasks />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("my-tasks-spinner"));

  const btn = screen.getByTestId("task-1-actions-1");

  act(() => {
    btn.click();
  });

  const task = screen.getByTestId("task-1");
  expect(task.innerHTML).toMatch("Started");
  expect(task.innerHTML).not.toMatch("Not Started");
});

test("correctly marks a task as completed", async () => {
  renderWithRouter(<Tasks />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("my-tasks-spinner"));

  const btn = screen.getByTestId("task-2-actions-1");

  act(() => {
    btn.click();
  });

  const task = screen.queryByTestId("task-2");
  expect(task).not.toBeInTheDocument();
});