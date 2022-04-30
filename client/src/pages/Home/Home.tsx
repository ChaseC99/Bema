import React from "react";
import useAppState from "../../state/useAppState";
import Announcements from "./Announcements";
import Tasks from "./Tasks";

function Home() {
  const { state } = useAppState();

  return (
    <div className="container">
      {state.logged_in && <Tasks />}
      <Announcements />
    </div>
  );
}

export default Home;