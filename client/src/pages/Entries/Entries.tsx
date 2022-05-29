import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ActionMenu, { Action } from "../../shared/ActionMenu";
import ExternalLink from "../../shared/ExternalLink";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../shared/Modals";
import ContestsSidebar from "../../shared/Sidebars/ContestsSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import useAppState from "../../state/useAppState";
import request from "../../util/request";
import { gql, useQuery } from "@apollo/client";
import useAppError from "../../util/errors";

type GetEntriesResponse = {
  entries: Entry[]
}

type Entry = {
  id: string
  url: string
  kaid: string
  title: string
  author: {
    name: string
    kaid: string
  }
  skillLevel: string | null
  created: string
  group: {
    id: string
    name: string
  } | null
  isFlagged: boolean | null
  isDisqualified: boolean | null
  isSkillLevelLocked: boolean | null
}

const GET_ENTRIES = gql`
  query GetEntries {
    entries(contestId:"71") {
      id
      url
      kaid
      title
      author {
        name
        kaid
      }
      skillLevel
      created
      group {
        id
        name
      }
      isFlagged
      isDisqualified
      isSkillLevelLocked
    }
  }
`;

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

type Group = {
  id: string
  name: string
}

type GetActiveGroupsResponse = {
  groups: Group[]
}

const GET_ACTIVE_GROUPS = gql`
  query GetActiveGroups {
    groups: activeJudgingGroups {
      id
      name
    }
  }
`;

