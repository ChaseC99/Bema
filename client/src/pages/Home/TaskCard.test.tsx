import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import useAppState from '../../state/useAppState';
import { defaultAppStateLoggedIn } from '../../util/testing-utils';
import TaskCard from './TaskCard';

jest.mock("../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

const updateTaskStatus = jest.fn();
const signupForTask = jest.fn();

test("renders the task information correctly", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  render(<TaskCard title="Sample task #1" status="Not Started" id="10" dueDate = "04-01-2022" assigned={true} testId="task-card" updateTaskStatus={updateTaskStatus} signupForTask={signupForTask} />);

  const task = screen.getByTestId("task-card");
  expect(task.innerHTML).toMatch("Sample task #1");
  expect(task.innerHTML).toMatch("Not Started");
  expect(task.innerHTML).toMatch("04-01-2022");
  expect(task.innerHTML).toMatch("<i");
});

test("renders a Mark as Started button for Not Started tasks", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  render(<TaskCard title="Sample task #1" status="Not Started" id="10" dueDate = "04-01-2022" assigned={true} testId="task-card" updateTaskStatus={updateTaskStatus} signupForTask={signupForTask} />);

  const task = screen.getByTestId("task-card");
  expect(task.innerHTML).toMatch("Mark as started");
});

test("renders a Mark as Completed button for Started tasks", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  render(<TaskCard title="Sample task #1" status="Started" id="10" dueDate = "04-01-2022" assigned={true} testId="task-card" updateTaskStatus={updateTaskStatus} signupForTask={signupForTask} />);
  
  const task = screen.getByTestId("task-card");
  expect(task.innerHTML).toMatch("Mark as completed");
});

test("renders a Signup for Task button for unassigned tasks", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  render(<TaskCard title="Sample task #1" status="Not Started" id="10" dueDate = "04-01-2022" assigned={false} testId="task-card" updateTaskStatus={updateTaskStatus} signupForTask={signupForTask} />);

  const task = screen.getByTestId("task-card");
  expect(task.innerHTML).toMatch("Sign up for task");
});