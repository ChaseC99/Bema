import React, { useEffect, useState } from "react";
import Badge from "../../../shared/Badge";
import Button from "../../../shared/Button";
import ExternalLink from "../../../shared/ExternalLink";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal } from "../../../shared/Modals";
import ProgramEmbed from "../../../shared/ProgramEmbed";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import request from "../../../util/request";
import { fetchNextEntry, fetchUserEntries } from "./fetchEntryData";
import "./Levels.css";

type Entry = {
  contest_id: number
  entry_author: string
  entry_author_kaid: string
  entry_height: number
  entry_id: number
  entry_kaid: string
  entry_title: string
  entry_url: string
  entry_votes: number
}

type PastEntry = {
  avg_score: number
  contest_id: number
  contest_name: string
  disqualified: boolean
  entry_id: number
  entry_level: string
  entry_title: string
  is_winner: boolean
}

function Levels() {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [entryIsLoading, setEntryIsLoading] = useState<boolean>(true);
  const [programIsLoading, setProgramIsLoading] = useState<boolean>(true);
  const [previousEntries, setPreviousEntries] = useState<PastEntry[]>([]);
  const [previousEntriesIsLoading, setPreviousEntriesIsLoading] = useState<boolean>(true);
  const [showDisqualifyModal, setShowDisqualifyModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    fetchNextEntry()
      .then((data) => {
        setEntry(data.entry);
        setEntryIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (entry && entry.entry_id > 0) {
      setPreviousEntriesIsLoading(true);
      fetchUserEntries(entry?.entry_author_kaid || "")
        .then((data) => {
          setPreviousEntries(data.entries);
          setPreviousEntriesIsLoading(false);
        });
    }
  }, [entry]);

  const handleProgramLoad = () => {
    setProgramIsLoading(false);
  }

  const handleFetchNextEntry = () => {
    setEntryIsLoading(true);
    fetchNextEntry()
      .then((data) => {
        setEntry(data.entry);
        setEntryIsLoading(false);
      });
  }

  const handleSetSkillLevel = async (level: string) => {
    await request("PUT", "/api/internal/admin/skillLevels/setEntrySkillLevel", {
      entry_id: entry?.entry_id,
      entry_level: level
    });

    handleFetchNextEntry();
  }

  const openDisqualifyModal = () => {
    setShowDisqualifyModal(true);
  }

  const closeDisqualifyModal = () => {
    setShowDisqualifyModal(false);
  }

  const handleDisqualify = async () => {
    await request("PUT", "/api/internal/entries/disqualify", {
      entry_id: entry?.entry_id
    });

    closeDisqualifyModal();
    handleFetchNextEntry();
  }

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  }

  const handleDelete = async () => {
    await request("DELETE", "/api/internal/entries", {
      entry_id: entry?.entry_id
    });

    closeDeleteModal();
    handleFetchNextEntry();
  }

  return (
    <React.Fragment>
      <AdminSidebar />

      <section className="container center col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>Review Entry Levels</h2>
          </div>
          <div className="section-body">
            {entryIsLoading && <LoadingSpinner size="MEDIUM" />}

            {!entryIsLoading &&
              <React.Fragment>
                <h2 style={{ width: "100%", textAlign: "center", marginTop: "0", marginBottom: "8px" }}><ExternalLink to={entry?.entry_url || ""}>{entry?.entry_title || ""}</ExternalLink></h2>
                <p style={{ width: "100%", textAlign: "center", marginTop: "0", marginBottom: "8px" }}>By: <ExternalLink to={"https://www.khanacademy.org/profile/" + entry?.entry_author_kaid + "/projects"}>{entry?.entry_author || ""}</ExternalLink></p>
                <p style={{ width: "100%", textAlign: "center", marginTop: "0", marginBottom: "16px" }}>Votes: {entry?.entry_votes || 0}</p>

                {programIsLoading && <LoadingSpinner size="MEDIUM" />}
                <ProgramEmbed programKaid={entry?.entry_url.split("/")[5] || ""} height={entry?.entry_height || 400} onLoad={handleProgramLoad} />
              </React.Fragment>
            }

            <div className="container col-10 actions-container">
              <div>
                <h4>Set Skill Level</h4>
                <Button type="primary" role="button" action={handleSetSkillLevel} data="Beginner" text="Beginner" />
                <Button type="primary" role="button" action={handleSetSkillLevel} data="Intermediate" text="Intermediate" />
                <Button type="primary" role="button" action={handleSetSkillLevel} data="Advanced" text="Advanced" />
              </div>
              <div>
                <h4>Moderation</h4>
                <Button type="secondary" role="button" action={openDisqualifyModal} text="Disqualify" destructive />
                <Button type="secondary" role="button" action={openDeleteModal} text="Delete" destructive />
              </div>
            </div>

            {!previousEntriesIsLoading &&
              <Table cols={10} noCard label="Previous Submissions">
                <TableHead>
                  <Row>
                    <Cell header>ID</Cell>
                    <Cell header>Title</Cell>
                    <Cell header>Contest</Cell>
                    <Cell header>Level</Cell>
                    <Cell header>Avg Score</Cell>
                  </Row>
                </TableHead>
                <TableBody>
                  {previousEntries.map((e) => {
                    return (
                      <Row key={e.entry_id}>
                        <Cell>{e.entry_id}</Cell>
                        <Cell>
                          {e.entry_title}
                          {e.disqualified ? <Badge color="#d92916" text="Disqualified" type="secondary" /> : ""}
                          {e.is_winner ? <Badge color="#ffb100" text="Winner" type="secondary" /> : ""}
                        </Cell>
                        <Cell>{e.contest_name}</Cell>
                        <Cell>{e.entry_level}</Cell>
                        <Cell>{e.avg_score}</Cell>
                      </Row>
                    );
                  })}
                </TableBody>
              </Table>
            }
          </div>
        </div>
      </section>

      {showDisqualifyModal &&
        <ConfirmModal
          title="Disqualify entry?"
          confirmLabel="Disqualify"
          handleConfirm={handleDisqualify}
          handleCancel={closeDisqualifyModal}
          destructive
        >
          <p>Are you sure you want to disqualify this entry? This will remove the entry from the judging queue for all users.</p>
        </ConfirmModal>
      }

      {showDeleteModal &&
        <ConfirmModal
          title="Delete entry?"
          confirmLabel="Delete"
          handleConfirm={handleDelete}
          handleCancel={closeDeleteModal}
          destructive
        >
          <p>Are you sure you want to delete this entry? This action cannot be undone.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default Levels;