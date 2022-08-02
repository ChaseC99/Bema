import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../shared/Button";
import ExternalLink from "../../../shared/ExternalLink";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import useAppError from "../../../util/errors";
import request from "../../../util/request";

type Entry = {
  id: string
  title: string
  url: string
  author: {
    name: string
    kaid: string
  } | null
  created: string
}

type GetFlaggedEntriesResponse = {
  flaggedEntries: Entry[]
}

const GET_FLAGGED_ENTRIES = gql`
  query GetFlaggedEntries {
    flaggedEntries {
      id
      title
      url
      author {
        name
        kaid
      }
      created
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

const APPROVE_ENTRY = gql`
  mutation ApproveEntry($id: ID!) {
    entry: approveEntry(id: $id) {
      id
      isFlagged
      isDisqualified
    }
  }
`;

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

function FlaggedEntriesCard() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [approveEntryId, setApproveEntryId] = useState<number | null>();
  const [disqualifyEntryId, setDisqualifyEntryId] = useState<number | null>();
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>();

  const { loading, data, refetch } = useQuery<GetFlaggedEntriesResponse>(GET_FLAGGED_ENTRIES, { onError: handleGQLError });
  const [approveEntry, { loading: approveEntryIsLoading }] = useMutation<EntryMutationResponse>(APPROVE_ENTRY, { onError: handleGQLError });
  const [disqualifyEntry, { loading: disqualifyEntryIsLoading }] = useMutation<EntryMutationResponse>(DISQUALIFY_ENTRY, { onError: handleGQLError });
  const [deleteEntry, { loading: deleteEntryIsLoading }] = useMutation<EntryMutationResponse>(DELETE_ENTRY, { onError: handleGQLError });

  const openApproveModal = (id: number) => {
    setApproveEntryId(id);
  }

  const closeApproveModal = () => {
    setApproveEntryId(null);
  }

  const handleApprove = async (id: number) => {
    await approveEntry({
      variables: {
        id: id
      }
    });

    refetch();
    closeApproveModal();
  }

  const openDisqualifyModal = (id: number) => {
    setDisqualifyEntryId(id);
  }

  const closeDisqualifyModal = () => {
    setDisqualifyEntryId(null);
  }

  const handleDisqualify = async (id: number) => {
    await disqualifyEntry({
      variables: {
        id: id
      }
    });

    refetch();
    closeDisqualifyModal();
  }

  const openDeleteModal = (id: number) => {
    setDeleteEntryId(id);
  }

  const closeDeleteModal = () => {
    setDeleteEntryId(null);
  }

  const handleDelete = async (id: number) => {
    await deleteEntry({
      variables: {
        id: id
      }
    });

    refetch();
    closeDeleteModal();
  }

  if (loading) {
    return (
      <article className="card col-12">
        <div className="card-header">
          <h3>Flagged Entries</h3>
        </div>
        <div className="card-body">
          <LoadingSpinner size="MEDIUM" />
        </div>
      </article>
    );
  }

  return (
    <React.Fragment>
      <Table label="Flagged Entries">
        <TableHead>
          <Row>
            <Cell header>ID</Cell>
            <Cell header>Name</Cell>
            <Cell header>Author</Cell>
            <Cell header>Created</Cell>
            <Cell header></Cell>
          </Row>
        </TableHead>
        <TableBody>
          {data ? data.flaggedEntries.map((e) => {
            return (
              <Row key={e.id}>
                <Cell>{e.id}</Cell>
                <Cell><ExternalLink to={e.url}>{e.title}</ExternalLink></Cell>
                <Cell><Link to={"/contestants/" + e.author?.kaid}>{e.author?.name}</Link></Cell>
                <Cell>{e.created}</Cell>
                <Cell>
                  {(state.is_admin || state.user?.permissions.edit_entries) ?
                    <React.Fragment>
                      <Button type="tertiary" role="button" action={openApproveModal} text="Approve" data={e.id} style={{ marginRight: "24px" }} />
                      <Button type="tertiary" role="button" action={openDisqualifyModal} text="Disqualify" destructive data={e.id} style={{ marginRight: "24px" }} />
                    </React.Fragment>
                    : ""}
                  {(state.is_admin || state.user?.permissions.delete_entries) ?
                    <Button type="tertiary" role="button" action={openDeleteModal} text="Delete" destructive data={e.id} />
                    : ""}
                </Cell>
              </Row>
            );
          }) : ""}
        </TableBody>
      </Table>

      {approveEntryId &&
        <ConfirmModal
          title="Approve entry?"
          confirmLabel="Approve"
          handleConfirm={handleApprove}
          handleCancel={closeApproveModal}
          data={approveEntryId}
          loading={approveEntryIsLoading}
        >
          <p>Are you sure you want to approve this entry? This will place the entry back into the judging queue.</p>
        </ConfirmModal>
      }

      {disqualifyEntryId &&
        <ConfirmModal
          title="Disqualify entry?"
          confirmLabel="Disqualify"
          handleConfirm={handleDisqualify}
          handleCancel={closeDisqualifyModal}
          data={disqualifyEntryId}
          loading={disqualifyEntryIsLoading}
          destructive
        >
          <p>Are you sure you want to disqualify this entry? This will remove the entry from the judging queue for all users.</p>
        </ConfirmModal>
      }

      {deleteEntryId &&
        <ConfirmModal
          title="Delete entry?"
          confirmLabel="Delete"
          handleConfirm={handleDelete}
          handleCancel={closeDeleteModal}
          data={deleteEntryId}
          loading={deleteEntryIsLoading}
          destructive
        >
          <p>Are you sure you want to delete this entry? This action cannot be undone.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default FlaggedEntriesCard;