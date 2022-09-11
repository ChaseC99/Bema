import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import Badge from "../../../shared/Badge";
import Button from "../../../shared/Button";
import ExternalLink from "../../../shared/ExternalLink";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal } from "../../../shared/Modals";
import ProgramEmbed from "../../../shared/ProgramEmbed";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppError from "../../../util/errors";
import "./Levels.css";

type ContestantEntry = {
  id: string
  title: string
  url: string
  contest: {
    name: string
  }
  skillLevel: string
  averageScore: number
  isWinner: boolean
  isDisqualified: string
}

type Author = {
  kaid: string
  name: string
  entries: ContestantEntry[]
}

type Entry = {
  id: string
  title: string
  url: string
  kaid: string
  author: Author
  votes: number
  height: number
}

type GetNextEntryResponse = {
  entry: Entry
}

const GET_NEXT_ENTRY = gql`
  query GetNextEntryToReviewLevel {
    entry: nextEntryToReviewSkillLevel {
      id
      title
      url
      kaid
      author {
        kaid
        name
        entries {
          id
          title
          url
          contest {
            name
          }
          skillLevel
          averageScore
          isWinner
          isDisqualified
        }
      }
      height
      votes
    }
  }
`;

type EntryMutationResponse = {
  entry: {
    id: string
    isFlagged: boolean
    isDisqualified: boolean
  } | null
}

const DISQUALIFY_ENTRY = gql`
  mutation DisqualifyEntry($id: ID!) {
    entry: disqualifyEntry(id: $id) {
      id
      isFlagged
      isDisqualified
    }
  }
`;

const DELETE_ENTRY = gql`
  mutation DeleteEntry($id: ID!) {
    entry: deleteEntry(id: $id) {
      id
      isFlagged
      isDisqualified
    }
  }
`;

type SetEntryLevelResponse = {
  entry: Entry
}

const SET_ENTRY_LEVEL = gql`
  mutation SetEntryLevel($id: ID!, $skillLevel: String!) {
    entry: setEntryLevel(id: $id, skillLevel: $skillLevel) {
      id
      title
      url
      kaid
      author {
        kaid
        name
        entries {
          id
          title
          url
          contest {
            name
          }
          skillLevel
          averageScore
          isWinner
          isDisqualified
        }
      }
      height
      votes
    }
  }
`;

