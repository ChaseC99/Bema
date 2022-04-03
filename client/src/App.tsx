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

function App() {
  useEffect(() => {
    TimeAgo.setDefaultLocale(en.locale)
    TimeAgo.addLocale(en)
  }, []);
  
  return (
    <AppStateProvider>
      <BrowserRouter>
      
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/admin/dashboard" element={<Dashboard />} />

          <Route path="/logout" element={<Logout />} />

          <Route path="/status" element={<ExternalRedirect to="http://status.kachallengecouncil.org" />}/>

          <Route path="*" element={<NotFound />} />
        </Routes>

      </BrowserRouter>
      
    </AppStateProvider>
  );
}

// Used to hide all open action menus
window.addEventListener("click", (e: MouseEvent) => {
  e.preventDefault();

  const target = e.target as Node as Element;
  if (target.classList.contains("actions-dropdown-btn")) {
    return;
  }

  const actionMenus = document.querySelectorAll(".actions-dropdown-content");
  actionMenus.forEach((m) => {
    const menu = m as HTMLDivElement;
    menu.hidden = true;
  });
});

export default App;