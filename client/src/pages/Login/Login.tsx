import { gql, useMutation } from "@apollo/client";
import React, { useState } from "react";
import ExternalLink from "../../shared/ExternalLink";
import { Form } from "../../shared/Forms";
import InfoModal from "../../shared/Modals/InfoModal/InfoModal";
import { setCookie } from "../../util/cookies";
import useAppError from "../../util/errors";
import "./Login.css";

type LoginResponse = {
  data: {
    success: boolean
    isDisabled: boolean
    token: string | null
  } | null
}

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    data: login(username: $username, password: $password) {
      success
      isDisabled
      token
    }
  }
`;

function Login() {
  const { handleGQLError } = useAppError();
  const [showForgotPwModal, setShowForgotPwModal] = useState<boolean>(false);
  const [wasFailedLogin, setWasFailedLogin] = useState<boolean>(false);
  const [isAccountLocked, setIsAccountLocked] = useState<boolean>(false);
  const [previousLogin, setPreviousLogin] = useState<{ username: string, password: string }>({ username: "", password: "" });
  const [login, { loading: loginIsLoading, data: loginResponse }] = useMutation<LoginResponse>(LOGIN, { onError: handleGQLError })

  const handleLogin = async (values: { [name: string]: any }) => {
    const response = await login({
      variables: {
        username: values.username,
        password: values.password
      }
    });
    const data = response?.data?.data;

    if (data?.success && data.token) {
      setCookie("auth", data.token, 4);
      setWasFailedLogin(false);
      window.location.reload();
    }
    else if (data?.isDisabled) {
      setIsAccountLocked(true);
    }
    else {
      setPreviousLogin({
        username: values.username,
        password: values.password
      });
      setWasFailedLogin(true);
    }
  }

  const openForgotPasswordModal = () => {
    setShowForgotPwModal(true);
  }

  const closeForgotPasswordModal = () => {
    setShowForgotPwModal(false);
  }

  return (
    <React.Fragment>
      <div className="container col-12 center login-wrapper">
        <div className="login-card container col-8">
          <div className="col-6 card-section container center">
            <div className="col-8">
              <h1>Login</h1>
              <p>Good to see you again!</p>
              <div className="bema-info">
                <p>Bema is an internal tool used by the KACP Challenge Council to score contest submissions.</p>
                <p>If you're a council member and need an account, please <ExternalLink to="https://support.khanacademy.org/hc/en-us/community/topics/360000022111">contact us here</ExternalLink>.</p>
              </div>
            </div>
          </div>
          <div className="col-6 card-section container center">
            <div className="col-8">
              <Form
                onSubmit={handleLogin}
                submitLabel="Login"
                cols={12}
                loading={loginIsLoading}
                fields={[
                  {
                    fieldType: "INPUT",
                    type: "text",
                    name: "username",
                    id: "username",
                    label: "Username",
                    defaultValue: previousLogin.username,
                    required: true,
                    size: "LARGE"
                  },
                  {
                    fieldType: "INPUT",
                    type: "password",
                    name: "password",
                    id: "password",
                    label: "Password",
                    defaultValue: previousLogin.password,
                    required: true,
                    size: "LARGE",
                    button: {
                      action: openForgotPasswordModal,
                      text: "Forgot password?"
                    }
                  }
                ]}
              />

              {wasFailedLogin &&
                <p className="failed-login">Your username or password is incorrect.</p>
              }

              {isAccountLocked &&
                <p className="failed-login">Your account is disabled. Please contact an administrator for assistance.</p>
              }
            </div>
          </div>
        </div>
      </div>

      {showForgotPwModal &&
        <InfoModal title="Forgot password?" handleClose={closeForgotPasswordModal}>
          <p>We do not currently have a password reset feature. If you're having problems logging in, please <ExternalLink to="https://support.khanacademy.org/hc/en-us/community/topics/360000022111">contact us here</ExternalLink> so an administrator can reset your password.</p>
        </InfoModal>
      }
    </React.Fragment>
  );
}

export default Login;