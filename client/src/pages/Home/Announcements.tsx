import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import Button from "../../shared/Button/Button";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import useAppState from "../../state/useAppState";
import AnnouncementCard from "./AnnouncementCard";
import { fetchAnnouncements } from "./fetchAnnouncements";
import request from "../../util/request";
import { ConfirmModal, FormModal } from "../../shared/Modals";

type Announcement = {
  message_author: string
  message_content: string
  message_date: string
  message_id: number
  message_title: string
  public: boolean
}

type CreateAnnouncement = {
  message_title: string
  message_content: string
  public: boolean
}

type EditAnnouncement = {
  message_title: string
  message_content: string
  public: boolean
}

function Announcements() {
  const { state } = useAppState();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number>();
  const [shouldShowCreateModal, setShouldShowCreateModal] = useState<boolean>(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements()
      .then((m: Announcement[]) => {
        setAnnouncements(m);
        setIsLoading(false);
      });
  }, []);

  const confirmDeleteAnnouncement = (id: number) => {
    setConfirmDeleteId(id);
  }

  const deleteAnnouncement = async (id: number) => {
    setConfirmDeleteId(undefined);

    const data = await request("DELETE", "/api/internal/messages", {
      message_id: id
    });

    if (!data.error) {
      let newAnnouncements = [...announcements];
      for (let i = 0; i < newAnnouncements.length; i++) {
        if (newAnnouncements[i].message_id === id) {
          newAnnouncements.splice(i, 1);
          break;
        }
      }

      setAnnouncements(newAnnouncements);
    }
    else {
      console.log(data.error);
    }
  }

  const hideDeleteModal = () => {
    setConfirmDeleteId(undefined);
  }

  const createAnnouncement = async (values: { [name: string]: any; }) => {
    const data = values as CreateAnnouncement;

    await request("POST", "/api/internal/messages", {
      message_title: data.message_title,
      message_content: data.message_content,
      public: data.public
    });

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
      message_id: announcementToEdit?.message_id,
      message_title: data.message_title,
      message_content: data.message_content,
      public: data.public
    });

    const newAnnouncements = [...announcements];
    for (let i = 0; i < newAnnouncements.length; i++) {
      if (newAnnouncements[i].message_id === announcementToEdit?.message_id) {
        newAnnouncements[i].message_title = data.message_title;
        newAnnouncements[i].message_content = data.message_content;
        newAnnouncements[i].public = data.public;
        break;
      }
    }

    setAnnouncements(newAnnouncements);
    setAnnouncementToEdit(null);
  }

  const showEditAnnouncementModal = (id: number) => {
    const m = announcements.find((a) => a.message_id === id) || null;
    setAnnouncementToEdit(m);
  }

  const hideEditAnnouncementModal = () => {
    setAnnouncementToEdit(null);
  }

  return (
    <React.Fragment>
      <section id="announcement-section" className="container center">
        <div className="col-6">
          <div className="section-header">
            <h2 data-testid="announcement-header">Announcements</h2>

            <span className="section-actions" data-testid="announcement-section-actions">
              {(state.user?.permissions.manage_announcements || state.is_admin) && <Button type="tertiary" role="button" action={showCreateAnnouncementModal} text="New Announcement" />}
            </span>
          </div>
          <div className="section-body" data-testid="announcement-section-body">
            {isLoading && <LoadingSpinner size="MEDIUM" testId="announcements-spinner" />}

            {!isLoading && announcements.map((a) => {
              return (
                <AnnouncementCard author={a.message_author} date={a.message_date} id={a.message_id} title={a.message_title} isPublic={a.public} key={"announcement-" + a.message_id} handleDelete={confirmDeleteAnnouncement} handleEdit={showEditAnnouncementModal} >
                  {parse(a.message_content.replaceAll("\n\n", "</p><p>"))}
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
          handleSubmit={createAnnouncement}
          handleCancel={hideCreateAnnouncementModal}
          cols={5}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "message_title",
              id: "announcement-title",
              size: "LARGE",
              label: "Title",
              defaultValue: "",
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
              defaultValue: announcementToEdit.message_title,
            },
            {
              fieldType: "TEXTEDITOR",
              name: "message_content",
              id: "announcement-content",
              label: "Message",
              defaultValue: announcementToEdit.message_content,
            },
            {
              fieldType: "CHECKBOX",
              name: "public",
              id: "announcement-is-public",
              size: "LARGE",
              label: "Public Announcement",
              description: "Displays the announcement to all users, even if not logged in.",
              defaultValue: announcementToEdit.public,
            }
          ]}
        />
      }
    </React.Fragment>
  );
}

export default Announcements;