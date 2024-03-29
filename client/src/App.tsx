import { Routes, Route, useLocation } from "react-router-dom";
import Header from './shared/Header/Header';
import Home from "./pages/Home";
import './App.css';
import Logout from "./pages/Logout";
import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en.json';
import React, { useEffect } from "react";
import NotFound from "./pages/NotFound/NotFound";
import Dashboard from "./pages/Dashboard";
import ExternalRedirect from "./shared/ExternalRedirect";
import Tasks from "./pages/admin/Tasks";
import Results from "./pages/Results";
import Entries from "./pages/Entries";
import Contests from "./pages/Contests";
import { ContestantProfile, ContestantSearch } from "./pages/Contestants";
import Evaluations from "./pages/Evaluations";
import KBHome from "./pages/KnowledgeBase/KBHome";
import KBArticle from "./pages/KnowledgeBase/KBArticle";
import { AllErrors, ErrorDetail } from "./pages/admin/Errors";
import Users from "./pages/admin/Users";
import Login from "./pages/Login";
import { AuthenticatedRoute, ProtectedRoute, UnauthenticatedRoute } from "./shared/Routes";
import Judging from "./pages/Judging";
import AdminJudging from "./pages/admin/Judging";
import Levels from "./pages/admin/Levels";
import EvaluatorProfile from "./pages/EvaluatorProfile";
import ErrorPage from "./shared/ErrorPage";
import useAppError, { clearError } from "./util/errors";
import Explorer from "./pages/admin/Explorer";
import KBAdminHome from "./pages/KnowledgeBase/KBAdminHome";
import KBAdminArticle from "./pages/KnowledgeBase/KBAdminArticle";
import KBAdminSections from "./pages/KnowledgeBase/KBAdminSections";
import InfoModal from "./shared/Modals/InfoModal/InfoModal";
import KBSection from "./pages/KnowledgeBase/KBSection";

function App() {
  const { error, dispatch } = useAppError();
  const location = useLocation();

  useEffect(() => {
    dispatch(clearError());
  }, [location, dispatch]);

  useEffect(() => {
    TimeAgo.setDefaultLocale(en.locale)
    TimeAgo.addLocale(en)
  }, []);

  return (
    <React.Fragment>

      <Header />

      {(error && (error.type === "NOT FOUND" || error?.type === "ERROR")) ?
        <React.Fragment>
          { error.type === "NOT FOUND" && <ErrorPage type="NOT FOUND" message={error.message || "The requested resource does not exist"} /> }
          { error.type === "ERROR" && <ErrorPage type="ERROR" /> }
        </React.Fragment>
        :
        <div className="page-container">
          {(error && error.type === "PERMISSION") &&
            <InfoModal title="Error" handleClose={() => { dispatch(clearError()); }}>
              <p>{error.message}</p>
            </InfoModal>
          }
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/judging" element={<Judging />} />

            <Route path="/contestants" element={<AuthenticatedRoute><ContestantSearch /></AuthenticatedRoute>} />
            <Route path="/contestants/:contestantKaid" element={<AuthenticatedRoute><ContestantProfile /></AuthenticatedRoute>} />

            <Route path="/evaluator/:evaluatorId" element={<AuthenticatedRoute><EvaluatorProfile /></AuthenticatedRoute>} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/evaluations/:evaluatorId/:contestId" element={<AuthenticatedRoute><Evaluations /></AuthenticatedRoute>} />
            <Route path="/entries/:contestId" element={<Entries />} />
            <Route path="/results/:contestId" element={<Results />} />

            <Route path="/admin/tasks" element={<ProtectedRoute permissions={["view_all_tasks"]}><Tasks /></ProtectedRoute>} />
            <Route path="/admin/errors" element={<ProtectedRoute permissions={["view_errors"]}><AllErrors /></ProtectedRoute>} />
            <Route path="/admin/errors/:errorId" element={<ProtectedRoute permissions={["view_errors"]}><ErrorDetail /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute permissions={["view_all_users"]}><Users /></ProtectedRoute>} />
            <Route path="/admin/users/inactive" element={<ProtectedRoute permissions={["view_all_users"]}><Users inactive /></ProtectedRoute>} />
            <Route path="/admin/judging" element={<ProtectedRoute permissions={["view_judging_settings"]}><AdminJudging /></ProtectedRoute>} />
            <Route path="/admin/skill-levels" element={<ProtectedRoute permissions={[]} requireAdmin><Levels /></ProtectedRoute>} />
            <Route path="/admin/graphql" element={<ProtectedRoute permissions={["view_errors"]}><Explorer /></ProtectedRoute>} />

            <Route path="/kb" element={<KBHome />} />
            <Route path="/kb/article/:articleId" element={<KBArticle />} />
            <Route path="/kb/section/:sectionId" element={<KBSection />} />
            <Route path="/admin/kb" element={<ProtectedRoute permissions={["edit_kb_content"]}><KBAdminHome filter="ALL" /></ProtectedRoute>} />
            <Route path="/admin/kb/drafts" element={<ProtectedRoute permissions={["edit_kb_content"]}><KBAdminHome filter="DRAFTS" /></ProtectedRoute>} />
            <Route path="/admin/kb/article/:articleId" element={<ProtectedRoute permissions={["edit_kb_content"]}><KBAdminArticle /></ProtectedRoute>}></Route>
            <Route path="/admin/kb/sections" element={<ProtectedRoute permissions={["edit_kb_content"]}><KBAdminSections /></ProtectedRoute>}></Route>

            <Route path="/login" element={<UnauthenticatedRoute><Login /></UnauthenticatedRoute>} />
            <Route path="/logout" element={<AuthenticatedRoute><Logout /></AuthenticatedRoute>} />

            <Route path="/status" element={<ExternalRedirect to="http://status.kachallengecouncil.org" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      }

    </React.Fragment>
  );
}

// Used to hide all open action menus
window.addEventListener("click", (e: MouseEvent) => {
  const target = e.target as Node as Element;
  if (target.classList.contains("actions-dropdown-btn-icon") || target.classList.contains("actions-dropdown-btn-text")) {
    return;
  }

  const actionMenus = document.querySelectorAll(".actions-dropdown-content");
  actionMenus.forEach((m) => {
    const menu = m as HTMLDivElement;
    menu.hidden = true;
  });
});

export default App;