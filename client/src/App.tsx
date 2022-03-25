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

export default App;