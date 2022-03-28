import { screen, render } from '@testing-library/react';
import AnnouncementCard from "./AnnouncementCard";
import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en.json';
import { renderWithRouter } from '../../util/testing-utils';

test("renders the announcement correct", () => {
  TimeAgo.addDefaultLocale(en);
  
  renderWithRouter(
    <AnnouncementCard author="Test User" date="04-01-2022" id={5} title="Test Announcement" isPublic={false} testId="test-announcement">
      <p>Sample announcement content.</p>
      <p>Announcement line 2.</p>
    </AnnouncementCard>
  );

  const card = screen.getByTestId("test-announcement");
  expect(card).toBeInTheDocument();
  expect(card.innerHTML).toMatch("Test User");
  expect(card.innerHTML).toMatch("04-01-2022");
  expect(card.innerHTML).toMatch("Test Announcement");
  expect(card.innerHTML).toMatch("Sample announcement");
  expect(card.innerHTML).toMatch("line 2");
});