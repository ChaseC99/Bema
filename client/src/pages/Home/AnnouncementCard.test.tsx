import { screen } from '@testing-library/react';
import AnnouncementCard from "./AnnouncementCard";
import { defaultAppStateLoggedIn, defaultAppStateLoggedOut, renderWithRouter } from '../../util/testing-utils';
import useAppState from '../../state/useAppState';

jest.mock("../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

const sampleAnnouncement = (
  <AnnouncementCard author="Test User" date="04-01-2022" id={5} title="Test Announcement" isPublic={true} testId="test-announcement" handleDelete={jest.fn()} handleEdit={jest.fn()}>
    <p>Sample announcement content.</p>
    <p>Announcement line 2.</p>
  </AnnouncementCard>
);

test("renders the announcement correctly", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(sampleAnnouncement);

  const card = screen.getByTestId("test-announcement");
  expect(card).toBeInTheDocument();
  expect(card.innerHTML).toMatch("Test User");
  expect(card.innerHTML).toMatch("04-01-2022");
  expect(card.innerHTML).toMatch("Test Announcement");
  expect(card.innerHTML).toMatch("Sample announcement");
  expect(card.innerHTML).toMatch("line 2");
});

test("does not display the actions icon to regular users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(sampleAnnouncement);

  const card = screen.getByTestId("test-announcement");
  const header = card.firstChild as HTMLDivElement;

  expect(header.innerHTML).not.toMatch("<i");
});

test("displays the actions icon to admins", () => {
  const s = defaultAppStateLoggedIn();
  s.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: s
  });

  renderWithRouter(sampleAnnouncement);

  const card = screen.getByTestId("test-announcement");
  const header = card.firstChild as HTMLDivElement;

  expect(header.innerHTML).toMatch("<i");
});

test("displays the actions icon to announcement managers", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ manage_announcements: true })
  });

  renderWithRouter(sampleAnnouncement);

  const card = screen.getByTestId("test-announcement");
  const header = card.firstChild as HTMLDivElement;

  expect(header.innerHTML).toMatch("<i");
});