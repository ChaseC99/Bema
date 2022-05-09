import React, { useEffect, useState } from "react";
import ActionMenu from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import request from "../../../util/request";
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
  const [showCreateCriteriaModal, setShowCreateCriteriaModal] = useState<boolean>(false);
  const [editCriteria, setEditCriteria] = useState<Criteria | null>(null);
  const [deleteCriteriaId, setDeleteCriteriaId] = useState<number | null>(null);

  useEffect(() => {
    fetchJudgingCriteria()
      .then((data) => {
        setCriteria(data.criteria);
        setIsLoading(false);
      });
  }, []);

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

    closeCreateCriteriaModal();
    window.location.reload();
  }

  const openEditCriteriaModal = (id: number) => {
    const c = criteria.find((c) => c.criteria_id === id) || null;
    setEditCriteria(c);
  }

  const closeEditCriteriaModal = () => {
    setEditCriteria(null);
  }

  const handleEditCriteria = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/judging/criteria", {
      criteria_id: editCriteria?.criteria_id,
      criteria_name: values.name,
      criteria_description: values.description,
      is_active: values.is_active,
      sort_order: values.sort_order
    });

    const newCriteria = [...criteria];
    for (let i = 0; i < newCriteria.length; i++) {
      if (newCriteria[i].criteria_id === editCriteria?.criteria_id) {
        newCriteria[i].criteria_name = values.name;
        newCriteria[i].criteria_description = values.description;
        newCriteria[i].sort_order = values.sort_order;
        newCriteria[i].is_active = values.is_active;
        break;
      }
    }
    setCriteria(newCriteria);

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

    const newCriteria = criteria.filter((c) => c.criteria_id !== id);
    setCriteria(newCriteria);

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
            defaultValue: editCriteria.criteria_name,
            required: true
          },
          {
            fieldType: "TEXTAREA",
            name: "description",
            id: "description",
            label: "Description",
            size: "LARGE",
            defaultValue: editCriteria.criteria_description,
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
            defaultValue: editCriteria.sort_order.toString(),
            required: true
          },
          {
            fieldType: "CHECKBOX",
            name: "is_active",
            id: "is-active",
            label: "Active",
            size: "LARGE",
            defaultValue: editCriteria.is_active
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