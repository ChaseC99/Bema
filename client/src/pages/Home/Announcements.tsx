import React, { useState } from "react";
import parse from "html-react-parser";
import Button from "../../shared/Button/Button";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import useAppState from "../../state/useAppState";
import AnnouncementCard from "./AnnouncementCard";
import request from "../../util/request";
import { ConfirmModal, FormModal } from "../../shared/Modals";
import { gql, useMutation, useQuery } from "@apollo/client";
import useAppError from "../../util/errors";

type EditAnnouncement = {
  message_title: string
  message_content: string
  public: boolean
}

type Announcement = {
  id: string
  author: {
    id: string
    nickname: string
  } | null
  created: string
  title: string
  content: string
  isPublic: boolean
}

type GetAnnouncementsResponse = {
  announcements: Announcement[]
}

const GET_ANNOUNCEMENTS = gql`
  query GetAnnouncements {
    announcements {
      id
      author {
        id
        nickname
      }
      created
      title
      content
      isPublic
    }
  }
`;

type CreateAnnouncementResponse = {
  announcement: {
    id: string
  }
}

const CREATE_ANNOUNCEMENT = gql`
  mutation CreateAnnouncement($input: AnnouncementInput) {
    announcement: createAnnouncement(input: $input) {
      id
    }
  }
`;

function Announcements() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number>();
  const [shouldShowCreateModal, setShouldShowCreateModal] = useState<boolean>(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

  const { loading: announcementsIsLoading, data: announcementsData, refetch: refetchAnnouncements } = useQuery<GetAnnouncementsResponse>(GET_ANNOUNCEMENTS, { onError: handleGQLError });
  const [createAnnouncement, { loading: createAnnouncementIsLoading }] = useMutation<CreateAnnouncementResponse>(CREATE_ANNOUNCEMENT);

  const confirmDeleteAnnouncement = (id: number) => {
    setConfirmDeleteId(id);
  }

  const deleteAnnouncement = async (id: number) => {
    setConfirmDeleteId(undefined);

    await request("DELETE", "/api/internal/messages", {
      message_id: id
    });

    refetchAnnouncements();
  }

  const hideDeleteModal = () => {
    setConfirmDeleteId(undefined);
  }

  const handleCreateAnnouncement = async (values: { [name: string]: any; }) => {
    await createAnnouncement({
      variables: {
        "input": {
          "title": values.message_title,
          "content": values.message_content,
          "isPublic": values.public
        }
      }
    });

    refetchAnnouncements();
    setShouldShowCreateModal(false);
  }

  const showCreateAnnouncementModal = () => {
    setShouldShowCreateModal(true);
  }

  const hideCreateAnnouncementModal = () => {
    setShouldShowCreateModal(false);
  }

  const editAnnouncement = async (values: { [name: string]: any; }) => {
    const data = values as EditAnnouncement;

    await request("PUT", "/api/internal/messages", {
      message_id: announcementToEdit?.id,
      message_title: data.message_title,
      message_content: data.message_content,
      public: data.public
    });

    refetchAnnouncements();
    setAnnouncementToEdit(null);
  }

  const showEditAnnouncementModal = (id: number) => {
    const m = announcementsData?.announcements.find((a) => parseInt(a.id) === id) || null;
    setAnnouncementToEdit(m);
  }

  const hideEditAnnouncementModal = () => {
    setAnnouncementToEdit(null);
  }

  return (
    <React.Fragment>
      <section id="announcement-section" className="container center col-12">
        <div className="col-6">
          <div className="section-header">
            <h2 data-testid="announcement-header">Announcements</h2>

            <span className="section-actions" data-testid="announcement-section-actions">
              {(state.user?.permissions.manage_announcements || state.is_admin) && <Button type="tertiary" role="button" action={showCreateAnnouncementModal} text="New Announcement" />}
            </span>
          </div>
          <div className="section-body" data-testid="announcement-section-body">
            {announcementsIsLoading && <LoadingSpinner size="MEDIUM" testId="announcements-spinner" />}

            {!announcementsIsLoading && announcementsData?.announcements.map((a) => {
              return (
                <AnnouncementCard authorId={a.author ? parseInt(a.author.id) : null} authorNickname={a.author ? a.author.nickname : null} date={a.created} id={parseInt(a.id)} title={a.title} isPublic={a.isPublic} key={"announcement-" + a.id} handleDelete={confirmDeleteAnnouncement} handleEdit={showEditAnnouncementModal} >
                  {parse(a.content.replaceAll("\n\n", "</p><p>"))}
                </AnnouncementCard>
              );
            })}
          </div>
        </div>
      </section>

      {confirmDeleteId &&
        <ConfirmModal title="Delete announcement?" confirmLabel="Delete" handleConfirm={deleteAnnouncement} handleCancel={hideDeleteModal} data={confirmDeleteId} destructive>
          <p>Are you sure you want to delete this announcement? This action cannot be undone.</p>
        </ConfirmModal>
      }

      {shouldShowCreateModal &&
        <FormModal
          title="Create announcement"
          submitLabel="Create"
          handleSubmit={handleCreateAnnouncement}
          handleCancel={hideCreateAnnouncementModal}
          cols={5}
          loading={createAnnouncementIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "message_title",
              id: "announcement-title",
              size: "LARGE",
              label: "Title",
              defaultValue: "",
              required: true
            },
            {
              fieldType: "TEXTEDITOR",
              name: "message_content",
              id: "announcement-content",
              label: "Message",
              defaultValue: "",
            },
            {
              fieldType: "CHECKBOX",
              name: "public",
              id: "announcement-is-public",
              size: "LARGE",
              label: "Public Announcement",
              description: "Displays the announcement to all users, even if not logged in.",
              defaultValue: false,
            }
          ]}
        />
      }

      {announcementToEdit &&
        <FormModal
          title="Edit announcement"
          submitLabel="Save"
          handleSubmit={editAnnouncement}
          handleCancel={hideEditAnnouncementModal}
          cols={5}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "message_title",
              id: "announcement-title",
              size: "LARGE",
              label: "Title",
              defaultValue: announcementToEdit.title,
              required: true
            },
            {
              fieldType: "TEXTEDITOR",
              name: "message_content",
              id: "announcement-content",
              label: "Message",
              defaultValue: announcementToEdit.content,
            },
            {
              fieldType: "CHECKBOX",
              name: "public",
              id: "announcement-is-public",
              size: "LARGE",
              label: "Public Announcement",
              description: "Displays the announcement to all users, even if not logged in.",
              defaultValue: announcementToEdit.isPublic,
            }
          ]}
        />
      }
    </React.Fragment>
  );
}

export default Announcements;