import { ApolloError, gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import ActionMenu, { Action } from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../../shared/Modals";
import InfoModal from "../../../shared/Modals/InfoModal/InfoModal";
import KBAdminSidebar from "../../../shared/Sidebars/KBAdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import useAppError from "../../../util/errors";

type Section = {
  id: string
  name: string
  description: string
  visibility: string
}

type GetSectionsResponse = {
  sections: Section[]
}

const GET_SECTIONS = gql`
  query GetSections {
    sections {
      id
      name
      description
      visibility
    }
  }
`;

type MutateSectionResponse = {
  section: Section
}

const CREATE_SECTION = gql`
  mutation CreateSection($input: KBSectionInput!) {
    section: createSection(input: $input) {
      id
      name
      description
      visibility
    }
  }
`;

const EDIT_SECTION = gql`
  mutation EditSection($id: ID!, $input: KBSectionInput!) {
    section: editSection(id: $id, input: $input) {
      id
      name
      description
      visibility
    }
  }
`;

const DELETE_SECTION = gql`
  mutation DeleteSection($id: ID!) {
    deleteSection(id: $id) {
      id
      name
      description
      visibility
    }
  }
`;

export default function KBAdminSections() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [showCreateSectionModal, setShowCreateSectionModal] = useState<boolean>(false);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const { loading: sectionsIsLoading, data: sectionsData, refetch: refetchSections } = useQuery<GetSectionsResponse>(GET_SECTIONS, { onError: handleGQLError });
  const [createSection, { loading: createSectionIsLoading }] = useMutation<MutateSectionResponse>(CREATE_SECTION, { onError: handleGQLError });
  const [editSection, { loading: editSectionIsLoading }] = useMutation<MutateSectionResponse>(EDIT_SECTION, { onError: handleGQLError });
  
  const openDeletetionErrorModal = (message: string) => {
    setDeletionError(message);
  }

  const closeDeletionErrorModal = () => {
    setDeletionError(null);
  }
  
  const handleDeletionError = (error: ApolloError) => {
    if (error.graphQLErrors[0].extensions.status === 403) {
      openDeletetionErrorModal(error.graphQLErrors[0].message);
    }
  }
  
  const [deleteSection, { loading: deleteSectionIsLoading }] = useMutation<MutateSectionResponse>(DELETE_SECTION, { onError: handleDeletionError });

  const openCreateSectionModal = () => {
    setShowCreateSectionModal(true);
  }

  const closeCreateSectionModal = () => {
    setShowCreateSectionModal(false);
  }

  const handleCreateSection = async (values: { [name: string]: any }) => {
    await createSection({
      variables: {
        input: {
          name: values.name,
          description: values.description,
          visibility: values.visibility,
        },
      },
    });

    refetchSections();
    closeCreateSectionModal();
  }

  const openEditSectionModal = (id: string) => {
    console.log(id);
    const section = sectionsData?.sections.find((s) => s.id === id) || null;
    setSectionToEdit(section);
  }

  const closeEditSectionModal = () => {
    setSectionToEdit(null);
  }

  const handleEditSection = async (values: { [name: string]: any }) => {
    if (!sectionToEdit) {
      return;
    }

    await editSection({
      variables: {
        id: sectionToEdit.id,
        input: {
          name: values.name,
          description: values.description,
          visibility: values.visibility,
        },
      },
    });

    refetchSections();
    closeEditSectionModal();
  }

  const openDeleteSectionModal = (id: string) => {
    setDeleteSectionId(id);
  }

  const closeDeleteSectionModal = () => {
    setDeleteSectionId(null);
  }

  const handleDeleteSection = async () => {
    if (!deleteSectionId) {
      return;
    }

    await deleteSection({
      variables: {
        id: deleteSectionId,
      },
    });

    refetchSections();
    closeDeleteSectionModal();
  }

  const getActions = (id: string) => {
    const actions: Action[] = [{
      role: 'button',
      action: openEditSectionModal,
      text: 'Edit',
      data: id,
    }];

    if (state.isAdmin || state.user?.permissions.delete_kb_content) {
      actions.push({
        role: 'button',
        action: openDeleteSectionModal,
        text: 'Delete',
        data: id,
      });
    }

    return actions;
  }

  return (
    <React.Fragment>
      <KBAdminSidebar />

      <section id="kb-admin-section" className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>Sections</h2>
            <Button type="primary" role="button" action={openCreateSectionModal} text="Create Section" />
          </div>
          <div className="section-body container col-12">
            {sectionsIsLoading && <LoadingSpinner size='LARGE' />}

            {(!sectionsIsLoading && sectionsData) &&
              <Table>
                <TableHead>
                  <Row>
                    <Cell header width="18%">Name</Cell>
                    <Cell header width="70%">Description</Cell>
                    <Cell header width="10%">Visibility</Cell>
                    <Cell header width="2%"></Cell>
                  </Row>
                </TableHead>
                <TableBody>
                  {sectionsData.sections.map((section) => {
                    return (
                      <Row key={section.id}>
                        <Cell>{section.name}</Cell>
                        <Cell>{section.description}</Cell>
                        <Cell>{section.visibility}</Cell>
                        <Cell>
                          <ActionMenu actions={getActions(section.id)} />
                        </Cell>
                      </Row>
                    );
                  })}
                </TableBody>
              </Table>
            }
          </div>
        </div>
      </section>

      {showCreateSectionModal &&
        <FormModal
          title="Create Section"
          submitLabel="Create"
          handleSubmit={handleCreateSection}
          handleCancel={closeCreateSectionModal}
          cols={4}
          loading={createSectionIsLoading}
          fields={[
            {
              fieldType: 'INPUT',
              type: 'text',
              name: 'name',
              id: 'name',
              size: 'LARGE',
              label: 'Name',
              defaultValue: '',
              required: true,
            },
            {
              fieldType: 'TEXTAREA',
              name: 'description',
              id: 'description',
              size: 'LARGE',
              label: 'Description',
              defaultValue: '',
              rows: 4,
              required: true,
            },
            {
              fieldType: 'SELECT',
              name: 'visibility',
              id: 'visibility',
              size: 'LARGE',
              label: 'Visibility',
              defaultValue: null,
              required: true,
              choices: [
                {
                  text: 'Admins Only',
                  value: 'Admins Only',
                },
                {
                  text: 'Evaluators Only',
                  value: 'Evaluators Only',
                },
                {
                  text: 'Public',
                  value: 'Public',
                }
              ],
            }
          ]}
        />
      }

      {sectionToEdit &&
        <FormModal
          title="Edit Section"
          submitLabel="Save"
          handleSubmit={handleEditSection}
          handleCancel={closeEditSectionModal}
          cols={4}
          loading={editSectionIsLoading}
          fields={[
            {
              fieldType: 'INPUT',
              type: 'text',
              name: 'name',
              id: 'name',
              size: 'LARGE',
              label: 'Name',
              defaultValue: sectionToEdit.name,
              required: true,
            },
            {
              fieldType: 'TEXTAREA',
              name: 'description',
              id: 'description',
              size: 'LARGE',
              label: 'Description',
              defaultValue: sectionToEdit.description,
              rows: 4,
              required: true,
            },
            {
              fieldType: 'SELECT',
              name: 'visibility',
              id: 'visibility',
              size: 'LARGE',
              label: 'Visibility',
              defaultValue: sectionToEdit.visibility,
              required: true,
              choices: [
                {
                  text: 'Admins Only',
                  value: 'Admins Only',
                },
                {
                  text: 'Evaluators Only',
                  value: 'Evaluators Only',
                },
                {
                  text: 'Public',
                  value: 'Public',
                }
              ],
            }
          ]}
        />
      }

      {deleteSectionId &&
        <ConfirmModal title='Delete section?' confirmLabel='Delete' handleConfirm={handleDeleteSection} handleCancel={closeDeleteSectionModal} loading={deleteSectionIsLoading} destructive>
          <p>Are you sure you want to delete this section? This action cannot be undone.</p>
        </ConfirmModal>
      }

      {deletionError && 
        <InfoModal title='Error' handleClose={closeDeletionErrorModal} >
          <p>{deletionError}</p>
        </InfoModal>
      }

    </React.Fragment>
  );
}