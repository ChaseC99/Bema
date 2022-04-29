import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './shared/Header/Header';
import Home from "./pages/Home";
import './App.css';
import { AppStateProvider } from './state/AppStateContext';
import Logout from "./pages/Logout";
import TimeAgo from "javascript-time-ago";
import en from 'javascript-time-ago/locale/en.json';
import { useEffect } from "react";
import NotFound from "./pages/NotFound/NotFound";
import Dashboard from "./pages/Dashboard";
import ExternalRedirect from "./shared/ExternalRedirect/ExternalRedirect";
import Tasks from "./pages/admin/Tasks";
import Results from "./pages/Results";
import Entries from "./pages/Entries";
import Contests from "./pages/Contests";
import { ContestantSearch } from "./pages/Contestants";

function App() {
  useEffect(() => {
    TimeAgo.setDefaultLocale(en.locale)
    TimeAgo.addLocale(en)
  }, []);
  
  return (
    <AppStateProvider>
      <BrowserRouter>
      
        <Header />

        <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/contestants" element={<ContestantSearch />} />

          <Route path="/admin/contests" element={<Contests />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/tasks" element={<Tasks />} />

          <Route path="/entries/:contestId" element={<Entries />} />
          <Route path="/results/:contestId" element={<Results />} />

          <Route path="/logout" element={<Logout />} />

          <Route path="/status" element={<ExternalRedirect to="http://status.kachallengecouncil.org" />}/>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>

      </BrowserRouter>
      
    </AppStateProvider>
  );
}

// Used to hide all open action menus
window.addEventListener("click", (e: MouseEvent) => {
  e.preventDefault();

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