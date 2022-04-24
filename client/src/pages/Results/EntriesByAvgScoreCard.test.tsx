import { act, screen } from "@testing-library/react";
import useAppState from "../../state/useAppState";
import { defaultAppStateLoggedIn, defaultAppStateLoggedOut, renderWithRouter } from "../../util/testing-utils";
import EntriesByAvgScoreCard from "./EntriesByAvgScoreCard";

const entries = [
  {
    entry_author: "Author 1",
    entry_id: 1,
    entry_url: "",
    title: "Entry 1",
    avg_score: 10,
    entry_level: "Advanced",
    evaluations: 2,
    vote_count: 2,
    voted_by_user: false
  },
  {
    entry_author: "Author 2",
    entry_id: 2,
    entry_url: "",
    title: "Entry 2",
    avg_score: 10,
    entry_level: "Advanced",
    evaluations: 2,
    vote_count: 2,
    voted_by_user: true
  },
  {
    entry_author: "Author 3",
    entry_id: 3,
    entry_url: "",
    title: "Entry 3",
    avg_score: 10,
    entry_level: "Advanced",
    evaluations: 2,
    vote_count: 0,
    voted_by_user: false
  }
];

const entriesPublic = [
  {
    entry_author: "Author 1",
    entry_id: 1,
    entry_url: "",
    title: "Entry 1",
  },
  {
    entry_author: "Author 2",
    entry_id: 2,
    entry_url: "",
    title: "Entry 2",
  },
  {
    entry_author: "Author 3",
    entry_id: 3,
    entry_url: "",
    title: "Entry 3",
  }
];

jest.mock("../../state/useAppState", () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
});
const useAppStateMock = useAppState as unknown as jest.Mock<Partial<ReturnType<typeof useAppState>>>;

test("renders the correct fields for unauthenticated users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entriesPublic} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const table = screen.getByTestId("score-card");

  expect(table.innerHTML).toMatch("ID");
  expect(table.innerHTML).toMatch("Title");
  expect(table.innerHTML).toMatch("Author");
  expect(table.innerHTML).not.toMatch("Evaluations");
  expect(table.innerHTML).not.toMatch("Skill Level");
  expect(table.innerHTML).not.toMatch("Avg Score");
  expect(table.innerHTML).not.toMatch("Votes");
});

test("renders the correct fields for authenticated users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const table = screen.getByTestId("score-card");

  expect(table.innerHTML).toMatch("ID");
  expect(table.innerHTML).toMatch("Title");
  expect(table.innerHTML).toMatch("Author");
  expect(table.innerHTML).toMatch("Evaluations");
  expect(table.innerHTML).toMatch("Skill Level");
  expect(table.innerHTML).toMatch("Avg Score");
  expect(table.innerHTML).toMatch("Votes");
});

test("does not render the vote for entry action if voting is disabled", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ judge_entries: true })
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled={false} handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-vote-action");
  expect(btn).not.toBeInTheDocument();
});

test("does not render the vote for entry action if the user has already voted for the entry", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ judge_entries: true })
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-2-vote-action");
  expect(btn).not.toBeInTheDocument();
});

test("renders the vote for entry action if the following is true: voting is enabled, the user can judge entries, the user has not already voted for the entry", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ judge_entries: true })
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-vote-action");
  expect(btn).toBeInTheDocument();
});

test("renders the vote for entry action if the following is true: voting is enabled, the user is an admin, the user has not already voted for the entry", () => {
  let s = defaultAppStateLoggedIn();
  s.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: s
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-vote-action");
  expect(btn).toBeInTheDocument();
});

test("clicking the vote for entry action calls the show vote form handler", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ judge_entries: true })
  });

  const showVoteForm = jest.fn();

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={showVoteForm} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-vote-action");

  act(() => {
    btn?.click();
  });

  expect(showVoteForm).toHaveBeenCalled();
});

test("does not render the remove vote action if voting is disabled", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ judge_entries: true })
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled={false} handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-remove-vote-action");
  expect(btn).not.toBeInTheDocument();
});

test("does not render the remove vote action if the user has not voted for the entry", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ judge_entries: true })
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-remove-vote-action");
  expect(btn).not.toBeInTheDocument();
});

test("renders the remove vote action if the following is true: voting is enabled, the user can judge entries, the user has voted for the entry", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ judge_entries: true })
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-2-remove-vote-action");
  expect(btn).toBeInTheDocument();
});

test("renders the remove vote action if the following is true: voting is enabled, the user is an admin, the user has voted for the entry", () => {
  let s = defaultAppStateLoggedIn();
  s.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: s
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-2-remove-vote-action");
  expect(btn).toBeInTheDocument();
});

test("clicking the remove vote action calls the remove vote handler", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ judge_entries: true })
  });

  const handleRemoveVote = jest.fn();
  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={handleRemoveVote} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-2-remove-vote-action");

  act(() => {
    btn?.click();
  });

  expect(handleRemoveVote).toHaveBeenCalled();
});

test("does not render the mark as winner action for logged out users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedOut()
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entriesPublic} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-mark-as-winner-action");
  expect(btn).not.toBeInTheDocument();
});

test("does not render the mark as winner action for default logged in users", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-mark-as-winner-action");
  expect(btn).not.toBeInTheDocument();
});

test("renders the mark as winner action for admin users", () => {
  let s = defaultAppStateLoggedIn();
  s.is_admin = true;
  useAppStateMock.mockReturnValue({
    state: s
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-mark-as-winner-action");
  expect(btn).toBeInTheDocument();
});

test("renders the mark as winner action for users who can manage winners", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn({ manage_winners: true })
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-mark-as-winner-action");
  expect(btn).toBeInTheDocument();
});

test("does not render the view votes button if the entry has no votes", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-3-vote-count-btn");
  expect(btn).not.toBeInTheDocument();
});

test("renders the view votes button if the entry has at least one vote", () => {
  useAppStateMock.mockReturnValue({
    state: defaultAppStateLoggedIn()
  });

  renderWithRouter(<EntriesByAvgScoreCard entriesByAvgScore={entries} testId="score-card" votingEnabled handleShowEntryVotes={jest.fn()} showVoteForm={jest.fn()} handleRemoveVote={jest.fn()} handleAddWinner={jest.fn()} />);

  const btn = screen.queryByTestId("entry-1-vote-count-btn");
  expect(btn).toBeInTheDocument();
});