import React, { useState } from "react";
import ExternalLink from "../../shared/ExternalLink";
import { Form } from "../../shared/Forms";
import InfoModal from "../../shared/Modals/InfoModal/InfoModal";
import { login } from "../../state/appStateReducer";
import useAppState from "../../state/useAppState";
import request from "../../util/request";
import "./Login.css";

function Login() {
  const [showForgotPwModal, setShowForgotPwModal] = useState<boolean>(false);
  const [wasFailedLogin, setWasFailedLogin] = useState<boolean>(false);
  const [previousLogin, setPreviousLogin] = useState<{username: string, password: string}>({username: "", password: ""});
  const { dispatch } = useAppState();

  const handleLogin = async (values: { [name: string]: any }) => {
    const loginData = await request("POST", "/api/auth/login", {
      username: values.username,
      password: values.password
    });

    if (loginData.error?.status === 401) {
      setPreviousLogin({
        username: values.username,
        password: values.password
      });
      setWasFailedLogin(true);
    }
    else {
      const userData = await request("GET", "/api/internal/users/getFullUserProfile");
      dispatch(login(userData));
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