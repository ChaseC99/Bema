import React from "react";
import useAppState from "../../state/useAppState";
import Announcements from "./Announcements";
import Tasks from "./Tasks";

function Home() {
  const { state } = useAppState();

  return (
    <div className="container col-12">
      {state.loggedIn && <Tasks />}
      <Announcements />
    </div>
  );
}

export default Home;