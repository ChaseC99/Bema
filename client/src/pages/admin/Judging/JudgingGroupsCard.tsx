import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import ActionMenu from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import useAppError from "../../../util/errors";
import request from "../../../util/request";

type Group = {
  id: string
  name: string
  isActive: boolean
}

type GetAllGroupsResponse = {
  groups: Group[]
}

const GET_ALL_GROUPS = gql`
  query GetAllJudgingGroups {
    groups: allJudgingGroups {
      id
      name
      isActive
    }
  }
`;

type JudgingGroupMutationResponse = {
  group: Group
}

const CREATE_JUDGING_GROUP = gql`
  mutation CreateJudgingGroup($input: CreateJudgingGroupInput!) {
    group: createJudgingGroup(input: $input) {
      id
      name
      isActive
    }
  }
`;

const EDIT_JUDGING_GROUP = gql`
  mutation EditJudgingGroup($id: ID!, $input: EditJudgingGroupInput!) {
    editJudgingGroup(id: $id, input: $input) {
      id
      name
      isActive
    }
  }
`;

const DELETE_JUDGING_GROUP = gql`
  mutation DeleteJudgingGroup($id: ID!) {
    deleteJudgingGroup(id: $id) {
      id
      name
      isActive
    }
  }
`;

function JudgingGroupsCard() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [showCreateGroupModal, setShowCreateGroupModal] = useState<boolean>(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);

  const { loading, data: groupsData, refetch } = useQuery<GetAllGroupsResponse>(GET_ALL_GROUPS, { onError: handleGQLError });
  const [createGroup, { loading: createGroupIsLoading }] = useMutation<JudgingGroupMutationResponse>(CREATE_JUDGING_GROUP, { onError: handleGQLError });
  const [editGroup, { loading: editGroupIsLoading }] = useMutation<JudgingGroupMutationResponse>(EDIT_JUDGING_GROUP, { onError: handleGQLError });
  const [deleteGroup, { loading: deleteGroupIsLoading }] = useMutation<JudgingGroupMutationResponse>(DELETE_JUDGING_GROUP, { onError: handleGQLError });

  const openCreateGroupModal = () => {
    setShowCreateGroupModal(true);
  }

  const closeCreateGroupModal = () => {
    setShowCreateGroupModal(false);
  }

  const handleCreateGroup = async (values: { [name: string]: any }) => {
    await createGroup({
      variables: {
        input: {
          name: values.name
        }
      }
    });

    refetch();
    closeCreateGroupModal();
  }

  const openEditGroupModal = (id: string) => {
    const group = groupsData?.groups.find((g) => g.id === id) || null;
    setGroupToEdit(group);
  }

  const closeEditGroupModal = () => {
    setGroupToEdit(null);
  }

  const handleEditGroup = async (values: { [name: string]: any }) => {
    if (!groupToEdit) {
      return;
    }

    await editGroup({
      variables: {
        id: groupToEdit.id,
        input: {
          name: values.name,
          isActive: values.is_active
        }
      }
    });

    refetch();
    closeEditGroupModal();
  }

  const openDeleteGroupModal = (id: number) => {
    setDeleteGroupId(id);
  }

  const closeDeleteGroupModal = () => {
    setDeleteGroupId(null);
  }

  const handleDeleteGroup = async (id: number) => {
    await deleteGroup({
      variables: {
        id: id
      }
    });

    refetch();
    closeDeleteGroupModal();
  }

  return (
    <React.Fragment>
      <article className="card col-12" style={{ paddingBottom: "16px" }}>
        <div className="card-header">
          <h3>Judging Groups</h3>
          {(state.isAdmin || state.user?.permissions.manage_judging_groups) &&
            <Button type="tertiary" role="button" action={openCreateGroupModal} text="Create Group" />
          }
        </div>
        <div className="card-body">
          {loading && <LoadingSpinner size="MEDIUM" />}

          {!loading &&
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
                {groupsData ? groupsData.groups.map((g) => {
                  return (
                    <Row key={g.id}>
                      <Cell>{g.id}</Cell>
                      <Cell>{g.name}</Cell>
                      <Cell>{g.isActive ? "Active" : "Inactive"}</Cell>
                      {(state.isAdmin || state.user?.permissions.manage_judging_groups) ? (
                        <Cell>
                          <ActionMenu
                            actions={[
                              {
                                role: "button",
                                action: openEditGroupModal,
                                text: "Edit",
                                data: g.id
                              },
                              {
                                role: "button",
                                action: openDeleteGroupModal,
                                text: "Delete",
                                data: g.id
                              }
                            ]}
                          />
                        </Cell>
                      ) : ""}
                    </Row>
                  );
                }) : ""}
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
          loading={createGroupIsLoading}
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

      {groupToEdit &&
        <FormModal
          title="Edit Group"
          submitLabel="Save"
          handleSubmit={handleEditGroup}
          handleCancel={closeEditGroupModal}
          cols={4}
          loading={editGroupIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "name",
              id: "name",
              label: "Group Name",
              size: "LARGE",
              defaultValue: groupToEdit.name,
              required: true
            },
            {
              fieldType: "CHECKBOX",
              name: "is_active",
              id: "is-active",
              label: "Active",
              description: "Evaluators and entries can only be assigned to active groups.",
              size: "LARGE",
              defaultValue: groupToEdit.isActive
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
          loading={deleteGroupIsLoading}
          destructive
        >
          <p>Are you sure you want to delete this group? This will unassign all entries and evaluators that are assigned to the group.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default JudgingGroupsCard;