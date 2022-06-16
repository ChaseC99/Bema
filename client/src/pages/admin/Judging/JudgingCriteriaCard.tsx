import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import ActionMenu from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import useAppError from "../../../util/errors";

type Criteria = {
  id: string
  name: string
  description: string
  isActive: boolean
  sortOrder: number
}

type GetAllCriteriaResponse = {
  criteria: Criteria[]
}

const GET_ALL_CRITERIA = gql`
  query GetAllJudgingCriteria {
    criteria: allCriteria {
      id
      name
      description
      isActive
      sortOrder
    }
  }
`;

type MutateCriteriaResponse = {
  criteria: Criteria
}

const CREATE_CRITERIA = gql`
  mutation CreateCriteria($input: JudgingCriteriaInput) {
    criteria: createCriteria(input: $input) {
      id
      name
      description
      isActive
      sortOrder
    }
  }
`;

const EDIT_CRITERIA = gql`
  mutation EditCriteria($id: ID!, $input: JudgingCriteriaInput) {
    editCriteria(id: $id, input: $input) {
      id
      name
      description
      isActive
      sortOrder
    }
  }
`;

const DELETE_CRITERIA = gql`
  mutation DeleteCriteria($id: ID!) {
    deleteCriteria(id: $id) {
      id
      name
      description
      isActive
      sortOrder
    }
  }
`;

function JudgingCriteriaCard() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [showCreateCriteriaModal, setShowCreateCriteriaModal] = useState<boolean>(false);
  const [criteriaToEdit, setCriteriaToEdit] = useState<Criteria | null>(null);
  const [deleteCriteriaId, setDeleteCriteriaId] = useState<number | null>(null);

  const { loading, data, refetch } = useQuery<GetAllCriteriaResponse>(GET_ALL_CRITERIA, { onError: handleGQLError });
  const [createCriteria, { loading: createCriteriaIsLoading }] = useMutation<MutateCriteriaResponse>(CREATE_CRITERIA, { onError: handleGQLError });
  const [editCriteria, { loading: editCriteriaIsLoading }] = useMutation<MutateCriteriaResponse>(EDIT_CRITERIA, { onError: handleGQLError });
  const [deleteCriteria, { loading: deleteCriteriaIsLoading }] = useMutation<MutateCriteriaResponse>(DELETE_CRITERIA, { onError: handleGQLError });

  const openCreateCriteriaModal = () => {
    setShowCreateCriteriaModal(true);
  }

  const closeCreateCriteriaModal = () => {
    setShowCreateCriteriaModal(false);
  }

  const handleCreateCriteria = async (values: { [name: string]: any }) => {
    await createCriteria({
      variables: {
        input: {
          name: values.name,
          description: values.description,
          isActive: values.is_active,
          sortOrder: values.sort_order,
        }
      }
    });

    refetch();
    closeCreateCriteriaModal();
  }

  const openEditCriteriaModal = (id: string) => {
    const c = data?.criteria.find((c) => c.id === id) || null;
    setCriteriaToEdit(c);
  }

  const closeEditCriteriaModal = () => {
    setCriteriaToEdit(null);
  }

  const handleEditCriteria = async (values: { [name: string]: any }) => {
    await editCriteria({
      variables: {
        id: criteriaToEdit?.id,
        input: {
          name: values.name,
          description: values.description,
          isActive: values.is_active,
          sortOrder: values.sort_order
        }
      }
    });

    refetch();
    closeEditCriteriaModal();
  }

  const openDeleteCriteriaModal = (id: number) => {
    setDeleteCriteriaId(id);
  }

  const closeDeleteCriteriaModal = () => {
    setDeleteCriteriaId(null);
  }

  const handleDeleteCriteria = async (id: number) => {
    await deleteCriteria({
      variables: {
        id: id
      }
    });

    refetch();
    closeDeleteCriteriaModal();
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
          {loading && <LoadingSpinner size="MEDIUM" />}

          {!loading &&
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
                {data ? data.criteria.map((c) => {
                  return (
                    <Row key={c.id}>
                      <Cell>{c.id}</Cell>
                      <Cell>{c.name}</Cell>
                      <Cell>{c.description}</Cell>
                      <Cell>{c.isActive ? "Yes" : "No"}</Cell>
                      <Cell>{c.sortOrder}</Cell>
                      {(state.is_admin || state.user?.permissions.manage_judging_criteria) ? 
                        <Cell>
                          <ActionMenu actions={[
                            {
                              role: "button",
                              action: openEditCriteriaModal,
                              text: "Edit",
                              data: c.id
                            },
                            {
                              role: "button",
                              action: openDeleteCriteriaModal,
                              text: "Delete",
                              data: c.id
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

      {showCreateCriteriaModal &&
        <FormModal
          title="Create Judging Criteria"
          submitLabel="Create"
          handleSubmit={handleCreateCriteria}
          handleCancel={closeCreateCriteriaModal}
          cols={4}
          loading={createCriteriaIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "name",
              id: "name",
              label: "Criteria Name",
              size: "LARGE",
              defaultValue: "",
              required: true
            },
            {
              fieldType: "TEXTAREA",
              name: "description",
              id: "description",
              label: "Description",
              size: "LARGE",
              defaultValue: "",
              required: true
            },
            {
              fieldType: "INPUT",
              type: "number",
              step: 1,
              min: 1,
              name: "sort_order",
              id: "sort-order",
              label: "Sort Order",
              size: "LARGE",
              defaultValue: "",
              required: true
            },
            {
              fieldType: "CHECKBOX",
              name: "is_active",
              id: "is-active",
              label: "Active",
              size: "LARGE",
              defaultValue: true
            }
          ]}
        />
      }

      {criteriaToEdit &&
        <FormModal
        title="Edit Judging Criteria"
        submitLabel="Save"
        handleSubmit={handleEditCriteria}
        handleCancel={closeEditCriteriaModal}
        cols={4}
        loading={editCriteriaIsLoading}
        fields={[
          {
            fieldType: "INPUT",
            type: "text",
            name: "name",
            id: "name",
            label: "Criteria Name",
            size: "LARGE",
            defaultValue: criteriaToEdit.name,
            required: true
          },
          {
            fieldType: "TEXTAREA",
            name: "description",
            id: "description",
            label: "Description",
            size: "LARGE",
            defaultValue: criteriaToEdit.description,
            required: true
          },
          {
            fieldType: "INPUT",
            type: "number",
            step: 1,
            min: 1,
            name: "sort_order",
            id: "sort-order",
            label: "Sort Order",
            size: "LARGE",
            defaultValue: criteriaToEdit.sortOrder.toString(),
            required: true
          },
          {
            fieldType: "CHECKBOX",
            name: "is_active",
            id: "is-active",
            label: "Active",
            size: "LARGE",
            defaultValue: criteriaToEdit.isActive
          }
        ]}
        />
      }

      {deleteCriteriaId &&
        <ConfirmModal
          title="Delete criteria?"
          confirmLabel="Delete"
          handleConfirm={handleDeleteCriteria}
          handleCancel={closeDeleteCriteriaModal}
          destructive
          loading={deleteCriteriaIsLoading}
          data={deleteCriteriaId}
        >
          <p>Are you sure you want to delete this criteria? This action cannot be undone.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default JudgingCriteriaCard;