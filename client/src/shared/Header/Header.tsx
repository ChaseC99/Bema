import { Link } from "react-router-dom";
import { login } from "../../state/appStateReducer";
import useAppState from "../../state/useAppState";
import { displayError } from "../../util/errors";
import request from "../../util/request";
import Button from "../Button/Button";
import "./Header.css";

function Header() {
  const { state, dispatch } = useAppState();

  async function handleReturnToAccount() {
    const data = await request('POST', '/api/auth/assumeUserIdentity', {});
  
    const userData = await request("GET", "/api/internal/users/getFullUserProfile");
    dispatch(login(userData));
  }

  return (
    <header>
      {state.is_impersonated &&
        <div className="banner" data-testid="impersonation-banner">
          <span>You're assuming another user's identity.</span>
          <Button type="tertiary" role="button" action={handleReturnToAccount} text="Return to your account" inverse />
        </div>
      }


      <div className="banner alert" id="incident-banner" data-testid="incident-banner" hidden>
        <svg viewBox="0 0 18 18"><path fillRule="evenodd" clipRule="evenodd" d="M8.26879 5.2875V9.34875C8.26879 9.78367 8.62136 10.1363 9.05629 10.1363C9.49121 10.1363 9.84379 9.78367 9.84379 9.34875V5.2875C9.84379 5.00615 9.69369 4.74618 9.45004 4.60551C9.20638 4.46483 8.90619 4.46483 8.66254 4.60551C8.41888 4.74618 8.26879 5.00615 8.26879 5.2875ZM7.875 12.5003C7.875 11.8479 8.40386 11.319 9.05625 11.319C9.37427 11.3027 9.68431 11.4219 9.90948 11.647C10.1346 11.8722 10.2538 12.1823 10.2375 12.5003C10.2375 13.1527 9.70864 13.6815 9.05625 13.6815C8.40386 13.6815 7.875 13.1527 7.875 12.5003Z" fill="white"></path><path fillRule="evenodd" clipRule="evenodd" d="M0 9C0 4.02944 4.02944 0 9 0C11.3869 0 13.6761 0.948212 15.364 2.63604C17.0518 4.32387 18 6.61305 18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9ZM1.57496 8.99963C1.57496 13.1003 4.89925 16.4246 8.99996 16.4246C13.0981 16.4184 16.4188 13.0978 16.425 8.99963C16.425 4.89892 13.1007 1.57463 8.99996 1.57463C4.89925 1.57463 1.57496 4.89892 1.57496 8.99963Z" fill="white"></path></svg>
        <span className="alert-container">
          <span className="alert-type">System Outage</span><span className="alert-message">- We're currently experiencing problems with the site. Some features may be unavailable.</span>
        </span>
        <Button type="tertiary" inverse role="link" action="/status" text="View Incident" />
      </div>


      <div className="banner alert" id="maintenance-banner" data-testid="maintenance-banner" hidden>
        <svg viewBox="0 0 11 11" ><circle cx="5.5" cy="5.5" r="5" stroke="white" fill="none"></circle><path d="M7.99969 4.26634V4.37646C7.99969 4.74152 7.85438 5.09163 7.59574 5.34977C7.33709 5.6079 6.98629 5.75292 6.6205 5.75292C6.43552 5.75363 6.25239 5.71614 6.08262 5.64281L3.84131 7.9002C3.77708 7.96378 3.6904 7.99962 3.59995 8H3.52754C3.43708 7.99962 3.3504 7.96378 3.28618 7.9002L3.09999 7.71438C3.03629 7.65029 3.00038 7.56378 3 7.4735V7.41156C3.00038 7.32129 3.03629 7.23478 3.09999 7.17068L5.34131 4.91328C5.27138 4.7431 5.23734 4.56036 5.24131 4.37646C5.24131 4.0114 5.38663 3.66129 5.64527 3.40316C5.90392 3.14502 6.25472 3 6.6205 3H6.73084C6.77743 3.00011 6.82208 3.01868 6.85496 3.05162L6.91358 3.11012C6.92974 3.12611 6.94256 3.14514 6.95132 3.16611C6.96007 3.18708 6.96458 3.20956 6.96458 3.23228C6.96458 3.25499 6.96007 3.27748 6.95132 3.29845C6.94256 3.31941 6.92974 3.33844 6.91358 3.35444L6.3757 3.89126C6.34411 3.92342 6.32642 3.96666 6.32642 4.0117C6.32642 4.05673 6.34411 4.09998 6.3757 4.13214L6.86531 4.62079C6.89795 4.65152 6.94112 4.66864 6.98599 4.66864C7.03086 4.66864 7.07403 4.65152 7.10667 4.62079L7.6549 4.08396C7.67092 4.06784 7.68999 4.05504 7.711 4.0463C7.73201 4.03757 7.75454 4.03307 7.7773 4.03307C7.80006 4.03307 7.82259 4.03757 7.8436 4.0463C7.86461 4.05504 7.88367 4.06784 7.8997 4.08396L7.95831 4.14246C7.98756 4.17691 8.00238 4.22128 7.99969 4.26634Z" fill="white"></path></svg>
        <span className="alert-container">
          <span className="alert-type">Ongoing Maintenance</span><span className="alert-message">- The site is currently undergoing maintenance. Some features may be temporarily unavailable.</span>
        </span>
        <Button type="tertiary" inverse role="link" action="/status" text="View Maintenance" />
      </div>

      <nav>
        <div className="logo-container" data-testid="logo-container">
          <Link to="/">
            <svg viewBox="0 0 27 28" data-testid="logo-icon">
              <path fill="#14bf96" d="M2.31,5.8A3.56,3.56,0,0,0,.66,8.6V19.4a3.56,3.56,0,0,0,1.65,2.8L12,27.62a3.75,3.75,0,0,0,3.3,0L25,22.2a3.56,3.56,0,0,0,1.65-2.8V8.6A3.56,3.56,0,0,0,25,5.8L15.31.38a3.75,3.75,0,0,0-3.3,0Z"></path>
              <path fill="#fff" d="M23.61,11.32c-5.38,0-9.4,4.46-9.4,9.93v.23H13.13v-.23c0-5.47-4-9.91-9.42-9.93,0,.34,0,.69,0,1a9.91,9.91,0,0,0,6.4,9.32,10.47,10.47,0,0,0,3.59.64,10.64,10.64,0,0,0,3.62-.64,9.92,9.92,0,0,0,6.39-9.32C23.66,12,23.64,11.66,23.61,11.32Z"></path>
              <circle fill="#fff" cx="13.66" cy="8.74" r="3"></circle>
            </svg>
            <h1 data-testid="logo-text">Bema</h1>
          </Link>
        </div>
        <div className="links" data-testid="nav-links">
          <span>
            <Link to="/admin/dashboard" data-testid="/admin/dashboard">Dashboard</Link>
          </span>

          {(state.user?.permissions.judge_entries || !state.logged_in) &&
            <span>
              <Link to="/judging" data-testid="/judging">Judge</Link>
            </span>
          }

          <span>
            <Link to="kb" data-testid="/kb">Resources</Link>
          </span>

          {state.logged_in &&
            <span>
              <Link to={"/evaluator/" + state.user?.evaluator_id} data-testid="/evaluator">Profile</Link>
            </span>
          }

          {state.logged_in &&
            <span>
              <Link to="/logout" data-testid="/logout">Logout</Link>
            </span>
          }


          {!state.logged_in &&
            <span>
              <Link to="/login" data-testid="/login">Login</Link>
            </span>
          }
        </div>
      </nav>
    </header >
  )
}

export default Header;