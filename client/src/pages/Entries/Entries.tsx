import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ActionMenu, { Action } from "../../shared/ActionMenu";
import ExternalLink from "../../shared/ExternalLink";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../shared/Modals";
import ContestsSidebar from "../../shared/Sidebars/ContestsSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import useAppState from "../../state/useAppState";
import request from "../../util/request";
import { fetchEntries, fetchEvaluatorGroups } from "./fetchEntries";

type Entry = {
  assigned_group_id: number
  contest_id: number
  disqualified: boolean
  entry_author: string
  entry_created: string
  entry_id: number
  entry_kaid: string
  entry_level: string
  entry_level_locked: boolean
  entry_title: string
  entry_url: string
  flagged: boolean
  group_name: string
  is_winner: boolean
}

type EntryPublic = {
  contest_id: number
  entry_author: string
  entry_created: string
  entry_id: number
  entry_kaid: string
  entry_title: string
  entry_url: string
}

type Group = {
  group_id: number
  group_name: string
  is_active: boolean
}

function Entries() {
  const { state } = useAppState();
  const { contestId } = useParams();
  const [entries, setEntries] = useState<Entry[] | EntryPublic[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);
  const [showConfirmImport, setShowConfirmImport] = useState<boolean>(false);
  const [showImportSingleEntryForm, setShowImportSingleEntryForm] = useState<boolean>(false);
  const [showConfirmAssignAll, setShowConfirmAssignAll] = useState<boolean>(false);
  const [showConfirmAssignNew, setShowConfirmAssignNew] = useState<boolean>(false);
  const [showTransferGroupsForm, setShowTransferGroupsForm] = useState<boolean>(false);

  useEffect(() => {
    fetchEntries(contestId || "")
      .then((data) => {
        setEntries(data.entries);

        fetchEvaluatorGroups()
          .then((data) => {
            setGroups(data.groups);
            setIsLoading(false);
          })
      });
  }, [contestId]);

  const showEditEntryForm = (id: number) => {
    const entry = entries.find((e) => e.entry_id === id) as Entry;
    setEditEntry(entry);
  }

  const hideEditEntryForm = () => {
    setEditEntry(null);
  }

  const handleEditEntry = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/entries", {
      edit_entry_id: editEntry?.entry_id,
      edit_entry_title: values.title,
      edit_entry_author: values.author,
      edit_entry_level: values.skill_level,
      edit_entry_level_locked: values.skill_level_locked,
      edit_entry_group: values.group,
      edit_flagged: values.flagged,
      edit_disqualified: values.disqualified,
    });

    const newEntries: Entry[] = [...entries as Entry[]];
    for (let i = 0; i < newEntries.length; i++) {
      if (newEntries[i].entry_id === editEntry?.entry_id) {
        newEntries[i].entry_title = values.title;
        newEntries[i].entry_author = values.author;
        newEntries[i].entry_level = values.skill_level;
        newEntries[i].entry_level_locked = values.skill_level_locked;
        newEntries[i].assigned_group_id = values.group;
        newEntries[i].group_name = groups.find((g) => g.group_id === values.group_id)?.group_name || "None";
        newEntries[i].flagged = values.flagged;
        newEntries[i].disqualified = values.disqualified;
        break;
      }
    }

    setEntries(newEntries);
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

    const newEntries = entries.filter((e) => e.entry_id !== id);
    setEntries(newEntries);
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

    closeConfirmAssignAllEntriesModal();
    window.location.reload();
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

    closeConfirmAssignNewEntriesModal();
    window.location.reload();
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

    closeTransferGroupsForm();
    window.location.reload();
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

          {isLoading && <LoadingSpinner size="LARGE" />}

          {!isLoading &&
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
                {entries.map((e) => {
                  if (!state.logged_in) {
                    const entry = e as unknown as EntryPublic;
                    return (
                      <Row key={entry.entry_id}>
                        <Cell>{entry.entry_id}</Cell>
                        <Cell><ExternalLink to={entry.entry_url}>{entry.entry_title}</ExternalLink></Cell>
                        <Cell>{entry.entry_author}</Cell>
                        <Cell>{entry.entry_created}</Cell>
                      </Row>
                    );
                  }

                  const entry = e as unknown as Entry;

                  const actions: Action[] = [];
                  if (state.is_admin || state.user?.permissions.edit_entries) {
                    actions.push({
                      role: "button",
                      action: showEditEntryForm,
                      text: "Edit",
                      data: entry.entry_id
                    });
                  }

                  if (state.is_admin || state.user?.permissions.delete_entries) {
                    actions.push({
                      role: "button",
                      action: openConfirmDeleteEntryModal,
                      text: "Delete",
                      data: entry.entry_id
                    });
                  }

                  return (

                    <Row key={entry.entry_id}>
                      <Cell>{entry.entry_id}</Cell>
                      <Cell>{entry.entry_title}</Cell>
                      <Cell>{entry.entry_author}</Cell>
                      <Cell>{entry.entry_created}</Cell>
                      <Cell>{entry.entry_level}</Cell>
                      <Cell>{entry.assigned_group_id ? entry.assigned_group_id : "None"}</Cell>
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
              defaultValue: editEntry.entry_title
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "author",
              id: "author",
              size: "LARGE",
              label: "Author",
              defaultValue: editEntry.entry_author
            },
            {
              fieldType: "SELECT",
              name: "skill_level",
              id: "skill-level",
              size: "MEDIUM",
              label: "Skill Level",
              defaultValue: editEntry.entry_level,
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
              ]
            },
            {
              fieldType: "SELECT", // TODO: Disable for users who can't assign entry groups
              name: "group",
              id: "group",
              size: "MEDIUM",
              label: "Assigned Group",
              defaultValue: editEntry.assigned_group_id,
              choices: groups.filter((g) => g.is_active).map((g) => {
                return {
                  text: g.group_id + " - " + g.group_name,
                  value: g.group_id
                }
              }),
              disabled: !(state.is_admin || state.user?.permissions.assign_entry_groups)
            },
            {
              fieldType: "CHECKBOX",
              name: "skill_level_locked",
              id: "skill-level-locked",
              size: "LARGE",
              label: "Level Locked",
              description: "Prevents the skill level from automatically being updated upon new evaluations.",
              defaultValue: editEntry.entry_level_locked
            },
            {
              fieldType: "CHECKBOX",
              name: "flagged",
              id: "flagged",
              size: "LARGE",
              label: "Flagged",
              description: "Flagged entries are not shown in the judging queue for evaluators.",
              defaultValue: editEntry.flagged
            },
            {
              fieldType: "CHECKBOX",
              name: "disqualified",
              id: "disqualified",
              size: "LARGE",
              label: "Disqualified",
              description: "Disqualified entries are marked as removed from the contest.",
              defaultValue: editEntry.disqualified
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
              choices: groups.filter((g) => g.is_active).map((g) => {
                return {
                  text: g.group_id + " - " + g.group_name,
                  value: g.group_id
                }
              })
            },
            {
              fieldType: "SELECT",
              name: "new_group",
              id: "new-group",
              size: "MEDIUM",
              label: "New Group",
              placeholder: "Select a group",
              defaultValue: "",
              choices: groups.filter((g) => g.is_active).map((g) => {
                return {
                  text: g.group_id + " - " + g.group_name,
                  value: g.group_id
                }
              })
            }
          ]}
        />
      }
    </React.Fragment>
  );
}

export default Entries;