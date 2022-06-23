import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ActionMenu, { Action } from "../../shared/ActionMenu";
import ErrorPage from "../../shared/ErrorPage";
import ExternalLink from "../../shared/ExternalLink";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../shared/Modals";
import EvaluationsSidebar from "../../shared/Sidebars/EvaluationsSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import useAppState from "../../state/useAppState";
import useAppError from "../../util/errors";
import request from "../../util/request";

type User = {
  id: string
  nickname: string
}

type GetUsersResponse = {
  users: User[]
}

const GET_USERS = gql`
  query GetAllUsers {
    users {
      id
      nickname
    }
  }
`;

type Evaluation = {
  id: string
  entry: {
    id: string
    title: string
    url: string
  }
  creativity: number
  complexity: number
  interpretation: number
  execution: number
  total: number
  skillLevel: string
  canEdit: boolean
}

type GetEvaluationsResponse = {
  evaluations: Evaluation[]
}

const GET_EVALUATIONS = gql`
  query GetEvaluations($userId: ID!, $contestId: ID!) {
    evaluations(userId: $userId, contestId: $contestId) {
      id
      entry {
        id
        title
        url
      }
      creativity
      complexity
      interpretation
      execution
      total
      skillLevel
      canEdit
    }
  }
`;

type EvaluationMutationResponse = {
  evaluation: Evaluation
}

const EDIT_EVALUATION = gql`
  mutation EditEvaluation($id: ID!, $input: EditEvaluationInput!) {
    editEvaluation(id: $id, input: $input) {
      id
      entry {
        id
        title
        url
      }
      creativity
      complexity
      execution
      interpretation
      total
      skillLevel
      canEdit
    }
  }
`;

const DELETE_EVALUATION = gql`
  mutation DeleteEvaluation($id: ID!) {
    deleteEvaluation(id: $id) {
      id
      entry {
        id
        title
        url
      }
      creativity
      complexity
      execution
      interpretation
      total
      skillLevel
      canEdit
    }
  }
`;

