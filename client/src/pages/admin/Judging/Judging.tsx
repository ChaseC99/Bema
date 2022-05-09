import React from "react";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import FlaggedEntriesCard from "./FlaggedEntriesCard";
import JudgingCriteriaCard from "./JudgingCriteriaCard";
import JudgingGroupsCard from "./JudgingGroupsCard";

function Judging() {
  return (
    <React.Fragment>
      <AdminSidebar />

      <section className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>Judging Settings</h2>
          </div>
          <div className="section-body">
            <FlaggedEntriesCard />
            <JudgingGroupsCard />
            <JudgingCriteriaCard />
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

export default Judging;