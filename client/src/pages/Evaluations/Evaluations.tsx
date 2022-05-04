import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ActionMenu, { Action } from "../../shared/ActionMenu";
import ErrorPage from "../../shared/ErrorPage";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../shared/Modals";
import EvaluationsSidebar from "../../shared/Sidebars/EvaluationsSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import useAppState from "../../state/useAppState";
import request from "../../util/request";
import { fetchEvaluations, fetchUsers } from "./fetchEvaluations";

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

interface User {
  evaluator_id: number
  evaluator_name: string
  account_locked: boolean
}

function Evaluations() {
  const { evaluatorId, contestId } = useParams();
  const { state } = useAppState();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editEvaluation, setEditEvaluation] = useState<Evaluation | null>(null);
  const [deleteEvaluationId, setDeleteEvaluationId] = useState<number | null>(null);
  let hasActions = (canEdit || state.is_admin || state.user?.permissions.edit_all_evaluations || state.user?.permissions.delete_all_evaluations);

  useEffect(() => {
    fetchEvaluations(parseInt(contestId || ""), parseInt(evaluatorId || ""))
    .then((data) => {
      setEvaluations(data.evaluations);
      setCanEdit(data.canEdit);
      setIsLoading(false);
    });
  }, [evaluatorId, contestId]);

  useEffect(() => {
    if (state.is_admin || state.user?.permissions.view_all_evaluations) {
      fetchUsers()
      .then((data) => {
        setUsers(data.users);
      });
    }
  }, [state.is_admin, state.user?.permissions.view_all_evaluations]);

  const scoreValidator = (value: string) => {
    const scores = ["0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];
    if (!scores.includes(value)) {
      return "Score must be between 0 and 5, in 0.5 increments"
    }

    return null;
  }

  const openEditEvaluationModal = (evalId: number) => {
    const evaluation = evaluations.find((e) => e.evaluation_id === evalId) || null;
    setEditEvaluation(evaluation);
  }

  const closeEditEvaluatioinModal = () => {
    setEditEvaluation(null);
  }

  const handleEditEvaluation = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/evaluations", {
      edit_evaluation_id: editEvaluation?.evaluation_id,
      edit_entry_id: editEvaluation?.entry_id,
      edit_creativity: values.creativity,
      edit_complexity: values.complexity,
      edit_execution: values.quality,
      edit_interpretation: values.interpretation,
      edit_evaluation_level: values.skill_level
    });

    const newEvaluations = [...evaluations];
    for (let i = 0; i < newEvaluations.length; i++) {
      if (newEvaluations[i].evaluation_id === editEvaluation?.evaluation_id) {
        newEvaluations[i].creativity = parseInt(values.creativity);
        newEvaluations[i].complexity = parseInt(values.complexity);
        newEvaluations[i].execution = parseInt(values.quality);
        newEvaluations[i].interpretation = parseInt(values.interpretation);
        newEvaluations[i].evaluation_level = values.skill_level;
        break;
      }
    }
    setEvaluations(newEvaluations);
    closeEditEvaluatioinModal();
  }

  const openDeleteEvaluationModal = (evalId: number) => {
    setDeleteEvaluationId(evalId);
  }

  const closeDeleteEvaluatioinModal = () => {
    setDeleteEvaluationId(null);
  }

  const handleDeleteEvaluation = async (evalId: number) => {
    await request("DELETE", "/api/internal/evaluations", {
      evaluation_id: evalId
    });

    const newEvaluations = evaluations.filter((e) => e.evaluation_id !== evalId);
    setEvaluations(newEvaluations);
    
    closeDeleteEvaluatioinModal();
  }

  if ((parseInt(evaluatorId || "") !== state.user?.evaluator_id ) && !users.find((u) => u.evaluator_id === parseInt(evaluatorId || ""))) {
    return (
      <ErrorPage type="NOT FOUND" message="This evaluator does not exist." />
    );
  }

  return (
    <React.Fragment>
      <EvaluationsSidebar evaluatorId={parseInt(evaluatorId || "")} />

      <section className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>Evaluations</h2>

            <span className="section-actions">
              <ActionMenu
                actions={users.filter((u) => !u.account_locked).map((u) => {
                  return {
                    role: "link",
                    text: u.evaluator_name,
                    action: "/admin/evaluations/" + u.evaluator_id + "/" + contestId
                  }
                })}
                label={users.find((u) => u.evaluator_id === parseInt(evaluatorId || ""))?.evaluator_name || "Change User"}
              />
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

      {editEvaluation &&
        <FormModal
          title="Edit Evaluation"
          submitLabel="Save"
          handleSubmit={handleEditEvaluation}
          handleCancel={closeEditEvaluatioinModal}
          cols={5}
          fields={[
            {
              fieldType: "INPUT",
              type: "number",
              name: "creativity",
              id: "creativity",
              size: "MEDIUM",
              label: "Creativity",
              defaultValue: editEvaluation.creativity.toString(),
              min: 0,
              max: 5,
              step: 0.5,
              validate: scoreValidator
            },
            {
              fieldType: "INPUT",
              type: "number",
              name: "complexity",
              id: "complexity",
              size: "MEDIUM",
              label: "Complexity",
              defaultValue: editEvaluation.complexity.toString(),
              min: 0,
              max: 5,
              step: 0.5,
              validate: scoreValidator
            },
            {
              fieldType: "INPUT",
              type: "number",
              name: "quality",
              id: "quality",
              size: "MEDIUM",
              label: "Quality",
              defaultValue: editEvaluation.execution.toString(),
              min: 0,
              max: 5,
              step: 0.5,
              validate: scoreValidator
            },
            {
              fieldType: "INPUT",
              type: "number",
              name: "interpretation",
              id: "interpretation",
              size: "MEDIUM",
              label: "Complexity",
              defaultValue: editEvaluation.interpretation.toString(),
              min: 0,
              max: 5,
              step: 0.5,
              validate: scoreValidator
            },
            {
              fieldType: "SELECT",
              name: "skill_level",
              id: "skill-level",
              size: "MEDIUM",
              label: "Skill Level",
              defaultValue: editEvaluation.evaluation_level,
              choices: [
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
            }
          ]}
        />
      }

      {deleteEvaluationId &&
        <ConfirmModal
          title="Delete evaluation?"
          confirmLabel="Delete"
          handleConfirm={handleDeleteEvaluation}
          handleCancel={closeDeleteEvaluatioinModal}
          destructive
          data={deleteEvaluationId}
        >
          <p>Are you sure you want to delete this evaluation? This action cannot be undone.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default Evaluations;