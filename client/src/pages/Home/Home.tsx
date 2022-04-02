import React from "react";
import useAppState from "../../state/useAppState";
import Announcements from "./Announcements";
import Tasks from "./Tasks";

function Home() {
  const { state } = useAppState();

  return (
    <React.Fragment>
      {state.logged_in && <Tasks />}
      <Announcements />
    </React.Fragment>
  );
}

export default Home;