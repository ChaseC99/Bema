import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './shared/Header';
import Home from "./pages/Home";
import './App.css';
import { AppStateProvider } from './state/AppStateContext';
import Logout from "./pages/Logout";

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
      
        <Header />

        <Routes>
          <Route path="/home" element={<Home />} />

          <Route path="/logout" element={<Logout />} />
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