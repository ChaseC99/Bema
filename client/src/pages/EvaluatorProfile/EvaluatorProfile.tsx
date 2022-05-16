import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ActionMenu from "../../shared/ActionMenu";
import ExternalLink from "../../shared/ExternalLink";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { FormModal } from "../../shared/Modals";
import useAppState from "../../state/useAppState";
import request from "../../util/request";
import { fetchEvaluatorData, fetchEvaluatorStats } from "./fetchEvaluatorData";

type User = {
  account_locked: boolean
  avatar_url: string
  created_tstz: string
  dt_term_end: string
  dt_term_start: string
  email: string
  evaluator_id: number
  evaluator_kaid: string
  evaluator_name: string
  group_id: number
  is_admin: boolean
  logged_in_tstz: string
  nickname: string
  receive_emails: boolean
  username: string
}

type UserStats = {
  totalContestsJudged: number
  totalEvaluations: number
}

function EvaluatorProfile() {
  const { evaluatorId } = useParams();
  const { state } = useAppState();
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);

  useEffect(() => {
    fetchEvaluatorData(parseInt(evaluatorId || ""))
      .then((data) => {
        setUser(data.evaluator);
      });

    fetchEvaluatorStats(parseInt(evaluatorId || ""))
      .then((data) => {
        setUserStats(data);
      });
  }, [evaluatorId]);

  const openEditProfileModal = () => {
    setShowEditProfileModal(true);
  }

  const closeEditProfileModal = () => {
    setShowEditProfileModal(false);
  }

  const handleEditProfile = async (values: { [name: string]: any}) => {
    if (!user) {
      return;
    }

    await request("PUT", "/api/internal/users", {
      evaluator_id: parseInt(evaluatorId || ""),
      nickname: values.nickname,
      email: values.email.length > 0 ? values.email : null,
      receive_emails: values.receive_emails
    });

    const newUser: User = {
      ...user,
      nickname: values.nickname,
      email: values.email,
      receive_emails: values.receive_emails
    }

    setUser(newUser);
    closeEditProfileModal();
  }

  const openChangePasswordModal = () => {
    setShowChangePasswordModal(true);
  }

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
  }

  const handleChangePassword = () => {

  }

  return (
    <React.Fragment>
      <section className="container center col-12">
        <div className="col-8">
          <div className="section-header">
            {state.user?.evaluator_id === parseInt(evaluatorId || "") ?
              <h2>Your Profile</h2>
              :
              <h2>User Profile {user && "- " + user.nickname}</h2>
            }
          </div>
          <div className="section-body">
            <div className="card col-6">
              <div className="card-header">
                <h3>Evaluator Information</h3>
              </div>
              <div className="card-body">
                {!user && <LoadingSpinner size="MEDIUM" />}

                {user &&
                  <React.Fragment>
                    <p><span className="label">KA Profile: </span><ExternalLink to={"https://www.khanacademy.org/profile/" + user.evaluator_kaid}>View</ExternalLink></p>
                    <p><span className="label">Term Start: </span>{user.dt_term_start}</p>
                    <p><span className="label">Term End: </span>{user.dt_term_end ? user.dt_term_end : "N/A"}</p>
                  </React.Fragment>
                }
              </div>
            </div>

            <div className="card col-6">
              <div className="card-header">
                <h3>Judging Information</h3>
              </div>
              <div className="card-body">
                {(!user || !userStats) && <LoadingSpinner size="MEDIUM" />}

                {(user && userStats) &&
                  <React.Fragment>
                    <p><span className="label">Judging Group: </span>{user.group_id}</p>
                    <p><span className="label">Contests Judged: </span>{userStats.totalContestsJudged}</p>
                    <p><span className="label">Total Entries Scored: </span>{userStats.totalEvaluations}</p>
                  </React.Fragment>
                }
              </div>
            </div>

            {((state.user?.evaluator_id === parseInt(evaluatorId || "")) || state.is_admin || state.user?.permissions.view_all_users) &&
              <div className="card col-6">
                <div className="card-header">
                  <h3>Personal Information</h3>
                  {((state.user?.evaluator_id === parseInt(evaluatorId || "")) && !state.is_admin && !state.user.permissions.edit_user_profiles) &&
                    <ActionMenu actions={[
                      {
                        role: "button",
                        action: openEditProfileModal,
                        text: "Edit profile"
                      }
                    ]}
                    />
                  }
                </div>
                <div className="card-body">
                  {!user && <LoadingSpinner size="MEDIUM" />}

                  {user &&
                    <React.Fragment>
                      <p><span className="label">Display Name: </span>{user.nickname}</p>
                      <p><span className="label">Email: </span>{user.email}</p>
                      <p><span className="label">Receive email notifications: </span>{user.receive_emails ? "Yes" : "No"}</p>
                    </React.Fragment>
                  }
                </div>
              </div>
            }

            {((state.user?.evaluator_id === parseInt(evaluatorId || "")) || state.is_admin || state.user?.permissions.view_all_users) &&
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
                  {!user && <LoadingSpinner size="MEDIUM" />}

                  {user &&
                    <React.Fragment>
                      <p><span className="label">Username: </span>{user.username}</p>
                      <p><span className="label">Last Login: </span>{user.logged_in_tstz}</p>
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
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "nickname",
              id: "nickname",
              label: "Nickname",
              description: "This is the name that is shown to other Bema users.",
              size: "LARGE",
              defaultValue: user?.nickname || ""
            },
            {
              fieldType: "INPUT",
              type: "email",
              name: "email",
              id: "email",
              label: "Email",
              size: "LARGE",
              defaultValue: user?.email || ""
            },
            {
              fieldType: "CHECKBOX",
              name: "receive_emails",
              id: "receive-emails",
              label: "Receive email notifications",
              size: "LARGE",
              defaultValue: user?.receive_emails || false
            }
          ]}
        />
      }
    </React.Fragment>
  );
}

export default EvaluatorProfile;