function Evaluations() {
  const { evaluatorId, contestId } = useParams();
  const { handleGQLError } = useAppError();
  const { state } = useAppState();
  const [evaluationToEdit, setEvaluationToEdit] = useState<Evaluation | null>(null);
  const [deleteEvaluationId, setDeleteEvaluationId] = useState<number | null>(null);

  const [fetchUsers, { loading: usersIsLoading, data: usersData }] = useLazyQuery<GetUsersResponse>(GET_USERS, { onError: handleGQLError });
  const { loading: evaluationsIsLoading, data: evaluationsData, refetch: refetchEvaluations } = useQuery<GetEvaluationsResponse>(GET_EVALUATIONS, {
    variables: {
      userId: evaluatorId,
      contestId: contestId
    },
    onError: handleGQLError
  });
  const [editEvaluation, { loading: editEvaluationIsLoading }] = useMutation<EvaluationMutationResponse>(EDIT_EVALUATION, { onError: handleGQLError });
  const [deleteEvaluation, { loading: deleteEvaluationIsLoading }] = useMutation<EvaluationMutationResponse>(DELETE_EVALUATION, { onError: handleGQLError });

  useEffect(() => {
    if (state.is_admin || state.user?.permissions.view_all_evaluations) {
      fetchUsers();
    }
  }, [state.is_admin, state.user?.permissions.view_all_evaluations, fetchUsers]);

  const scoreValidator = (value: string) => {
    const scores = ["0", "0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];
    if (!scores.includes(value)) {
      return "Score must be between 0 and 5, in 0.5 increments"
    }

    return null;
  }

  const openEditEvaluationModal = (evalId: string) => {
    const evaluation = evaluationsData?.evaluations.find((e) => e.id === evalId) || null;
    setEvaluationToEdit(evaluation);
  }

  const closeEditEvaluatioinModal = () => {
    setEvaluationToEdit(null);
  }

  const handleEditEvaluation = async (values: { [name: string]: any }) => {
    if (!evaluationToEdit) {
      return;
    }

    await editEvaluation({
      variables: {
        id: evaluationToEdit.id,
        input: {
          creativity: values.creativity,
          complexity: values.complexity,
          execution: values.quality,
          interpretation: values.interpretation,
          skillLevel: values.skill_level
        }
      }
    });

    refetchEvaluations();
    closeEditEvaluatioinModal();
  }

  const openDeleteEvaluationModal = (evalId: number) => {
    setDeleteEvaluationId(evalId);
  }

  const closeDeleteEvaluatioinModal = () => {
    setDeleteEvaluationId(null);
  }

  const handleDeleteEvaluation = async (evalId: number) => {
    await deleteEvaluation({
      variables: {
        id: evalId
      }
    });

    refetchEvaluations();
    closeDeleteEvaluatioinModal();
  }

  if ((evaluatorId !== state.user?.evaluator_id) && !state.user?.permissions.view_all_evaluations) {
    return (
      <ErrorPage type="NO PERMISSION" />
    );
  }
  else if ((evaluatorId !== state.user?.evaluator_id) && (!usersIsLoading && !usersData?.users.find((u) => u.id === evaluatorId))) {
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
                actions={usersData ? usersData.users.map((u) => {
                  return {
                    role: "link",
                    text: u.nickname,
                    action: "/admin/evaluations/" + u.id + "/" + contestId
                  }
                }) : []}
                label={usersData?.users.find((u) => u.id === evaluatorId)?.nickname || "Change User"}
              />
            </span>
          </div>
          <div className="section-body" data-testid="tasks-section-body">
            {evaluationsIsLoading && <LoadingSpinner size="LARGE" />}

            {!evaluationsIsLoading &&
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
                    {(evaluationsData?.evaluations[0]?.canEdit || state.is_admin || state.user?.permissions.edit_all_evaluations || state.user?.permissions.delete_all_evaluations) ? <Cell header></Cell> : ""}
                  </Row>
                </TableHead>
                <TableBody>
                  {evaluationsData ? evaluationsData.evaluations.map((e) => {
                    let evaluationActions: Action[] = [];
                    if (e.canEdit || state.is_admin || state.user?.permissions.edit_all_evaluations) {
                      evaluationActions.push({
                        role: "button",
                        action: openEditEvaluationModal,
                        text: "Edit",
                        data: e.id
                      });
                    }

                    if (state.is_admin || state.user?.permissions.delete_all_evaluations) {
                      evaluationActions.push({
                        role: "button",
                        action: openDeleteEvaluationModal,
                        text: "Delete",
                        data: e.id
                      });
                    }

                    return (
                      <Row key={e.id}>
                        <Cell>{e.id}</Cell>
                        <Cell>{e.entry.id}</Cell>
                        <Cell><ExternalLink to={e.entry.url}>{e.entry.title}</ExternalLink></Cell>
                        <Cell>{e.creativity}</Cell>
                        <Cell>{e.complexity}</Cell>
                        <Cell>{e.execution}</Cell>
                        <Cell>{e.interpretation}</Cell>
                        <Cell>{e.creativity + e.complexity + e.execution + e.interpretation}</Cell>
                        <Cell>{e.skillLevel}</Cell>
                        {(evaluationsData?.evaluations[0]?.canEdit || state.is_admin || state.user?.permissions.edit_all_evaluations || state.user?.permissions.delete_all_evaluations) ?
                          <Cell><ActionMenu actions={evaluationActions} /></Cell>
                          : ""}
                      </Row>
                    );
                  }) : ""}
                </TableBody>
              </Table>
            }
          </div>
        </div>
      </section>

      {evaluationToEdit &&
        <FormModal
          title="Edit Evaluation"
          submitLabel="Save"
          handleSubmit={handleEditEvaluation}
          handleCancel={closeEditEvaluatioinModal}
          cols={5}
          loading={editEvaluationIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "number",
              name: "creativity",
              id: "creativity",
              size: "MEDIUM",
              label: "Creativity",
              defaultValue: evaluationToEdit.creativity.toString(),
              min: 0,
              max: 5,
              step: 0.5,
              validate: scoreValidator,
              required: true
            },
            {
              fieldType: "INPUT",
              type: "number",
              name: "complexity",
              id: "complexity",
              size: "MEDIUM",
              label: "Complexity",
              defaultValue: evaluationToEdit.complexity.toString(),
              min: 0,
              max: 5,
              step: 0.5,
              validate: scoreValidator,
              required: true
            },
            {
              fieldType: "INPUT",
              type: "number",
              name: "quality",
              id: "quality",
              size: "MEDIUM",
              label: "Quality",
              defaultValue: evaluationToEdit.execution.toString(),
              min: 0,
              max: 5,
              step: 0.5,
              validate: scoreValidator,
              required: true
            },
            {
              fieldType: "INPUT",
              type: "number",
              name: "interpretation",
              id: "interpretation",
              size: "MEDIUM",
              label: "Complexity",
              defaultValue: evaluationToEdit.interpretation.toString(),
              min: 0,
              max: 5,
              step: 0.5,
              validate: scoreValidator,
              required: true
            },
            {
              fieldType: "SELECT",
              name: "skill_level",
              id: "skill-level",
              size: "MEDIUM",
              label: "Skill Level",
              defaultValue: evaluationToEdit.skillLevel,
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
              ],
              required: true
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
          loading={deleteEvaluationIsLoading}
          data={deleteEvaluationId}
        >
          <p>Are you sure you want to delete this evaluation? This action cannot be undone.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default Evaluations;