import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import useAppState from '../../state/useAppState';
import { defaultAppStateLoggedIn, defaultAppStateLoggedOut, renderWithRouter } from '../../util/testing-utils';
import Announcements from "./Announcements";

jest.mock("../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

const announcements = [
  {
    message_author: "Test User 1",
    message_content: "<p>This is a sample public announcement.</p>",
    message_date: "04-01-2022",
    message_id: 1,
    message_title: "Public Announcement 1",
    public: true
  },
  {
    message_author: "Test User 2",
    message_content: "<p>This is another sample public announcement.</p>",
    message_date: "04-02-2022",
    message_id: 2,
    message_title: "Public Announcement 2",
    public: true
  },
  {
    message_author: "Test User 1",
    message_content: "<p>This is a sample private announcement.</p>",
    message_date: "04-03-2022",
    message_id: 3,
    message_title: "Private Announcement 1",
    public: false
  },
  {
    message_author: "Test User 2",
    message_content: "<p>This is a sample public announcement.\n\nThat has multiple lines.</p>",
    message_date: "04-04-2022",
    message_id: 4,
    message_title: "Private Announcement 2",
    public: false
  }
];

test("renders the announcement heading", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<Announcements />);

  const header = screen.getByTestId("announcement-header");
  expect(header.innerHTML).toMatch("Announcements");

  await waitForElementToBeRemoved(() => screen.queryByTestId("announcements-spinner"));
});

test("renders the list of announcements when logged out", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<Announcements />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("announcements-spinner"));
  
  const body = screen.getByTestId("announcement-section-body");
  
  expect(body.innerHTML).toMatch("Public Announcement 1");
  expect(body.innerHTML).toMatch("Public Announcement 2");
});

test("renders the list of announcements when logged in", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<Announcements />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("announcements-spinner"));
  
  const body = screen.getByTestId("announcement-section-body");
  
  expect(body.innerHTML).toMatch("Public Announcement 1");
  expect(body.innerHTML).toMatch("Public Announcement 2");
  expect(body.innerHTML).toMatch("Private Announcement 1");
  expect(body.innerHTML).toMatch("Private Announcement 2");
});

test("does not display the New Announcement button to logged out users", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<Announcements />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("announcements-spinner"));

  const actions = screen.getByTestId("announcement-section-actions");
  expect(actions.innerHTML).not.toMatch("New Announcement");
});

test("does not display the New Announcement button to regular users", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<Announcements />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("announcements-spinner"));

  const actions = screen.getByTestId("announcement-section-actions");
  expect(actions.innerHTML).not.toMatch("New Announcement");
});

test("displays the New Announcement button to admins", async () => {
  useAppStateMock.mockReturnValue({
    state: {
      ...defaultAppStateLoggedIn(),
      is_admin: true
    }
  });

  renderWithRouter(<Announcements />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("announcements-spinner"));

  const actions = screen.getByTestId("announcement-section-actions");
  expect(actions.innerHTML).toMatch("New Announcement");
});

test("displays the New Announcement button to announcement managers", async () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ manage_announcements: true })
  });

  renderWithRouter(<Announcements />);

  await waitForElementToBeRemoved(() => screen.queryByTestId("announcements-spinner"));

  const actions = screen.getByTestId("announcement-section-actions");
  expect(actions.innerHTML).toMatch("New Announcement");
});