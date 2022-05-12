import React, { useEffect, useState } from "react";
import ActionMenu from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
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

  }

  const closeEditAllModal = () => {

  }

  const handleEditAll = () => {

  }

  const openEditIndividualModal = (evaluatorId: number) => {

  }

  const closeEditIndividualModal = () => {

  }

  const handleEditIndividual = () => {

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
                          ]}/>
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
    </React.Fragment>
  );
}

export default AssignedGroupsCard;