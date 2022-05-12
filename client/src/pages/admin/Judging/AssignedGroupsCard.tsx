import React, { useEffect, useState } from "react";
import ActionMenu from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import { FormFields } from "../../../shared/Forms";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { FormModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import request from "../../../util/request";
import { fetchJudgingGroups } from "./fetchData";

type Group = {
  group_id: number
  group_name: string
  is_active: boolean
}

type AssignedGroup = {
  group_id: number | null
  group_name: string | null
  evaluator_id: number
  evaluator_name: string
}

function AssignedGroupsCard() {
  const { state } = useAppState();
  const [assignedGroups, setAssignedGroups] = useState<AssignedGroup[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editAssignedGroup, setEditAssignedGroup] = useState<AssignedGroup | null>(null);
  const [showBulkEditModal, setShowBulkEditModal] = useState<boolean>(false);

  useEffect(() => {
    fetchJudgingGroups()
      .then((data) => {
        const combinedData: AssignedGroup[] = [];

        data.evaluators.forEach((e) => {
          const g = data.groups.find((g) => g.group_id === e.group_id) || null;
          combinedData.push({
            group_id: g ? g.group_id : null,
            group_name: g ? g.group_name : null,
            evaluator_id: e.evaluator_id,
            evaluator_name: e.evaluator_name
          });
        });

        setAllGroups(data.groups);
        setAssignedGroups(combinedData);
        setIsLoading(false);
      });
  }, []);

  const openEditAllModal = () => {
    setShowBulkEditModal(true);
  }

  const closeEditAllModal = () => {
    setShowBulkEditModal(false);
  }

  const handleEditAll = (values: { [name: string]: any }) => {
    const newAssignedGroups = [...assignedGroups];
    for (let i = 0; i < newAssignedGroups.length; i++) {
      if (newAssignedGroups[i].group_id !== values[newAssignedGroups[i].evaluator_id]) {
        newAssignedGroups[i].group_id = values[newAssignedGroups[i].evaluator_id];
        newAssignedGroups[i].group_name = allGroups.find((g) => g.group_id === values[newAssignedGroups[i].evaluator_id])?.group_name || "";

        request("PUT", "/api/internal/users/assignToEvaluatorGroup", {
          group_id: values[newAssignedGroups[i].evaluator_id],
          evaluator_id: newAssignedGroups[i].evaluator_id
        });
      }
    }

    setAssignedGroups(newAssignedGroups);
    closeEditAllModal();
  }

  const openEditIndividualModal = (evaluatorId: number) => {
    const a = assignedGroups.find((g) => g.evaluator_id === evaluatorId) || null;
    setEditAssignedGroup(a);
  }

  const closeEditIndividualModal = () => {
    setEditAssignedGroup(null);
  }

  const handleEditIndividual = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/users/assignToEvaluatorGroup", {
      group_id: values.group_id,
      evaluator_id: editAssignedGroup?.evaluator_id
    });

    const newAssignedGroups = [...assignedGroups];
    for (let i = 0; i < newAssignedGroups.length; i++) {
      if (newAssignedGroups[i].evaluator_id === editAssignedGroup?.evaluator_id) {
        newAssignedGroups[i].group_id = values.group_id;
        newAssignedGroups[i].group_name = allGroups.find((g) => g.group_id === values.group_id)?.group_name || "";
        break;
      }
    }

    setAssignedGroups(newAssignedGroups);
    closeEditIndividualModal();
  }

  const createField = (assignedGroup: AssignedGroup): FormFields => {
    return {
      fieldType: "SELECT",
      name: assignedGroup.evaluator_id.toString(),
      id: assignedGroup.evaluator_id.toString(),
      label: assignedGroup.evaluator_name,
      size: "LARGE",
      defaultValue: assignedGroup.group_id,
      choices: [...allGroups.map((g) => {
        return {
          text: g.group_id + " - " + g.group_name,
          value: g.group_id
        }
      }), { text: "None", value: null }]
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
          {isLoading && <LoadingSpinner size="MEDIUM" />}

          {!isLoading &&
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
                {assignedGroups.map((a) => {
                  return (
                    <Row key={a.evaluator_id}>
                      <Cell>{a.evaluator_id}</Cell>
                      <Cell>{a.evaluator_name}</Cell>
                      <Cell>{a.group_id ? (a.group_id + " - " + a.group_name) : "Unassigned"}</Cell>
                      {(state.is_admin || state.user?.permissions.assign_evaluator_groups) ?
                        <Cell>
                          <ActionMenu actions={[
                            {
                              role: "button",
                              action: openEditIndividualModal,
                              text: "Edit",
                              data: a.evaluator_id
                            }
                          ]} />
                        </Cell>
                        : ""}
                    </Row>
                  );
                })}
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
              defaultValue: editAssignedGroup.group_id,
              choices: [...allGroups.map((g) => {
                return {
                  text: g.group_id + " - " + g.group_name,
                  value: g.group_id
                }
              }), { text: "None", value: null }]
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
          fields={assignedGroups.map((a) => createField(a))}
        />
      }
    </React.Fragment>
  );
}

export default AssignedGroupsCard;