import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ActionMenu from "../../shared/ActionMenu";
import Button from "../../shared/Button";
import ExternalLink from "../../shared/ExternalLink";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { FormModal } from "../../shared/Modals";
import useAppState from "../../state/useAppState";
import useAppError from "../../util/errors";
import request from "../../util/request";

type GetUserProfileResponse = {
  user: {
    id: string
    name: string
    nickname: string | null
    kaid: string
    termStart: string | null
    termEnd: string | null
    email: string | null
    notificationsEnabled: boolean | null
    username: string
    lastLogin: string | null
    isAdmin: boolean
    accountLocked: boolean
    totalEvaluations: number
    totalContestsJudged: number
    assignedGroup: {
      id: string
      name: string
    } | null
  }
}

const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    user(id: $userId) {
      id
      name
      nickname
      kaid
      termStart
      termEnd
      email
      notificationsEnabled
      username
      lastLogin
      isAdmin
      accountLocked
      totalEvaluations
      totalContestsJudged
      assignedGroup {
        id
        name
      }
    }
  }
`;

type User = {
  id: number
  name: string
  kaid: string
  username: string
  nickname: string | null
  email: string | null
  notificationsEnabled: boolean
  termStart: string | null
  termEnd: string | null
  lastLogin: string | null
  accountLocked: boolean
  isAdmin: boolean
}

type EditUserProfileResponse = {
  user: User
}

const EDIT_USER_PROFILE = gql`
  mutation EditUserProfile($id: ID!, $input: EditUserProfileInput!) {
    user: editUserProfile(id: $id, input: $input) {
      id
      name
      kaid
      username
      nickname
      email
      notificationsEnabled
      termStart
      termEnd
      lastLogin
      accountLocked
      isAdmin
    }
  }
`;

type ChangePasswordResponse = {
  success: boolean
}

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($id: ID!, $password: String!) {
    success: changePassword(id: $id, password: $password)
  }
`;

