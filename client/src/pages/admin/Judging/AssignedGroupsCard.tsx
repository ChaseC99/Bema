import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import ActionMenu from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import { FormFields } from "../../../shared/Forms";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { FormModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import useAppError from "../../../util/errors";
import request from "../../../util/request";

type Group = {
  id: string
  name: string
}

type User = {
  id: string
  nickname: string
  assignedGroup: Group | null
}

type GetAllUsersAndGroupsResponse = {
  users: User[]
}

type GetAllGroupsResponse = {
  groups: Group[]
}

const GET_ALL_USERS_AND_GROUPS = gql`
  query GetAllUsersAndGroups {
    users {
      id
      nickname
      assignedGroup {
        id
        name
      }
    }
  }
`;

const GET_ALL_GROUPS = gql`
  query GetAllActiveGroups {
    groups: activeJudgingGroups {
      id
      name
    }
  }
`;

const compareUserGroups = (a: User, b: User): number => {
  if (a.assignedGroup === null) {
    return -1;
  }
  if (b.assignedGroup === null) {
    return 1;
  }

  return parseInt(a.assignedGroup.id) - parseInt(b.assignedGroup.id);
}

function AssignedGroupsCard() {
  const { state } = useAppState();
  const [editAssignedGroup, setEditAssignedGroup] = useState<User | null>(null);
  const [showBulkEditModal, setShowBulkEditModal] = useState<boolean>(false);
  const { handleGQLError } = useAppError();

  const { loading: usersIsLoading, data: usersData, refetch: refetchUsers } = useQuery<GetAllUsersAndGroupsResponse>(GET_ALL_USERS_AND_GROUPS, { onError: handleGQLError });
  const { loading: groupsIsLoading, data: groupsData } = useQuery<GetAllGroupsResponse>(GET_ALL_GROUPS, { onError: handleGQLError });

  const openEditAllModal = () => {
    setShowBulkEditModal(true);
  }

  const closeEditAllModal = () => {
    setShowBulkEditModal(false);
  }

  const handleEditAll = (values: { [name: string]: any }) => {
    // const newAssignedGroups = [...assignedGroups];
    // for (let i = 0; i < newAssignedGroups.length; i++) {
    //   if (newAssignedGroups[i].group_id !== values[newAssignedGroups[i].evaluator_id]) {
    //     newAssignedGroups[i].group_id = values[newAssignedGroups[i].evaluator_id];
    //     newAssignedGroups[i].group_name = allGroups.find((g) => g.group_id === values[newAssignedGroups[i].evaluator_id])?.group_name || "";

    //     request("PUT", "/api/internal/users/assignToEvaluatorGroup", {
    //       group_id: values[newAssignedGroups[i].evaluator_id],
    //       evaluator_id: newAssignedGroups[i].evaluator_id
    //     });
    //   }
    // }

    // setAssignedGroups(newAssignedGroups);
    // closeEditAllModal();
  }

  const openEditIndividualModal = (evaluatorId: string) => {
    const a = usersData?.users.find((u) => u.id === evaluatorId) || null;
    setEditAssignedGroup(a);
  }

  const closeEditIndividualModal = () => {
    setEditAssignedGroup(null);
  }

  const handleEditIndividual = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/users/assignToEvaluatorGroup", {
      group_id: values.group_id,
      evaluator_id: editAssignedGroup?.id
    });

    refetchUsers();
    closeEditIndividualModal();
  }

  const createField = (user: User): FormFields => {
    return {
      fieldType: "SELECT",
      name: user.id,
      id: user.id,
      label: user.nickname,
      size: "LARGE",
      defaultValue: user.assignedGroup ? user.assignedGroup.id : null,
      choices: [...(groupsData ? groupsData.groups.map((g) => {
        return {
          text: g.id + " - " + g.name,
          value: g.id
        }
      }) : []), { text: "None", value: null }]
    }
  }

  return (
    <React.Fragment>
      <article className="card col-12" style={{ paddingBottom: "16px" }}>
        <div className="card-header">
          <h3>Assigned Groups</h3>
          {(state.is_admin || state.user?.permissions.assign_evaluator_groups) &&
            <Button type="tertiary" role="button" action={openEditAllModal} text="Bulk Edit" />
          }
        </div>
        <div className="card-body">
          {(groupsIsLoading || usersIsLoading) && <LoadingSpinner size="MEDIUM" />}

          {!(groupsIsLoading || usersIsLoading) &&
            <Table noCard>
              <TableHead>
                <Row>
                  <Cell header>Evaluator ID</Cell>
                  <Cell header>Evaluator Name</Cell>
                  <Cell header>Group</Cell>
                  <Cell header width="12px"></Cell>
                </Row>
              </TableHead>
              <TableBody>
                {usersData ? [...usersData.users].sort(compareUserGroups).map((u) => {
                  return (
                    <Row key={u.id}>
                      <Cell>{u.id}</Cell>
                      <Cell>{u.nickname}</Cell>
                      <Cell>{u.assignedGroup ? (u.assignedGroup.id + " - " + u.assignedGroup.name) : "Unassigned"}</Cell>
                      {(state.is_admin || state.user?.permissions.assign_evaluator_groups) ?
                        <Cell>
                          <ActionMenu actions={[
                            {
                              role: "button",
                              action: openEditIndividualModal,
                              text: "Edit",
                              data: u.id
                            }
                          ]} />
                        </Cell>
                        : ""}
                    </Row>
                  );
                }) : ""}
              </TableBody>
            </Table>
          }
        </div>
      </article>

      {editAssignedGroup &&
        <FormModal
          title="Edit Assigned Group"
          submitLabel="Save"
          handleSubmit={handleEditIndividual}
          handleCancel={closeEditIndividualModal}
          cols={4}
          fields={[
            {
              fieldType: "SELECT",
              name: "group_id",
              id: "group-id",
              label: "Assigned Group",
              size: "LARGE",
              defaultValue: editAssignedGroup.assignedGroup ? editAssignedGroup.assignedGroup.id : null,
              choices: [...(groupsData ? groupsData.groups.map((g) => {
                return {
                  text: g.id + " - " + g.name,
                  value: g.id
                }
              }) : []), { text: "None", value: null }]
            }
          ]}
        />
      }

      {showBulkEditModal &&
        <FormModal
          title="Edit Assigned Groups"
          submitLabel="Save"
          handleSubmit={handleEditAll}
          handleCancel={closeEditAllModal}
          cols={4}
          fields={usersData?.users.map((a) => createField(a)) || []}
        />
      }
    </React.Fragment>
  );
}

export default AssignedGroupsCard;