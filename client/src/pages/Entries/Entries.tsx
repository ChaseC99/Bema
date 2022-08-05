import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ActionMenu, { Action } from "../../shared/ActionMenu";
import ExternalLink from "../../shared/ExternalLink";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../shared/Modals";
import ContestsSidebar from "../../shared/Sidebars/ContestsSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import useAppState from "../../state/useAppState";
import { gql, useMutation, useQuery } from "@apollo/client";
import useAppError from "../../util/errors";
import Badge from "../../shared/Badge";

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
  height: number
  isFlagged: boolean | null
  isDisqualified: boolean | null
  isSkillLevelLocked: boolean | null
}

const GET_ENTRIES = gql`
  query GetEntries($contestId: ID!) {
    entries(contestId: $contestId) {
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
      height
      isFlagged
      isDisqualified
      isSkillLevelLocked
    }
  }
`;

type EditEntryResponse = {
  entry: Entry
}

const EDIT_ENTRY = gql`
  mutation EditEntry($id: ID!, $input: EditEntryInput!) {
    entry: editEntry(id: $id, input: $input) {
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
      height
      isFlagged
      isDisqualified
      isSkillLevelLocked
    }
  }
`;

type DeleteEntryResponse = {
  entry: {
    id: string
  } | null
}

const DELETE_ENTRY = gql`
  mutation DeleteEntry($id: ID!) {
    entry: deleteEntry(id: $id) {
      id
      isFlagged
      isDisqualified
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

type ImportEntriesResponse =  {
  success: boolean
}

const IMPORT_ENTRIES = gql`
  mutation ImportEntries($contestId: ID!) {
    success: importEntries(contestId: $contestId)
  }
`;

type ImportEntryResponse = {
  entry: Entry
}

const IMPORT_ENTRY = gql`
  mutation ImportEntry($contestId: ID!, $kaid: String!) {
    importEntry(contestId: $contestId, kaid: $kaid) {
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
      height
      isFlagged
      isDisqualified
      isSkillLevelLocked
    }
  }
`;

type AssignEntriesResponse = {
  success: boolean
}

const ASSIGN_ALL_ENTRIES = gql`
  mutation AssignAllEntriesToGroups($contestId: ID!) {
    success: assignAllEntriesToGroups(contestId: $contestId)
  }
`;

const ASSIGN_NEW_ENTRIES = gql`
  mutation AssignAllEntriesToGroups($contestId: ID!) {
    assignNewEntriesToGroups(contestId: $contestId)
  }
`;

type TransferEntriesResponse = {
  success: true
}

const TRANSFER_ENTRIES = gql`
  mutation TransferEntryGroups($contest: ID!, $prevGroup: ID!, $newGroup: ID!) {
    transferEntryGroups(contest: $contest, prevGroup: $prevGroup, newGroup: $newGroup)
  }
