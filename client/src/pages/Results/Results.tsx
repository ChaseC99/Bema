import { gql, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EntriesPerLevel, EntryVote, EntryWithScores, EntryWithScoresPublic, WinningEntry } from ".";
import Button from "../../shared/Button";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../shared/Modals";
import InfoModal from "../../shared/Modals/InfoModal/InfoModal";
import ContestsSidebar from "../../shared/Sidebars/ContestsSidebar";
import useAppState from "../../state/useAppState";
import useAppError from "../../util/errors";
import request from "../../util/request";
import EntriesByAvgScoreCard from "./EntriesByAvgScoreCard";
import EntriesPerLevelCard from "./EntriesPerLevelCard";
import { fetchEntryVotes, fetchResults } from "./fetchResults";
import WinnersCard from "./WinnersCard";

type GetContestResponse = {
  contest: {
    name: string
  }
}

const GET_CONTEST = gql`
  query GetContest($id: ID!) {
    contest(id: $id) {
      name
    }
  }
`;


function Results() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const { contestId } = useParams();
  const [winners, setWinners] = useState<WinningEntry[]>([]);
  const [entriesPerLevel, setEntriesPerLevel] = useState<EntriesPerLevel[]>([]);
  const [entries, setEntries] = useState<EntryWithScores[] | EntryWithScoresPublic[]>([]);
  const [votingEnabled, setVotingEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [addWinnerId, setAddWinnerId] = useState<number | null>(null);
  const [deleteWinnerId, setDeleteWinnerId] = useState<number | null>(null);
  const [deleteVoteEntryId, setDeleteVoteEntryId] = useState<number | null>(null);
  const [voteForEntryId, setVoteForEntryId] = useState<number | null>(null);
  const [showVotesForEntryId, setShowVotesForEntryId] = useState<number | null>(null);
  const [entryVotes, setEntryVotes] = useState<EntryVote[]>([]);

  useQuery<GetContestResponse | null>(GET_CONTEST, {
    variables: {
      id: contestId
    },
    onError: handleGQLError
  });

  useEffect(() => {
    fetchResults(contestId || "")
      .then((data) => {
        setWinners(data.results.winners);
        setEntriesPerLevel(data.results.entriesPerLevel);
        setEntries(data.results.entriesByAvgScore);
        setVotingEnabled(data.voting_enabled);
        setIsLoading(false);
      });
  }, [contestId]);

  const showDeleteWinnerModal = (id: number) => {
    setDeleteWinnerId(id);
  }

  const hideDeleteWinnerModal = () => {
    setDeleteWinnerId(null);
  }

  const handleRemoveWinner = async (id: number) => {
    await request("DELETE", "/api/internal/winners", {
      entry_id: id
    });

    let newWinners = winners.filter((w) => w.entry_id !== id);
    setWinners(newWinners);
    setDeleteWinnerId(null);
  }

  const showVotesModal = (id: number) => {
    fetchEntryVotes(id)
      .then((data) => {
        setShowVotesForEntryId(id);
        setEntryVotes(data);
      })
  }

  const hideVotesModal = () => {
    setShowVotesForEntryId(null);
  }

  const showVoteForm = (id: number) => {
    setVoteForEntryId(id);
  }

  const hideVoteForm = () => {
    setVoteForEntryId(null);
  }

  const handleVoteForEntry = async (values: { [name: string]: any }) => {
    await request("POST", "/api/internal/winners/votes", {
      entry_id: voteForEntryId,
      feedback: values.vote_reason
    });

    let newEntries = [...entries] as unknown as EntryWithScores[];
    for (let i = 0; i < newEntries.length; i++) {
      if (newEntries[i].entry_id === voteForEntryId) {
        newEntries[i].voted_by_user = true;
        newEntries[i].vote_count = newEntries[i].vote_count + 1;
        break;
      }
    }
    setEntries(newEntries);

    hideVoteForm();
  }

  const showConfirmRemoveVoteModal = (entryId: number) => {
    setDeleteVoteEntryId(entryId);
  }

  const hideConfirmRemoveVoteModal = () => {
    setDeleteVoteEntryId(null);
  }

  const handleRemoveVote = async (entryId: number, voteId?: number) => {
    await request("DELETE", "/api/internal/winners/votes", {
      entry_id: entryId,
      vote_id: voteId || null
    });

    let newEntries = [...entries] as unknown as EntryWithScores[];
    for (let i = 0; i < newEntries.length; i++) {
      if (newEntries[i].entry_id === entryId) {
        if (!voteId) {
          newEntries[i].voted_by_user = false;
        }
        else {
          const newEntryVotes = entryVotes.filter((e) => e.vote_id !== voteId);
          setEntryVotes(newEntryVotes);
        }
        newEntries[i].vote_count = newEntries[i].vote_count - 1;
        break;
      }
      setEntries(newEntries);
    }

    hideConfirmRemoveVoteModal();
  }

  const showConfirmAddWinnerModal = (id: number) => {
    setAddWinnerId(id);
  }

  const hideConfirmAddWinnerModal = () => {
    setAddWinnerId(null);
  }

  const handleAddWinner = async (id: number) => {
    await request("POST", "/api/internal/winners", {
      entry_id: id
    });

    const entry = entries.find((e) => e.entry_id === id) as (EntryWithScores | undefined);

    if (entry) {
      let newWinners = [...winners];
      newWinners.push({
        entry_author: entry.entry_author,
        entry_id: entry.entry_id,
        entry_level: entry.entry_level,
        entry_title: entry.title,
        entry_url: entry.entry_url,
      });

      newWinners = newWinners.sort((a, b) => {
        return a.entry_level.localeCompare(b.entry_level);
      });

      setWinners(newWinners);
    }

    hideConfirmAddWinnerModal();
  }

  return (
    <React.Fragment>
      <ContestsSidebar rootPath="/results" />

      <section id="results-page-section" className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2 data-testid="results-page-section-header">Results</h2>
          </div>

          {isLoading && <LoadingSpinner size="LARGE" />}

          {!isLoading &&
            <div className="section-body container" data-testid="results-page-section-body">
              <WinnersCard winners={winners} handleRemoveWinner={showDeleteWinnerModal} />

              <EntriesPerLevelCard entriesPerLevel={entriesPerLevel} />

              <EntriesByAvgScoreCard
                entriesByAvgScore={entries}
                votingEnabled={votingEnabled}
                handleShowEntryVotes={showVotesModal}
                showVoteForm={showVoteForm}
                handleRemoveVote={showConfirmRemoveVoteModal}
                handleAddWinner={showConfirmAddWinnerModal}
              />
            </div>
          }
        </div>
      </section>

      {addWinnerId &&
        <ConfirmModal title="Mark as winner?" confirmLabel="Mark As Winner" handleConfirm={handleAddWinner} handleCancel={hideConfirmAddWinnerModal} data={addWinnerId}>
          <p>Are you sure you want to mark this entry as a winner? This is a public action that will be viewable by external users.</p>
          <p>Before marking as a winner, make sure the entry is in the correct bracket and that the author's account has been checked for any potential disqualifications.</p>
        </ConfirmModal>
      }

      {deleteWinnerId &&
        <ConfirmModal title="Remove winner?" confirmLabel="Remove" handleConfirm={handleRemoveWinner} handleCancel={hideDeleteWinnerModal} destructive data={deleteWinnerId}>
          <p>Are you sure you want to remove this winner? This is a public action that will be viewable by external users.</p>
        </ConfirmModal>
      }

      {showVotesForEntryId &&
        <InfoModal title={"Votes for Entry #" + showVotesForEntryId} handleClose={hideVotesModal}>
          {entryVotes.map((e) => {
            return (
              <div style={{ marginBottom: "30px" }} key={"vote-" + e.vote_id}>
                <span>
                  <h4 style={{ margin: "0 15px 0 0", display: "inline-block" }}>{e.nickname}</h4>
                  {state.is_admin && <Button type="tertiary" role="button" action={() => handleRemoveVote(e.entry_id, e.vote_id)} text="Delete" destructive />}
                </span>
                <p>{e.feedback}</p>
              </div>
            );
          })}
        </InfoModal>
      }

      {voteForEntryId &&
        <FormModal
          title={"Vote for Entry #" + voteForEntryId}
          submitLabel="Submit Vote"
          handleSubmit={handleVoteForEntry}
          handleCancel={hideVoteForm}
          cols={5}
          fields={[
            {
              fieldType: "TEXTAREA",
              label: "Why do you like this entry?",
              description: "This will be used to write the judges comments that are posted on the contests homepage.",
              name: "vote_reason",
              id: "vote-reason",
              defaultValue: "",
              size: "LARGE",
              required: true
            }
          ]}
        />
      }

      {deleteVoteEntryId &&
        <ConfirmModal title="Delete vote?" confirmLabel="Delete" handleConfirm={handleRemoveVote} handleCancel={hideConfirmRemoveVoteModal} destructive data={deleteVoteEntryId}>
          <p>Are you sure you want to delete this vote? This action cannot be undone.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default Results;