function Levels() {
  const { handleGQLError } = useAppError();
  const [programIsLoading, setProgramIsLoading] = useState<boolean>(true);
  const [showDisqualifyModal, setShowDisqualifyModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const { loading: entryIsLoading, data: entryData, refetch: fetchNextEntry } = useQuery<GetNextEntryResponse>(GET_NEXT_ENTRY, { onError: handleGQLError });
  const [disqualifyEntry, { loading: disqualifyEntryIsLoading }] = useMutation<EntryMutationResponse>(DISQUALIFY_ENTRY, { onError: handleGQLError });
  const [deleteEntry, { loading: deleteEntryIsLoading }] = useMutation<EntryMutationResponse>(DELETE_ENTRY, { onError: handleGQLError });
  const [setEntryLevel, { loading: setEntryLevelIsLoading }] = useMutation<SetEntryLevelResponse>(SET_ENTRY_LEVEL, { onError: handleGQLError });

  const handleProgramLoad = () => {
    setProgramIsLoading(false);
  }

  const handleFetchNextEntry = () => {
    setProgramIsLoading(true);
    fetchNextEntry();
  }

  const handleSetSkillLevel = async (level: string) => {
    if (!entryData || !entryData.entry) {
      return;
    }

    await setEntryLevel({
      variables: {
        id: entryData.entry.id,
        skillLevel: level
      }
    });

    handleFetchNextEntry();
  }

  const openDisqualifyModal = () => {
    setShowDisqualifyModal(true);
  }

  const closeDisqualifyModal = () => {
    setShowDisqualifyModal(false);
  }

  const handleDisqualify = async () => {
    await disqualifyEntry({
      variables: {
        id: entryData?.entry.id
      }
    });

    closeDisqualifyModal();
    handleFetchNextEntry();
  }

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  }

  const handleDelete = async () => {
    await deleteEntry({
      variables: {
        id: entryData?.entry.id
      }
    });

    closeDeleteModal();
    handleFetchNextEntry();
  }

  if (!entryIsLoading && entryData?.entry === null) {
    return (
      <React.Fragment>
        <AdminSidebar />

        <div className="container center col-12">
          <div className="container center col-8" style={{ flexDirection: "column", alignItems: "center" }}>
            <h2>Woohoo! All the entries have been reviewed!</h2>
          </div>
        </div >
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <AdminSidebar />

      <section className="container center col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>Review Entry Levels</h2>
          </div>
          <div className="section-body">
            {entryIsLoading && <LoadingSpinner size="MEDIUM" />}

            {(!entryIsLoading && entryData) &&
              <React.Fragment>
                <h2 style={{ width: "100%", textAlign: "center", marginTop: "0", marginBottom: "8px" }}><ExternalLink to={entryData.entry.url}>{entryData.entry.title}</ExternalLink></h2>
                <p style={{ width: "100%", textAlign: "center", marginTop: "0", marginBottom: "8px" }}>By: <ExternalLink to={"https://www.khanacademy.org/profile/" + entryData.entry.author.kaid + "/projects"}>{entryData.entry.author.name}</ExternalLink></p>
                <p style={{ width: "100%", textAlign: "center", marginTop: "0", marginBottom: "16px" }}>Votes: {entryData.entry.votes}</p>

                {programIsLoading && 
                  <div className="col-12">
                    <LoadingSpinner size="MEDIUM" />
                  </div>
                }
                <ProgramEmbed programKaid={entryData.entry.kaid} height={entryData.entry.height} onLoad={handleProgramLoad} hidden={programIsLoading} />
              </React.Fragment>
            }

            <div className="container col-10 actions-container">
              <div>
                <h4>Set Skill Level</h4>
                <Button type="primary" role="button" action={handleSetSkillLevel} loading={setEntryLevelIsLoading} data="Beginner" text="Beginner" />
                <Button type="primary" role="button" action={handleSetSkillLevel} loading={setEntryLevelIsLoading} data="Intermediate" text="Intermediate" />
                <Button type="primary" role="button" action={handleSetSkillLevel} loading={setEntryLevelIsLoading} data="Advanced" text="Advanced" />
              </div>
              <div>
                <h4>Moderation</h4>
                <Button type="secondary" role="button" action={openDisqualifyModal} text="Disqualify" destructive />
                <Button type="secondary" role="button" action={openDeleteModal} text="Delete" destructive />
              </div>
            </div>

            {(!entryIsLoading && entryData) &&
              <Table cols={10} noCard label="Previous Submissions">
                <TableHead>
                  <Row>
                    <Cell header>ID</Cell>
                    <Cell header>Title</Cell>
                    <Cell header>Contest</Cell>
                    <Cell header>Level</Cell>
                    <Cell header>Avg Score</Cell>
                  </Row>
                </TableHead>
                <TableBody>
                  {entryData.entry.author.entries.map((e) => {
                    return (
                      <Row key={e.id}>
                        <Cell>{e.id}</Cell>
                        <Cell>
                          {e.title}
                          {e.isDisqualified ? <Badge color="#d92916" text="Disqualified" type="secondary" /> : ""}
                          {e.isWinner ? <Badge color="#ffb100" text="Winner" type="secondary" /> : ""}
                        </Cell>
                        <Cell>{e.contest.name}</Cell>
                        <Cell>{e.skillLevel}</Cell>
                        <Cell>{e.averageScore ? e.averageScore : "N/A"}</Cell>
                      </Row>
                    );
                  })}
                </TableBody>
              </Table>
            }
          </div>
        </div>
      </section>

      {showDisqualifyModal &&
        <ConfirmModal
          title="Disqualify entry?"
          confirmLabel="Disqualify"
          handleConfirm={handleDisqualify}
          handleCancel={closeDisqualifyModal}
          loading={disqualifyEntryIsLoading}
          destructive
        >
          <p>Are you sure you want to disqualify this entry? This will remove the entry from the judging queue for all users.</p>
        </ConfirmModal>
      }

      {showDeleteModal &&
        <ConfirmModal
          title="Delete entry?"
          confirmLabel="Delete"
          handleConfirm={handleDelete}
          handleCancel={closeDeleteModal}
          loading={deleteEntryIsLoading}
          destructive
        >
          <p>Are you sure you want to delete this entry? This action cannot be undone.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default Levels;