`;

function Entries() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const { contestId } = useParams();
  const [entryToEdit, setEntryToEdit] = useState<Entry | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [showConfirmImport, setShowConfirmImport] = useState<boolean>(false);
  const [showImportSingleEntryForm, setShowImportSingleEntryForm] = useState<boolean>(false);
  const [showConfirmAssignAll, setShowConfirmAssignAll] = useState<boolean>(false);
  const [showConfirmAssignNew, setShowConfirmAssignNew] = useState<boolean>(false);
  const [showTransferGroupsForm, setShowTransferGroupsForm] = useState<boolean>(false);

  const { loading: groupsIsLoading, data: groupsData } = useQuery<GetActiveGroupsResponse>(GET_ACTIVE_GROUPS, { onError: handleGQLError });
  const [editEntry, { loading: editEntryIsLoading }] = useMutation<EditEntryResponse>(EDIT_ENTRY, { onError: handleGQLError });
  const [deleteEntry, { loading: deleteEntryIsLoading }] = useMutation<DeleteEntryResponse>(DELETE_ENTRY, { onError: handleGQLError });
  const [importEntries, { loading: importEntriesIsLoading }] = useMutation<ImportEntriesResponse>(IMPORT_ENTRIES, { onError: handleGQLError });
  const [importEntry, { loading: importEntryIsLoading }] = useMutation<ImportEntryResponse>(IMPORT_ENTRY, { onError: handleGQLError });
  const [assignAllEntries, { loading: assignAllEntriesIsLoading }] = useMutation<AssignEntriesResponse>(ASSIGN_ALL_ENTRIES, { onError: handleGQLError });
  const [assignNewEntries, { loading: assignNewEntriesIsLoading }] = useMutation<AssignEntriesResponse>(ASSIGN_NEW_ENTRIES, { onError: handleGQLError });
  const [transferEntries, { loading: transferEntriesIsLoading }] = useMutation<TransferEntriesResponse>(TRANSFER_ENTRIES, { onError: handleGQLError });
  
  const { loading: contestIsLoading } = useQuery<GetContestResponse | null>(GET_CONTEST, {
    variables: {
      id: contestId
    },
    onError: handleGQLError
  });

  const { loading: entriesIsLoading, data: entriesData, refetch: refetchEntries } = useQuery<GetEntriesResponse>(GET_ENTRIES, { 
    variables: {
      contestId: contestId
    },
    onError: handleGQLError 
  });

  const showEditEntryForm = (id: string) => {
    const entry = entriesData?.entries.find((e) => e.id === id) as Entry;
    setEntryToEdit(entry);
  }

  const hideEditEntryForm = () => {
    setEntryToEdit(null);
  }

  const handleEditEntry = async (values: { [name: string]: any }) => {
    if (!entryToEdit) {
      return;
    }

    await editEntry({
      variables: {
        id: entryToEdit.id,
        input: {
          title: values.title,
          skillLevel: values.skill_level,
          height: values.height,
          group: values.group,
          isFlagged: values.flagged,
          isDisqualified: values.disqualified,
          isSkillLevelLocked: values.skill_level_locked
        }
      }
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
    await deleteEntry({
      variables: {
        id: id
      }
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
    await importEntries({
      variables: {
        contestId: contestId
      }
    });

    refetchEntries();
    closeImportConfirmModal();
  }

  const showImportIndividualEntryForm = () => {
    setShowImportSingleEntryForm(true);
  }

  const hideImportIndividualEntryForm = () => {
    setShowImportSingleEntryForm(false);
  }

  const handleImportIndividualEntry = async (values: { [name: string]: any }) => {
    await importEntry({
      variables: {
        contestId: contestId,
        kaid: values.kaid
      }
    });

    refetchEntries();
    hideImportIndividualEntryForm();
  }

  const openConfirmAssignAllEntriesModal = () => {
    setShowConfirmAssignAll(true);
  }

  const closeConfirmAssignAllEntriesModal = () => {
    setShowConfirmAssignAll(false);
  }

  const handleAssignAllEntries = async () => {
    await assignAllEntries({
      variables: {
        contestId: contestId
      }
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
    await assignNewEntries({
      variables: {
        contestId: contestId
      }
    })

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
    await transferEntries({
      variables: {
        contest: contestId,
        prevGroup: values.old_group,
        newGroup: values.new_group
      }
    });

    refetchEntries();
    closeTransferGroupsForm();
  }

  return (
    <React.Fragment>
      <ContestsSidebar rootPath="/entries" />

      <section id="entries-page-section" className="container col-12" style={{ marginBottom: "150px" }}>
        <div className="col-12">
          <div className="section-header col-12">
            <h2 data-testid="entries-page-section-header">Entries</h2>

            <span className="section-actions" data-testid="entries-section-actions">
              {(state.isAdmin || state.user?.permissions.add_entries) &&
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
                    }
                  ]}
                  label="Import Entries"
                />
              }
              {(state.isAdmin || state.user?.permissions.assign_entry_groups) &&
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
                      text: "Transfer",
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
                  if (!state.loggedIn) {
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
                  if (state.isAdmin || state.user?.permissions.edit_entries) {
                    actions.push({
                      role: "button",
                      action: showEditEntryForm,
                      text: "Edit",
                      data: e.id
                    });
                  }

                  if (state.isAdmin || state.user?.permissions.delete_entries) {
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
                      <Cell><ExternalLink to={e.url}>{e.title}</ExternalLink>{e.isFlagged ? <Badge type="secondary" text="Flagged" color="#d92916" /> : ''}{e.isDisqualified ? <Badge type="primary" text="Disqualified" color="#d92916" /> : ''}</Cell>
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

      {entryToEdit &&
        <FormModal
          title="Edit Entry"
          submitLabel="Save"
          handleSubmit={handleEditEntry}
          handleCancel={hideEditEntryForm}
          cols={4}
          loading={editEntryIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "title",
              id: "title",
              size: "LARGE",
              label: "Title",
              defaultValue: entryToEdit.title,
              required: true
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "height",
              id: "height",
              size: "LARGE",
              label: "Height",
              defaultValue: entryToEdit.height.toString(),
              required: true
            },
            {
              fieldType: "SELECT",
              name: "skill_level",
              id: "skill-level",
              size: "MEDIUM",
              label: "Skill Level",
              defaultValue: entryToEdit.skillLevel,
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
              defaultValue: entryToEdit.group?.id,
              choices: groupsData ? groupsData.groups.map((g) => {
                return {
                  text: g.id + " - " + g.name,
                  value: g.id
                }
              }) : [],
              disabled: !(state.isAdmin || state.user?.permissions.assign_entry_groups)
            },
            {
              fieldType: "CHECKBOX",
              name: "skill_level_locked",
              id: "skill-level-locked",
              size: "LARGE",
              label: "Level Locked",
              description: "Prevents the skill level from automatically being updated upon new evaluations.",
              defaultValue: entryToEdit.isSkillLevelLocked || false
            },
            {
              fieldType: "CHECKBOX",
              name: "flagged",
              id: "flagged",
              size: "LARGE",
              label: "Flagged",
              description: "Flagged entries are not shown in the judging queue for evaluators.",
              defaultValue: entryToEdit.isFlagged || false
            },
            {
              fieldType: "CHECKBOX",
              name: "disqualified",
              id: "disqualified",
              size: "LARGE",
              label: "Disqualified",
              description: "Disqualified entries are marked as removed from the contest.",
              defaultValue: entryToEdit.isDisqualified || false
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
          loading={deleteEntryIsLoading}
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
          loading={importEntriesIsLoading}
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
          loading={importEntryIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "kaid",
              id: "kaid",
              size: "LARGE",
              label: "Entry KAID",
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
          loading={assignAllEntriesIsLoading}
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
          loading={assignNewEntriesIsLoading}
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
          loading={transferEntriesIsLoading}
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