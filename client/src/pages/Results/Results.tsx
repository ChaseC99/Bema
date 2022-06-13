import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
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
import WinnersCard from "./WinnersCard";

type EntryVote = {
  id: number
  user: {
    nickname: string
  }
  reason: string
}

export type Entry = {
  id: string
  title: string
  url: string
  author: {
    kaid: string
    name: string
  } | null
  evaluationCount: number
  skillLevel: string
  averageScore: number
  voteCount: number
  isVotedByUser: boolean
  judgeVotes: EntryVote[]
}

type GetContestResponse = {
  contest: {
    name: string
    winners: Entry[]
    isVotingEnabled: boolean
  }
}

const GET_CONTEST = gql`
  query GetContest($id: ID!) {
    contest(id: $id) {
      name
      winners {
        id
        title
        url
        author {
          kaid
          name
        }
        skillLevel
      }
      isVotingEnabled
    }
  }
`;

export type EntryLevel = {
  level: string
  count: number
}

type GetEntriesPerLevelResponse = {
  entriesPerLevel: EntryLevel[]
}

const GET_ENTRIES_PER_LEVEL = gql`
  query GetEntriesPerLevel($contestId: ID!) {
    entriesPerLevel(contestId: $contestId) {
      level
      count
    }
  }
`;

type GetEntriesByAverageScoreResponse = {
  entries: Entry[]
}

const GET_ENTRIES_BY_AVG_SCORE = gql`
  query GetEntriesByAverageScore($contestId: ID!) {
    entries: entriesByAverageScore(contestId: $contestId) {
      id
      title
      url
      author {
        kaid
        name
      }
      evaluationCount
      skillLevel
      averageScore
      voteCount
      isVotedByUser
    }
  }
`;

type GetEntryVotesResponse = {
  entry: Entry
}

const GET_ENTRY_VOTES = gql`
  query GetEntryVotes($entryId: ID!) {
    entry(id: $entryId) {
      id
      judgeVotes {
        id
        user {
          nickname
        }
        reason
      }
    }
  }
`;

const ADD_WINNER = gql`
  mutation AddWinner($entryId: ID!) {
    entry: addWinner(id: $entryId) {
      id
      isWinner
    }
  }
`;

type AddWinnerResponse = {
  entry: Entry
}

const REMOVE_WINNER = gql`
  mutation RemoveWinner($entryId: ID!) {
    entry: removeWinner(id: $entryId) {
      id
      isWinner
    }
  }
`;

type RemoveWinnerResponse = {
  entry: Entry
}

