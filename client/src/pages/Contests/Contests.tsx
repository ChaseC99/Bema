import React, { useState } from "react";
import { Contest } from ".";
import Button from "../../shared/Button";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../shared/Modals";
import AdminSidebar from "../../shared/Sidebars/AdminSidebar";
import useAppState from "../../state/useAppState";
import ContestCard from "./ContestCard";
import { gql, useMutation, useQuery } from "@apollo/client";
import useAppError from "../../util/errors";

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

type ContestMutationResponse = {
  contest: Contest
}

const CREATE_CONTEST = gql`
  mutation CreateContest($input: CreateContestInput!) {
    createContest(input: $input) {
      id
      name
      url
      author
      badgeSlug
      badgeImageUrl
      isCurrent
      startDate
      endDate
      isVotingEnabled
    }
  }
`;

const EDIT_CONTEST = gql`
  mutation EditContest($id: ID!, $input: EditContestInput!) {
    editContest(id: $id, input: $input) {
      id
      name
      url
      author
      badgeSlug
      badgeImageUrl
      isCurrent
      startDate
      endDate
      isVotingEnabled
    }
  }
`;

const DELETE_CONTEST = gql`
  mutation DeleteContest($id: ID!) {
    deleteContest(id: $id) {
      id
      name
      url
      author
      badgeSlug
      badgeImageUrl
      isCurrent
      startDate
      endDate
      isVotingEnabled
    }
  }
`;

function Contests() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [showCreateContest, setShowCreateContest] = useState<boolean>(false);
  const [contestToEdit, setContestToEdit] = useState<Contest | null>(null);
  const [deleteContestId, setDeleteContestId] = useState<number | null>(null);

  const { loading: isLoading, data: contestData, refetch: refetchContests } = useQuery<ContestData>(GET_ALL_CONTESTS, { onError: handleGQLError });
  const [createContest, { loading: createContestIsLoading }] = useMutation<ContestMutationResponse>(CREATE_CONTEST, { onError: handleGQLError });
  const [editContest, { loading: editContestIsLoading }] = useMutation<ContestMutationResponse>(EDIT_CONTEST, { onError: handleGQLError });
  const [deleteContest, { loading: deleteContestIsLoading }] = useMutation<ContestMutationResponse>(DELETE_CONTEST, { onError: handleGQLError });

  const openCreateContestModal = () => {
    setShowCreateContest(true);
  }

  const closeCreateContestModal = () => {
    setShowCreateContest(false);
  }

  const handleCreateContest = async (values: { [name: string]: any }) => {
    await createContest({
      variables: {
        input: {
          name: values.name,
          url: values.url,
          author: values.author,
          isCurrent: values.is_current,
          startDate: values.start_date,
          endDate: values.end_date
        }
      }
    });

    refetchContests();
    closeCreateContestModal();
  }

  const openEditContestModal = (id: number) => {
    const contest = contestData?.contests.find((c) => c.id === id) || null;
    setContestToEdit(contest);
  }

  const closeEditContestModal = () => {
    setContestToEdit(null);
  }

  const handleEditContest = async (values: { [name: string]: any }) => {
    if (!contestToEdit) {
      return;
    }

    await editContest({
      variables: {
        id: contestToEdit?.id,
        input: {
          name: values.name,
          url: values.url,
          author: values.author,
          isCurrent: values.is_current,
          startDate: values.start_date,
          endDate: values.end_date,
          isVotingEnabled: values.voting_enabled,
          badgeSlug: values.badge_name,
          badgeImageUrl: values.badge_image_url
        }
      }
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
    await deleteContest({
      variables: {
        id: id
      }
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
          loading={createContestIsLoading}
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

      {contestToEdit &&
        <FormModal
          title="Edit Contest"
          submitLabel="Save"
          handleSubmit={handleEditContest}
          handleCancel={closeEditContestModal}
          cols={4}
          loading={editContestIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "name",
              id: "name",
              size: "LARGE",
              label: "Name",
              defaultValue: contestToEdit.name,
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
              defaultValue: contestToEdit.url || "",
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
              defaultValue: contestToEdit.author || ""
            },
            {
              fieldType: "DATE",
              name: "start_date",
              id: "start-date",
              size: "MEDIUM",
              label: "Start Date",
              defaultValue: contestToEdit.startDate || "",
              required: true
            },
            {
              fieldType: "DATE",
              name: "end_date",
              id: "end-date",
              size: "MEDIUM",
              label: "End Date",
              defaultValue: contestToEdit.endDate || "",
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
              defaultValue: contestToEdit.badgeSlug || "",
              placeholder: "e.x. contest-fantasy-landscape"
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "badge_image_url",
              id: "badge-image-url",
              size: "LARGE",
              label: "Badge Image URL",
              defaultValue: contestToEdit.badgeImageUrl || ""
            },
            {
              fieldType: "CHECKBOX",
              name: "is_current",
              id: "is-current",
              size: "LARGE",
              label: "Current Contest",
              description: "Enables judging for the contest, and shows an Active badge on the contests page.",
              defaultValue: contestToEdit.isCurrent
            },
            {
              fieldType: "CHECKBOX",
              name: "voting_enabled",
              id: "voting-enabled",
              size: "LARGE",
              label: "Enable Voting",
              description: "Enables judges to vote for winning entries.",
              defaultValue: contestToEdit.isVotingEnabled || false
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
          loading={deleteContestIsLoading}
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