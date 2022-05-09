import React, { useEffect, useState } from "react";
import ActionMenu from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import { fetchJudgingCriteria } from "./fetchData";

type Criteria = {
  criteria_description: string
  criteria_id: number
  criteria_name: string
  is_active: boolean
  sort_order: number
}

function JudgingCriteriaCard() {
  const { state } = useAppState();
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchJudgingCriteria()
      .then((data) => {
        setCriteria(data.criteria);
        setIsLoading(false);
      });
  }, []);

  const openCreateCriteriaModal = () => {

  }

  const closeCreateCriteriaModal = () => {

  }

  const handleCreateCriteria = () => {

  }

  const openEditCriteriaModal = () => {

  }

  const closeEditCriteriaModal = () => {

  }

  const handleEditCriteria = () => {

  }

  const openDeleteCriteriaModal = () => {

  }

  const closeDeleteCriteriaModal = () => {

  }

  const handleDeleteCriteria = () => {

  }

  return (
    <React.Fragment>
      <article className="card col-12" style={{ paddingBottom: "16px" }}>
        <div className="card-header">
          <h3>Judging Criteria</h3>
          {(state.is_admin || state.user?.permissions.manage_judging_criteria) &&
            <Button type="tertiary" role="button" action={openCreateCriteriaModal} text="Create Judging Criteria" />
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
                  <Cell header>Description</Cell>
                  <Cell header>Active</Cell>
                  <Cell header>Sort Order</Cell>
                  <Cell header permissions={["manage_judging_criteria"]} width="12px"></Cell>
                </Row>
              </TableHead>
              <TableBody>
                {criteria.map((c) => {
                  return (
                    <Row key={c.criteria_id}>
                      <Cell>{c.criteria_id}</Cell>
                      <Cell>{c.criteria_name}</Cell>
                      <Cell>{c.criteria_description}</Cell>
                      <Cell>{c.is_active ? "Yes" : "No"}</Cell>
                      <Cell>{c.sort_order}</Cell>
                      {(state.is_admin || state.user?.permissions.manage_judging_criteria) ? 
                        <Cell>
                          <ActionMenu actions={[
                            {
                              role: "button",
                              action: openEditCriteriaModal,
                              text: "Edit",
                              data: c.criteria_id
                            },
                            {
                              role: "button",
                              action: openDeleteCriteriaModal,
                              text: "Delete",
                              data: c.criteria_id
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
    </React.Fragment>
  );
}

export default JudgingCriteriaCard;