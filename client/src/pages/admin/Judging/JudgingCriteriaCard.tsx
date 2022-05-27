import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import ActionMenu from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import { handleGqlError } from "../../../util/errors";
import request from "../../../util/request";

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

function JudgingCriteriaCard() {
  const { state } = useAppState();
  const [showCreateCriteriaModal, setShowCreateCriteriaModal] = useState<boolean>(false);
  const [editCriteria, setEditCriteria] = useState<Criteria | null>(null);
  const [deleteCriteriaId, setDeleteCriteriaId] = useState<number | null>(null);

  const { loading, data, error, refetch } = useQuery<GetAllCriteriaResponse>(GET_ALL_CRITERIA);

  const openCreateCriteriaModal = () => {
    setShowCreateCriteriaModal(true);
  }

  const closeCreateCriteriaModal = () => {
    setShowCreateCriteriaModal(false);
  }

  const handleCreateCriteria = async (values: { [name: string]: any }) => {
    await request("POST", "/api/internal/judging/criteria", {
      criteria_name: values.name,
      criteria_description: values.description,
      is_active: values.is_active,
      sort_order: values.sort_order
    });

    refetch();
    closeCreateCriteriaModal();
  }

  const openEditCriteriaModal = (id: number) => {
    const c = data?.criteria.find((c) => parseInt(c.id) === id) || null;
    setEditCriteria(c);
  }

  const closeEditCriteriaModal = () => {
    setEditCriteria(null);
  }

  const handleEditCriteria = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/judging/criteria", {
      criteria_id: editCriteria?.id,
      criteria_name: values.name,
      criteria_description: values.description,
      is_active: values.is_active,
      sort_order: values.sort_order
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
    await request("DELETE", "/api/internal/judging/criteria", {
      criteria_id: id
    });

    refetch();
    closeDeleteCriteriaModal();
  }

  if (error) {
    return handleGqlError(error);
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

      {editCriteria &&
        <FormModal
        title="Edit Judging Criteria"
        submitLabel="Save"
        handleSubmit={handleEditCriteria}
        handleCancel={closeEditCriteriaModal}
        cols={4}
        fields={[
          {
            fieldType: "INPUT",
            type: "text",
            name: "name",
            id: "name",
            label: "Criteria Name",
            size: "LARGE",
            defaultValue: editCriteria.name,
            required: true
          },
          {
            fieldType: "TEXTAREA",
            name: "description",
            id: "description",
            label: "Description",
            size: "LARGE",
            defaultValue: editCriteria.description,
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
            defaultValue: editCriteria.sortOrder.toString(),
            required: true
          },
          {
            fieldType: "CHECKBOX",
            name: "is_active",
            id: "is-active",
            label: "Active",
            size: "LARGE",
            defaultValue: editCriteria.isActive
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
          data={deleteCriteriaId}
        >
          <p>Are you sure you want to delete this criteria? This action cannot be undone.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default JudgingCriteriaCard;