function Entries() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const { contestId } = useParams();
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [showConfirmImport, setShowConfirmImport] = useState<boolean>(false);
  const [showImportSingleEntryForm, setShowImportSingleEntryForm] = useState<boolean>(false);
  const [showConfirmAssignAll, setShowConfirmAssignAll] = useState<boolean>(false);
  const [showConfirmAssignNew, setShowConfirmAssignNew] = useState<boolean>(false);
  const [showTransferGroupsForm, setShowTransferGroupsForm] = useState<boolean>(false);

  const { loading: groupsIsLoading, data: groupsData } = useQuery<GetActiveGroupsResponse>(GET_ACTIVE_GROUPS, { onError: handleGQLError });

  const { loading: contestIsLoading } = useQuery<GetContestResponse | null>(GET_CONTEST, {
    variables: {
      id: contestId
    },
    onError: handleGQLError
  });

  const { loading: entriesIsLoading, data: entriesData, refetch: refetchEntries } = useQuery<GetEntriesResponse>(GET_ENTRIES, { onError: handleGQLError });

  const showEditEntryForm = (id: string) => {
    const entry = entriesData?.entries.find((e) => e.id === id) as Entry;
    setEditEntry(entry);
  }

  const hideEditEntryForm = () => {
    setEditEntry(null);
  }

  const handleEditEntry = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/entries", {
      edit_entry_id: editEntry?.id,
      edit_entry_title: values.title,
      edit_entry_author: values.author,
      edit_entry_level: values.skill_level,
      edit_entry_level_locked: values.skill_level_locked,
      edit_entry_group: values.group,
      edit_flagged: values.flagged,
      edit_disqualified: values.disqualified,
    });

    refetchEntries();
    hideEditEntryForm();
  }

  const openConfirmDeleteEntryModal = (id: number) => {
    setDeleteEntryId(id);
  }

  const closeConfirmDeleteEntryModal = () => {
    setDeleteEntryId(null);
  }

  const handleDeleteEntry = async (id: number) => {
    await request("DELETE", "/api/internal/entries", {
      entry_id: id
    });

    refetchEntries();
    closeConfirmDeleteEntryModal();
  }

  const openImportConfirmModal = () => {
    setShowConfirmImport(true);
  }

  const closeImportConfirmModal = () => {
    setShowConfirmImport(false);
  }

  const handleEntryImport = async () => {
    await request("POST", "/api/internal/entries/import", {
      contest_id: contestId
    });

    closeImportConfirmModal();

    window.location.reload();
  }

  const showImportIndividualEntryForm = () => {
    setShowImportSingleEntryForm(true);
  }

  const hideImportIndividualEntryForm = () => {
    setShowImportSingleEntryForm(false);
  }

  const handleImportIndividualEntry = async (values: { [name: string]: any }) => {
    // TODO: Make call to API to import a single entry
  }

  const openConfirmAssignAllEntriesModal = () => {
    setShowConfirmAssignAll(true);
  }

  const closeConfirmAssignAllEntriesModal = () => {
    setShowConfirmAssignAll(false);
  }

  const handleAssignAllEntries = async () => {
    await request("PUT", "/api/internal/entries/assignToGroups", {
      contest_id: contestId,
      assignAll: true
    });

    refetchEntries();
    closeConfirmAssignAllEntriesModal();
  }

  const openConfirmAssignNewEntriesModal = () => {
    setShowConfirmAssignNew(true);
  }

  const closeConfirmAssignNewEntriesModal = () => {
    setShowConfirmAssignNew(false);
  }

  const handleAssignNewEntries = async () => {
    await request("PUT", "/api/internal/entries/assignToGroups", {
      contest_id: contestId,
      assignAll: false
    });

    refetchEntries();
    closeConfirmAssignNewEntriesModal();
  }

  const openTransferGroupsForm = () => {
    setShowTransferGroupsForm(true);
  }

  const closeTransferGroupsForm = () => {
    setShowTransferGroupsForm(false);
  }

  const handleTransferGroups = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/entries/transferEntryGroups", {
      contest_id: contestId,
      current_entry_group: values.old_group,
      new_entry_group: values.new_group
    });

    refetchEntries();
    closeTransferGroupsForm();
  }

  return (
    <React.Fragment>
      <ContestsSidebar rootPath="/entries" />

      <section id="entries-page-section" className="container col-12">
        <div className="col-12">
          <div className="section-header col-12">
            <h2 data-testid="entries-page-section-header">Entries</h2>

            <span className="section-actions" data-testid="entries-section-actions">
              {(state.is_admin || state.user?.permissions.add_entries) &&
                <ActionMenu
                  actions={[
                    {
                      role: "button",
                      action: openImportConfirmModal,
                      text: "All Entries"
                    },
                    {
                      role: "button",
                      action: showImportIndividualEntryForm,
                      text: "Single Entry",
                      disabled: true
                    }
                  ]}
                  label="Import Entries"
                />
              }
              {(state.is_admin || state.user?.permissions.assign_entry_groups) &&
                <ActionMenu
                  actions={[
                    {
                      role: "button",
                      action: openConfirmAssignAllEntriesModal,
                      text: "Assign All"
                    },
                    {
                      role: "button",
                      action: openConfirmAssignNewEntriesModal,
                      text: "Assign New"
                    },
                    {
                      role: "button",
                      action: openTransferGroupsForm,
                      text: "Transfer"
                    }
                  ]}
                  label="Update Groups"
                />
              }
            </span>
          </div>

          {(entriesIsLoading || groupsIsLoading || contestIsLoading) && <LoadingSpinner size="LARGE" />}

          {(!(entriesIsLoading || groupsIsLoading || contestIsLoading) && entriesData) &&
            <Table>
              <TableHead>
                <Row>
                  <Cell header>ID</Cell>
                  <Cell header>Title</Cell>
                  <Cell header>Author</Cell>
                  <Cell header>Created</Cell>
                  <Cell header requireLoggedIn>Skill Level</Cell>
                  <Cell header requireLoggedIn>Group</Cell>
                  <Cell header permissions={["edit_entries", "delete_entries"]}></Cell>
                </Row>
              </TableHead>
              <TableBody>
                {entriesData.entries.map((e) => {
                  if (!state.logged_in) {
                    return (
                      <Row key={e.id}>
                        <Cell>{e.id}</Cell>
                        <Cell><ExternalLink to={e.url}>{e.title}</ExternalLink></Cell>
                        <Cell>{e.author.name}</Cell>
                        <Cell>{e.created}</Cell>
                      </Row>
                    );
                  }

                  const actions: Action[] = [];
                  if (state.is_admin || state.user?.permissions.edit_entries) {
                    actions.push({
                      role: "button",
                      action: showEditEntryForm,
                      text: "Edit",
                      data: e.id
                    });
                  }

                  if (state.is_admin || state.user?.permissions.delete_entries) {
                    actions.push({
                      role: "button",
                      action: openConfirmDeleteEntryModal,
                      text: "Delete",
                      data: e.id
                    });
                  }

                  return (
                    <Row key={e.id}>
                      <Cell>{e.id}</Cell>
                      <Cell><ExternalLink to={e.url}>{e.title}</ExternalLink></Cell>
                      <Cell><Link to={"/contestants/" + e.author.kaid}>{e.author.name}</Link></Cell>
                      <Cell>{e.created}</Cell>
                      <Cell>{e.skillLevel || ""}</Cell>
                      <Cell>{e.group ? e.group.name : "None"}</Cell>
                      <Cell>
                        <ActionMenu actions={actions} />
                      </Cell>
                    </Row>
                  );
                })}
              </TableBody>
            </Table>
          }
        </div>
      </section>

      {editEntry &&
        <FormModal
          title="Edit Entry"
          submitLabel="Save"
          handleSubmit={handleEditEntry}
          handleCancel={hideEditEntryForm}
          cols={4}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "title",
              id: "title",
              size: "LARGE",
              label: "Title",
              defaultValue: editEntry.title,
              required: true
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "author",
              id: "author",
              size: "LARGE",
              label: "Author",
              defaultValue: editEntry.author.name,
              required: true
            },
            {
              fieldType: "SELECT",
              name: "skill_level",
              id: "skill-level",
              size: "MEDIUM",
              label: "Skill Level",
              defaultValue: editEntry.skillLevel,
              choices: [
                {
                  text: "TBD",
                  value: "TBD"
                },
                {
                  text: "Beginner",
                  value: "Beginner"
                },
                {
                  text: "Intermediate",
                  value: "Intermediate"
                },
                {
                  text: "Advanced",
                  value: "Advanced"
                }
              ],
              required: true
            },
            {
              fieldType: "SELECT",
              name: "group",
              id: "group",
              size: "MEDIUM",
              label: "Assigned Group",
              defaultValue: editEntry.group?.id,
              choices: groupsData ? groupsData.groups.map((g) => {
                return {
                  text: g.id + " - " + g.name,
                  value: g.id
                }
              }) : [],
              disabled: !(state.is_admin || state.user?.permissions.assign_entry_groups)
            },
            {
              fieldType: "CHECKBOX",
              name: "skill_level_locked",
              id: "skill-level-locked",
              size: "LARGE",
              label: "Level Locked",
              description: "Prevents the skill level from automatically being updated upon new evaluations.",
              defaultValue: editEntry.isSkillLevelLocked || false
            },
            {
              fieldType: "CHECKBOX",
              name: "flagged",
              id: "flagged",
              size: "LARGE",
              label: "Flagged",
              description: "Flagged entries are not shown in the judging queue for evaluators.",
              defaultValue: editEntry.isFlagged || false
            },
            {
              fieldType: "CHECKBOX",
              name: "disqualified",
              id: "disqualified",
              size: "LARGE",
              label: "Disqualified",
              description: "Disqualified entries are marked as removed from the contest.",
              defaultValue: editEntry.isDisqualified || false
            }
          ]}
        />
      }

      {deleteEntryId &&
        <ConfirmModal
          title="Delete entry?"
          confirmLabel="Delete"
          handleConfirm={handleDeleteEntry}
          handleCancel={closeConfirmDeleteEntryModal}
          destructive
          data={deleteEntryId}
        >
          <p>Are you sure you want to delete this entry? All data associated with this entry will be permanently deleted.</p>
          <p>To remove an entry from the contest while still preserving its data, disqualify the entry instead.</p>
        </ConfirmModal>
      }

      {showConfirmImport &&
        <ConfirmModal
          title="Import entries?"
          confirmLabel="Import"
          handleConfirm={handleEntryImport}
          handleCancel={closeImportConfirmModal}
        >
          <p>Are you sure you want to import entries? This will add all new spin-offs of the contest program that were created since the most recently imported entry.</p>
        </ConfirmModal>
      }

      {showImportSingleEntryForm &&
        <FormModal
          title="Add Entry"
          submitLabel="Add Entry"
          handleSubmit={handleImportIndividualEntry}
          handleCancel={hideImportIndividualEntryForm}
          cols={4}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "program_id",
              id: "program-id",
              size: "LARGE",
              label: "Entry ID",
              description: "The program ID is the last part of the program URL.",
              defaultValue: "",
              required: true
            }
          ]}
        />
      }

      {showConfirmAssignAll &&
        <ConfirmModal
          title="Assign all entries to groups?"
          confirmLabel="Assign Groups"
          handleConfirm={handleAssignAllEntries}
          handleCancel={closeConfirmAssignAllEntriesModal}
        >
          <p>Are you sure you want to assign all entries to groups? This will evenly assign all entries to the active groups, even if the entry is already assigned to a group.</p>
        </ConfirmModal>
      }

      {showConfirmAssignNew &&
        <ConfirmModal
          title="Assign new entries to groups?"
          confirmLabel="Assign Groups"
          handleConfirm={handleAssignNewEntries}
          handleCancel={closeConfirmAssignNewEntriesModal}
        >
          <p>Are you sure you want to assign all new entries to groups? This will allow evaluators to score the entries if judging for the contest is enabled.</p>
        </ConfirmModal>
      }

      {showTransferGroupsForm &&
        <FormModal
          title="Transfer Groups"
          submitLabel="Transfer"
          handleSubmit={handleTransferGroups}
          handleCancel={closeTransferGroupsForm}
          cols={4}
          fields={[
            {
              fieldType: "SELECT",
              name: "old_group",
              id: "old-group",
              size: "MEDIUM",
              label: "Old Group",
              placeholder: "Select a group",
              defaultValue: "",
              required: true,
              choices: groupsData ? groupsData.groups.map((g) => {
                return {
                  text: g.id + " - " + g.name,
                  value: g.id
                }
              }) : [],
            },
            {
              fieldType: "SELECT",
              name: "new_group",
              id: "new-group",
              size: "MEDIUM",
              label: "New Group",
              placeholder: "Select a group",
              defaultValue: "",
              required: true,
              choices: groupsData ? groupsData.groups.map((g) => {
                return {
                  text: g.id + " - " + g.name,
                  value: g.id
                }
              }) : [],
            }
          ]}
        />
      }
    </React.Fragment>
  );
}

export default Entries;