function Results() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const { contestId } = useParams();
  const [addWinnerId, setAddWinnerId] = useState<string | null>(null);
  const [deleteWinnerId, setDeleteWinnerId] = useState<string | null>(null);
  const [deleteVoteEntryId, setDeleteVoteEntryId] = useState<string | null>(null);
  const [voteForEntryId, setVoteForEntryId] = useState<string | null>(null);
  const [showVotesForEntryId, setShowVotesForEntryId] = useState<string | null>(null);

  const { loading: contestIsLoading, data: contestData, refetch: refetchContest } = useQuery<GetContestResponse | null>(GET_CONTEST, {
    variables: {
      id: contestId
    },
    onError: handleGQLError
  });
  const { loading: entriesIsLoading, data: entriesData, refetch: refetchEntries } = useQuery<GetEntriesByAverageScoreResponse>(GET_ENTRIES_BY_AVG_SCORE, { 
    variables: {
      contestId: contestId
    },
    onError: handleGQLError 
  });
  const { loading: levelsIsLoading, data: levelsData } = useQuery<GetEntriesPerLevelResponse>(GET_ENTRIES_PER_LEVEL, {
    variables: {
      contestId: contestId
    },
    onError: handleGQLError
  });
  const [fetchEntryVotes, { loading: entryVotesIsLoading, data: entryVotesData }] = useLazyQuery<GetEntryVotesResponse>(GET_ENTRY_VOTES, { onError: handleGQLError });

  const [addWinner, { loading: addWinnerIsLoading }] = useMutation<AddWinnerResponse>(ADD_WINNER);
  const [removeWinner, { loading: removeWinnerIsLoading }] = useMutation<RemoveWinnerResponse>(REMOVE_WINNER);

  const showDeleteWinnerModal = (id: string) => {
    setDeleteWinnerId(id);
  }

  const hideDeleteWinnerModal = () => {
    setDeleteWinnerId(null);
  }

  const handleRemoveWinner = async (id: string) => {
    removeWinner({
      variables: {
        entryId: id
      }
    });

    refetchContest();
    setDeleteWinnerId(null);
  }

  const showVotesModal = (id: string) => {
    fetchEntryVotes({
      variables: {
        entryId: id
      }
    });

    setShowVotesForEntryId(id);
  }

  const hideVotesModal = () => {
    setShowVotesForEntryId(null);
  }

  const showVoteForm = (id: string) => {
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

    refetchEntries();
    hideVoteForm();
  }

  const showConfirmRemoveVoteModal = (entryId: string) => {
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

    refetchEntries();
    fetchEntryVotes({
      variables: {
        entryId: entryId
      }
    })
    hideConfirmRemoveVoteModal();
  }

  const showConfirmAddWinnerModal = (id: string) => {
    setAddWinnerId(id);
  }

  const hideConfirmAddWinnerModal = () => {
    setAddWinnerId(null);
  }

  const handleAddWinner = async (id: string) => {
    addWinner({
      variables: {
        entryId: id
      }
    });

    refetchContest();
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

          {(entriesIsLoading || contestIsLoading || levelsIsLoading) && <LoadingSpinner size="LARGE" />}

          {!(entriesIsLoading || contestIsLoading || levelsIsLoading) &&
            <div className="section-body container" data-testid="results-page-section-body">
              <WinnersCard winners={contestData?.contest.winners || []} handleRemoveWinner={showDeleteWinnerModal} />

              <EntriesPerLevelCard entriesPerLevel={levelsData?.entriesPerLevel || []} />

              <EntriesByAvgScoreCard
                entriesByAvgScore={entriesData ? entriesData.entries : []}
                votingEnabled={contestData?.contest.isVotingEnabled || false}
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
        <ConfirmModal title="Mark as winner?" confirmLabel="Mark As Winner" handleConfirm={handleAddWinner} handleCancel={hideConfirmAddWinnerModal} data={addWinnerId} loading={addWinnerIsLoading}>
          <p>Are you sure you want to mark this entry as a winner? This is a public action that will be viewable by external users.</p>
          <p>Before marking as a winner, make sure the entry is in the correct bracket and that the author's account has been checked for any potential disqualifications.</p>
        </ConfirmModal>
      }

      {deleteWinnerId &&
        <ConfirmModal title="Remove winner?" confirmLabel="Remove" handleConfirm={handleRemoveWinner} handleCancel={hideDeleteWinnerModal} destructive data={deleteWinnerId} loading={removeWinnerIsLoading}>
          <p>Are you sure you want to remove this winner? This is a public action that will be viewable by external users.</p>
        </ConfirmModal>
      }

      {showVotesForEntryId &&
        <InfoModal title={"Votes for Entry #" + showVotesForEntryId} handleClose={hideVotesModal}>
          {entryVotesIsLoading ? 
            <LoadingSpinner size="MEDIUM" />
            :
            entryVotesData?.entry.judgeVotes.map((e) => {
              return (
                <div style={{ marginBottom: "30px" }} key={"vote-" + e.id}>
                  <span>
                    <h4 style={{ margin: "0 15px 0 0", display: "inline-block" }}>{e.user.nickname}</h4>
                    {state.is_admin && <Button type="tertiary" role="button" action={() => handleRemoveVote(parseInt(showVotesForEntryId), e.id)} text="Delete" destructive />}
                  </span>
                  <p>{e.reason}</p>
                </div>
              );
            }) || ""
          }
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