function EvaluatorProfile() {
  const { evaluatorId } = useParams();
  const { handleGQLError } = useAppError();
  const { state } = useAppState();
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);

  const { loading: profileIsLoading, data: profileData, refetch: refetchProfile } = useQuery<GetUserProfileResponse>(GET_USER_PROFILE, {
    variables: {
      userId: evaluatorId
    },
    onError: handleGQLError
  });
  const [changePassword, { loading: changePasswordIsLoading }] = useMutation<ChangePasswordResponse>(CHANGE_PASSWORD, { onError: handleGQLError });
  const [editUserProfile, { loading: editUserProfileIsLoading }] = useMutation<EditUserProfileResponse>(EDIT_USER_PROFILE, { onError: handleGQLError });

  const openEditProfileModal = () => {
    setShowEditProfileModal(true);
  }

  const closeEditProfileModal = () => {
    setShowEditProfileModal(false);
  }

  const handleEditProfile = async (values: { [name: string]: any}) => {
    if (!profileData?.user) {
      return;
    }

    await editUserProfile({
      variables: {
        id: evaluatorId,
        input: {
          name: profileData.user.name,
          email: values.email,
          kaid: profileData.user.kaid,
          username: values.username,
          nickname: values.nickname,
          termStart: profileData.user.termStart,
          termEnd: profileData.user.termEnd,
          isAdmin: profileData.user.isAdmin,
          accountLocked: profileData.user.accountLocked,
          notificationsEnabled: values.receive_emails
        }
      }
    });

    refetchProfile();
    closeEditProfileModal();
  }

  const openChangePasswordModal = () => {
    setShowChangePasswordModal(true);
  }

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
  }

  const handleChangePassword = async (values: { [name: string]: any}) => {
    changePassword({
      variables: {
        id: evaluatorId,
        password: values.password
      }
    });

    closeChangePasswordModal();
  }

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters"
    }

    return null;
  }

  return (
    <React.Fragment>
      <section className="container center col-12">
        <div className="col-8">
          <div className="section-header">
            {state.user?.id === evaluatorId ?
              <h2>Your Profile</h2>
              :
              <h2>User Profile {profileData && "- " + profileData.user.nickname}</h2>
            }
            <span className="section-actions">
              {(state.user?.id === evaluatorId || state.isAdmin || state.user?.permissions.edit_all_evaluations) && <Button type="tertiary" role="button" action={openEditProfileModal} text="Edit Profile" />}
            </span>
          </div>
          <div className="section-body">
            <div className="card col-6">
              <div className="card-header">
                <h3>Evaluator Information</h3>
              </div>
              <div className="card-body">
                {profileIsLoading && <LoadingSpinner size="MEDIUM" />}

                {!profileIsLoading &&
                  <React.Fragment>
                    <p><span className="label">KA Profile: </span><ExternalLink to={"https://www.khanacademy.org/profile/" + profileData?.user.kaid}>View</ExternalLink></p>
                    <p><span className="label">Term Start: </span>{profileData?.user.termStart}</p>
                    <p><span className="label">Term End: </span>{profileData?.user.termEnd ? profileData.user.termEnd : "N/A"}</p>
                  </React.Fragment>
                }
              </div>
            </div>

            <div className="card col-6">
              <div className="card-header">
                <h3>Judging Information</h3>
              </div>
              <div className="card-body">
                {profileIsLoading && <LoadingSpinner size="MEDIUM" />}

                {!profileIsLoading &&
                  <React.Fragment>
                    <p><span className="label">Judging Group: </span>{profileData?.user.assignedGroup ? profileData.user.assignedGroup.name : "None"}</p>
                    <p><span className="label">Contests Judged: </span>{profileData?.user.totalContestsJudged}</p>
                    <p><span className="label">Total Entries Scored: </span>{profileData?.user.totalEvaluations}</p>
                  </React.Fragment>
                }
              </div>
            </div>

            {((state.user?.id === evaluatorId) || state.isAdmin || state.user?.permissions.view_all_users) &&
              <div className="card col-6">
                <div className="card-header">
                  <h3>Personal Information</h3>
                </div>
                <div className="card-body">
                  {profileIsLoading && <LoadingSpinner size="MEDIUM" />}

                  {!profileIsLoading &&
                    <React.Fragment>
                      <p><span className="label">Display Name: </span>{profileData?.user.nickname}</p>
                      <p><span className="label">Email: </span>{profileData?.user.email}</p>
                      <p><span className="label">Receive email notifications: </span>{profileData?.user.notificationsEnabled ? "Yes" : "No"}</p>
                    </React.Fragment>
                  }
                </div>
              </div>
            }

            {((state.user?.id === evaluatorId) || state.isAdmin || state.user?.permissions.view_all_users) &&
              <div className="card col-6">
                <div className="card-header">
                  <h3>Login Information</h3>
                  <ActionMenu actions={[
                      {
                        role: "button",
                        action: openChangePasswordModal,
                        text: "Change password"
                      }
                    ]}
                    />
                </div>
                <div className="card-body">
                  {profileIsLoading && <LoadingSpinner size="MEDIUM" />}

                  {!profileIsLoading &&
                    <React.Fragment>
                      <p><span className="label">Username: </span>{profileData?.user.username}</p>
                      <p><span className="label">Last Login: </span>{profileData?.user.lastLogin}</p>
                    </React.Fragment>
                  }
                </div>
              </div>
            }

          </div>
        </div>
      </section>

      {showEditProfileModal &&
        <FormModal
          title="Edit Profile"
          submitLabel="Save"
          handleSubmit={handleEditProfile}
          handleCancel={closeEditProfileModal}
          cols={4}
          loading={editUserProfileIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "nickname",
              id: "nickname",
              label: "Nickname",
              description: "This is the name that is shown to other Bema users.",
              size: "LARGE",
              defaultValue: profileData?.user.nickname || ""
            },
            {
              fieldType: "INPUT",
              type: "text",
              name: "username",
              id: "username",
              label: "Username",
              description: "This username is used to login to the site.",
              defaultValue: profileData?.user.username || "",
              size: "LARGE",
              required: true
            },
            {
              fieldType: "INPUT",
              type: "email",
              name: "email",
              id: "email",
              label: "Email",
              size: "LARGE",
              defaultValue: profileData?.user.email || ""
            },
            {
              fieldType: "CHECKBOX",
              name: "receive_emails",
              id: "receive-emails",
              label: "Receive email notifications",
              size: "LARGE",
              defaultValue: profileData?.user.notificationsEnabled || false
            }
          ]}
        />
      }

      {showChangePasswordModal &&
        <FormModal
          title="Change Password"
          submitLabel="Change Password"
          handleSubmit={handleChangePassword}
          handleCancel={closeChangePasswordModal}
          cols={4}
          loading={changePasswordIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "password",
              name: "password",
              id: "password",
              label: "New Password",
              size: "LARGE",
              defaultValue: "",
              required: true,
              validate: validatePassword
            }
          ]}
        />
      }
    </React.Fragment>
  );
}

export default EvaluatorProfile;