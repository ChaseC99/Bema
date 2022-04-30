import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ActionMenu, { Action } from "../../shared/ActionMenu";
import LoadingSpinner from "../../shared/LoadingSpinner";
import EvaluationsSidebar from "../../shared/Sidebars/EvaluationsSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import useAppState from "../../state/useAppState";
import { fetchEvaluations } from "./fetchEvaluations";

type Evaluation = {
  complexity: number
  creativity: number
  entry_id: number
  entry_title: string
  entry_url: string
  evaluation_id: number
  evaluation_level: string
  execution: number
  interpretation: number
}

function Evaluations() {
  const { evaluatorId, contestId } = useParams();
  const { state } = useAppState();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  let hasActions = (canEdit || state.is_admin || state.user?.permissions.edit_all_evaluations || state.user?.permissions.delete_all_evaluations);

  useEffect(() => {
    fetchEvaluations(parseInt(contestId || ""), parseInt(evaluatorId || ""))
    .then((data) => {
      setEvaluations(data.evaluations);
      setCanEdit(data.canEdit);
      setIsLoading(false);
    });
  }, [evaluatorId, contestId]);

  const openEditEvaluationModal = (evalId: number) => {

  }

  const closeEditEvaluatioinModal = () => {

  }

  const handleEditEvaluation = () => {

  }

  const openDeleteEvaluationModal = (evalId: number) => {

  }

  const closeDeleteEvaluatioinModal = () => {

  }

  const handleDeleteEvaluation = () => {

  }

  return (
    <React.Fragment>
      <EvaluationsSidebar evaluatorId={parseInt(evaluatorId || "")} />

      <section className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>Evaluations</h2>

            <span className="section-actions">
            </span>
          </div>
          <div className="section-body" data-testid="tasks-section-body">
            {isLoading && <LoadingSpinner size="LARGE" />}

            {!isLoading &&
              <Table>
                <TableHead>
                  <Row>
                    <Cell header>Eval ID</Cell>
                    <Cell header>Entry ID</Cell>
                    <Cell header>Entry Name</Cell>
                    <Cell header>Creativity</Cell>
                    <Cell header>Complexity</Cell>
                    <Cell header>Quality</Cell>
                    <Cell header>Interpretation</Cell>
                    <Cell header>Total</Cell>
                    <Cell header>Skill Level</Cell>
                    {hasActions ? <Cell header></Cell> : ""}
                  </Row>
                </TableHead>
                <TableBody>
                  {evaluations.map((e) => {
                    let evaluationActions: Action[] = [];
                    if (canEdit || state.is_admin || state.user?.permissions.edit_all_evaluations) {
                      evaluationActions.push({
                        role: "button",
                        action: openEditEvaluationModal,
                        text: "Edit",
                        data: e.evaluation_id
                      });
                    }

                    if (state.is_admin || state.user?.permissions.delete_all_evaluations) {
                      evaluationActions.push({
                        role: "button",
                        action: openDeleteEvaluationModal,
                        text: "Delete",
                        data: e.evaluation_id
                      });
                    }

                    return (
                      <Row key={e.evaluation_id}>
                        <Cell>{e.evaluation_id}</Cell>
                        <Cell>{e.entry_id}</Cell>
                        <Cell>{e.entry_title}</Cell>
                        <Cell>{e.creativity}</Cell>
                        <Cell>{e.complexity}</Cell>
                        <Cell>{e.execution}</Cell>
                        <Cell>{e.interpretation}</Cell>
                        <Cell>{e.creativity + e.complexity + e.execution + e.interpretation}</Cell>
                        <Cell>{e.evaluation_level}</Cell>
                        {hasActions ? 
                          <Cell><ActionMenu actions={evaluationActions} /></Cell>
                        : ""}
                      </Row>
                    );
                  })}
                </TableBody>
              </Table>
            }
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

export default Evaluations;