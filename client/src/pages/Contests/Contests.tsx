import React, { useEffect, useState } from "react";
import { Contest } from ".";
import Button from "../../shared/Button";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../shared/Modals";
import AdminSidebar from "../../shared/Sidebars/AdminSidebar";
import useAppState from "../../state/useAppState";
import request from "../../util/request";
import ContestCard from "./ContestCard";
import { gql, useQuery } from "@apollo/client";

const GET_ALL_CONTESTS = gql`
  query GetAllContests {
    contests {
      id
      name
      url
      author
      badgeSlug
      badgeImageUrl
      startDate
      endDate
      isCurrent
      isVotingEnabled
    }
  }
`;

type ContestData = {
  contests: Contest[]
}

function Contests() {
  const { state } = useAppState();
  const [showCreateContest, setShowCreateContest] = useState<boolean>(false);
  const [editContest, setEditContest] = useState<Contest | null>(null);
  const [deleteContestId, setDeleteContestId] = useState<number | null>(null);

  const { loading: isLoading, error, data: contestData, refetch: refetchContests } = useQuery<ContestData>(GET_ALL_CONTESTS);

  const openCreateContestModal = () => {
    setShowCreateContest(true);
  }

  const closeCreateContestModal = () => {
    setShowCreateContest(false);
  }

  const handleCreateContest = async (values: { [name: string]: any }) => {
    await request("POST", "/api/internal/contests", {
      contest_name: values.name,
      contest_url: values.url,
      contest_author: values.author,
      contest_start_date: values.start_date,
      contest_end_date: values.end_date,
      contest_current: values.is_current,
    });

    refetchContests();
    closeCreateContestModal();
  }

  const openEditContestModal = (id: number) => {
    const contest = contestData?.contests.find((c) => c.id === id) || null;
    setEditContest(contest);
  }

  const closeEditContestModal = () => {
    setEditContest(null);
  }

  const handleEditContest = async (values: { [name: string]: any }) => {
    await request("PUT", "/api/internal/contests", {
      edit_contest_id: editContest?.id,
      edit_contest_name: values.name,
      edit_contest_url: values.url,
      edit_contest_author: values.author,
      edit_contest_start_date: values.start_date,
      edit_contest_end_date: values.end_date,
      edit_badge_name: values.badge_name,
      edit_badge_image_url: values.badge_image_url,
      edit_contest_current: values.is_current,
      edit_voting_enabled: values.voting_enabled
    });

    refetchContests();
    closeEditContestModal();
  }

  const openDeleteContestModal = (id: number) => {
    setDeleteContestId(id);
  }

  const closeDeleteContestModal = () => {
    setDeleteContestId(null);
  }

  const handleDeleteContest = async (id: number) => {
    await request("DELETE", "/api/internal/contests", {
      contest_id: id
    });

    refetchContests();
    closeDeleteContestModal();
  }

  return (
    <React.Fragment>
      <AdminSidebar />

      {isLoading && <LoadingSpinner size="LARGE" />}

      {!isLoading &&
        <section id="contests-section" className="container">
          <div className="col-12">
            <div className="section-header">
              <h2 data-testid="contests-header">Contests</h2>

              <span className="section-actions" data-testid="contests-section-actions">
                {(state.isAdmin || state.user?.permissions.edit_contests) &&
                  <Button type="primary" role="button" action={openCreateContestModal} text="New Contest" />
                }
              </span>
            </div>
            <div className="section-body grid" data-testid="contests-section-body">
              {contestData?.contests.map((c) => {
                return (
                  <ContestCard contest={c} handleEditContest={openEditContestModal} handleDeleteContest={openDeleteContestModal} key={c.id} />
                );
              })}
            </div>
          </div>
        </section>
      }

      {showCreateContest &&
        <FormModal
        title="Create Contest"
        submitLabel="Create"
        handleSubmit={handleCreateContest}
        handleCancel={closeCreateContestModal}
        cols={4}
        fields={[
          {
            fieldType: "INPUT",
            type: "text",
            name: "name",
            id: "name",
            size: "LARGE",
            label: "Name",
            defaultValue: "",
            placeholder: "Contest: Name Here",
            required: true
          },
          {
            fieldType: "INPUT",
            type: "text",
            name: "url",
            id: "url",
            size: "LARGE",
            label: "URL",
            description: "A link to the contest program. This is where entries will be imported from.",
            defaultValue: "",
            required: true
          },
          {
            fieldType: "INPUT",
            type: "text",
            name: "author",
            id: "author",
            size: "LARGE",
            label: "Author",
            description: "The creator of the announcement program code.",
            defaultValue: ""
          },
          {
            fieldType: "DATE",
            name: "start_date",
            id: "start-date",
            size: "MEDIUM",
            label: "Start Date",
            defaultValue: "",
            required: true
          },
          {
            fieldType: "DATE",
            name: "end_date",
            id: "end-date",
            size: "MEDIUM",
            label: "End Date",
            defaultValue: "",
            required: true
          },
          {
            fieldType: "CHECKBOX",
            name: "is_current",
            id: "is-current",
            size: "LARGE",
            label: "Current Contest",
            description: "Enables judging for the contest, and shows an Active badge on the contests page.",
            defaultValue: false
          }
        ]}
      />
      }

      {editContest &&
        <FormModal
          title="Edit Contest"
          submitLabel="Save"
          handleSubmit={handleEditContest}
          handleCancel={closeEditContestModal}
          cols={4}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "name",
              id: "name",
              size: "LARGE",
              label: "Name",
              defaultValue: editContest.name,
              placeholder: "Contest: Name Here",
              required: true
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "url",
              id: "url",
              size: "LARGE",
              label: "URL",
              description: "A link to the contest program. This is where entries will be imported from.",
              defaultValue: editContest.url || "",
              required: true
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "author",
              id: "author",
              size: "LARGE",
              label: "Author",
              description: "The creator of the announcement program code.",
              defaultValue: editContest.author || ""
            },
            {
              fieldType: "DATE",
              name: "start_date",
              id: "start-date",
              size: "MEDIUM",
              label: "Start Date",
              defaultValue: editContest.startDate || "",
              required: true
            },
            {
              fieldType: "DATE",
              name: "end_date",
              id: "end-date",
              size: "MEDIUM",
              label: "End Date",
              defaultValue: editContest.endDate || "",
              required: true
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "badge_name",
              id: "badge-name",
              size: "LARGE",
              label: "Badge Name",
              description: "The badge slug in the badge URL. (e.g. contest-fantasy-landscape)",
              defaultValue: editContest.badgeSlug || "",
              placeholder: "e.x. contest-fantasy-landscape"
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "badge_image_url",
              id: "badge-image-url",
              size: "LARGE",
              label: "Badge Image URL",
              defaultValue: editContest.badgeImageUrl || ""
            },
            {
              fieldType: "CHECKBOX",
              name: "is_current",
              id: "is-current",
              size: "LARGE",
              label: "Current Contest",
              description: "Enables judging for the contest, and shows an Active badge on the contests page.",
              defaultValue: editContest.isCurrent
            },
            {
              fieldType: "CHECKBOX",
              name: "voting_enabled",
              id: "voting-enabled",
              size: "LARGE",
              label: "Enable Voting",
              description: "Enables judges to vote for winning entries.",
              defaultValue: editContest.isVotingEnabled || false
            }
          ]}
        />
      }

      {deleteContestId &&
        <ConfirmModal
          title="Delete contest?"
          confirmLabel="Delete"
          handleConfirm={handleDeleteContest}
          handleCancel={closeDeleteContestModal}
          destructive
          data={deleteContestId}
        >
          <p>Are you sure you want to delete this contest? This action cannot be undone.</p>
          <p><strong>IMPORTANT:</strong> This will delete all information associated with the contest, including all entries and evaluations.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default Contests;