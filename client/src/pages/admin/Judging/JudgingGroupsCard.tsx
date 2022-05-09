import React, { useEffect, useState } from "react";
import ActionMenu from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import request from "../../../util/request";
import { fetchJudgingGroups } from "./fetchData";

type Group = {
  group_id: number
  group_name: string
  is_active: boolean
}

function JudgingGroupsCard() {
  const { state } = useAppState();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState<boolean>(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);

  useEffect(() => {
    fetchJudgingGroups()
      .then((data) => {
        setGroups(data.groups);
        setIsLoading(false);
      });
  }, []);

  const openCreateGroupModal = () => {
    setShowCreateGroupModal(true);
  }

  const closeCreateGroupModal = () => {
    setShowCreateGroupModal(false);
  }

  const handleCreateGroup = async (values: { [name: string]: any }) => {
    await request("POST", "/api/internal/admin/addEvaluatorGroup", {
      group_name: values.name
    });

    closeCreateGroupModal();
    window.location.reload();
  }

  const openEditGroupModal = (id: number) => {
    const group = groups.find((g) => g.group_id === id) || null;
    setEditGroup(group);
  }

  const closeEditGroupModal = () => {
    setEditGroup(null);
  }

  const handleEditGroup = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/admin/editEvaluatorGroup", {
      group_id: editGroup?.group_id,
      group_name: values.name,
      is_active: values.is_active
    });

    const newGroups = [...groups];
    for (let i = 0; i < newGroups.length; i++) {
      if (newGroups[i].group_id === editGroup?.group_id) {
        newGroups[i].group_name = values.name;
        newGroups[i].is_active = values.is_active;
        break;
      }
    }
    setGroups(newGroups);

    closeEditGroupModal();
  }

  const openDeleteGroupModal = (id: number) => {
    setDeleteGroupId(id);
  }

  const closeDeleteGroupModal = () => {
    setDeleteGroupId(null);
  }

  const handleDeleteGroup = async (id: number) => {
    await request("DELETE", "/api/internal/admin/deleteEvaluatorGroup", {
      group_id: id
    });

    const newGroups = groups.filter((g) => g.group_id !== id);
    setGroups(newGroups);
    closeDeleteGroupModal();
  }

  return (
    <React.Fragment>
      <article className="card col-12" style={{ paddingBottom: "16px" }}>
        <div className="card-header">
          <h3>Judging Groups</h3>
          {(state.is_admin || state.user?.permissions.manage_judging_groups) &&
            <Button type="tertiary" role="button" action={openCreateGroupModal} text="Create Group" />
          }
        </div>
        <div className="card-body">
          {isLoading && <LoadingSpinner size="MEDIUM" />}

          {!isLoading &&
            <Table noCard>
              <TableHead>
                <Row>
                  <Cell header>ID</Cell>
                  <Cell header>Name</Cell>
                  <Cell header>Status</Cell>
                  <Cell header permissions={["manage_judging_groups"]} width="12px"></Cell>
                </Row>
              </TableHead>
              <TableBody>
                {groups.map((g) => {
                  return (
                    <Row key={g.group_id}>
                      <Cell>{g.group_id}</Cell>
                      <Cell>{g.group_name}</Cell>
                      <Cell>{g.is_active ? "Active" : "Inactive"}</Cell>
                      {(state.is_admin || state.user?.permissions.manage_judging_groups) ? (
                        <Cell>
                          <ActionMenu
                            actions={[
                              {
                                role: "button",
                                action: openEditGroupModal,
                                text: "Edit",
                                data: g.group_id
                              },
                              {
                                role: "button",
                                action: openDeleteGroupModal,
                                text: "Delete",
                                data: g.group_id
                              }
                            ]}
                          />
                        </Cell>
                      ) : ""}
                    </Row>
                  );
                })}
              </TableBody>
            </Table>
          }
        </div>
      </article>

      {showCreateGroupModal &&
        <FormModal
          title="Create Judging Group"
          submitLabel="Create"
          handleSubmit={handleCreateGroup}
          handleCancel={closeCreateGroupModal}
          cols={4}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "name",
              id: "name",
              label: "Group Name",
              size: "LARGE",
              defaultValue: "",
              required: true
            }
          ]}
        />
      }

      {editGroup &&
        <FormModal
          title="Edit Group"
          submitLabel="Save"
          handleSubmit={handleEditGroup}
          handleCancel={closeEditGroupModal}
          cols={4}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "name",
              id: "name",
              label: "Group Name",
              size: "LARGE",
              defaultValue: editGroup.group_name,
              required: true
            },
            {
              fieldType: "CHECKBOX",
              name: "is_active",
              id: "is-active",
              label: "Active",
              description: "Evaluators and entries can only be assigned to active groups.",
              size: "LARGE",
              defaultValue: editGroup.is_active
            }
          ]}
        />
      }

      {deleteGroupId &&
        <ConfirmModal
          title="Delete group?"
          confirmLabel="Delete"
          handleConfirm={handleDeleteGroup}
          handleCancel={closeDeleteGroupModal}
          data={deleteGroupId}
          destructive
        >
          <p>Are you sure you want to delete this group? This will unassign all entries and evaluators that are assigned to the group.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default JudgingGroupsCard;