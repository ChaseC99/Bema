import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../shared/Button";
import ExternalLink from "../../../shared/ExternalLink";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import request from "../../../util/request";
import { fetchFlaggedEntries } from "./fetchData";

type Entry = {
  assigned_group_id: number
  contest_id: number
  disqualified: boolean
  entry_author: string
  entry_author_kaid: string
  entry_created: string
  entry_height: number
  entry_id: number
  entry_kaid: string
  entry_level: string
  entry_level_locked: boolean
  entry_title: string
  entry_url: string
  entry_votes: number
  flagged: boolean
  is_winner: boolean
}

function FlaggedEntriesCard() {
  const { state } = useAppState();
  const [flaggedEntries, setFlaggedEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [disqualifyEntryId, setDisqualifyEntryId] = useState<number | null>();

  useEffect(() => {
    fetchFlaggedEntries()
      .then((data) => {
        setFlaggedEntries(data.flaggedEntries);
        setIsLoading(false);
      });
  }, []);

  const handleApprove = (id: number) => {

  }

  const openDisqualifyModal = (id: number) => {
    setDisqualifyEntryId(id);
  }

  const closeDisqualifyModal = () => {
    setDisqualifyEntryId(null);
  }

  const handleDisqualify = async (id: number) => {
    await request("PUT", "/api/internal/entries/disqualify", {
      entry_id: id
    });

    const newFlaggedEntries = flaggedEntries.filter((e) => e.entry_id !== id);
    setFlaggedEntries(newFlaggedEntries);

    closeDisqualifyModal();
  }

  const openDeleteModal = (id: number) => {

  }

  const closeDeleteModal = () => {

  }

  const handleDelete = (id: number) => {

  }

  if (isLoading) {
    return (
      <Table label="Flagged Entries">
        <LoadingSpinner size="MEDIUM" />
      </Table>
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
          {flaggedEntries.map((e) => {
            return (
              <Row key={e.entry_id}>
                <Cell>{e.entry_id}</Cell>
                <Cell><ExternalLink to={e.entry_url}>{e.entry_title}</ExternalLink></Cell>
                <Cell><Link to={"/contestants/" + e.entry_author_kaid}>{e.entry_author}</Link></Cell>
                <Cell>{e.entry_created}</Cell>
                <Cell>
                  {(state.is_admin || state.user?.permissions.edit_entries) ?
                    <React.Fragment>
                      <Button type="tertiary" role="button" action={handleApprove} text="Approve" data={e.entry_id} style={{ marginRight: "24px" }} />
                      <Button type="tertiary" role="button" action={openDisqualifyModal} text="Disqualify" destructive data={e.entry_id} style={{ marginRight: "24px" }} />
                    </React.Fragment>
                    : ""}
                  {(state.is_admin || state.user?.permissions.delete_entries) ?
                    <Button type="tertiary" role="button" action={openDeleteModal} text="Delete" destructive data={e.entry_id} />
                    : ""}
                </Cell>
              </Row>
            );
          })}
        </TableBody>
      </Table>

      {disqualifyEntryId &&
        <ConfirmModal
          title="Disqualify entry?"
          confirmLabel="Disqualify"
          handleConfirm={handleDisqualify}
          handleCancel={closeDisqualifyModal}
          data={disqualifyEntryId}
          destructive
        >
          <p>Are you sure you want to disqualify this entry? This will remove the entry from the judging queue for all users.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default FlaggedEntriesCard;