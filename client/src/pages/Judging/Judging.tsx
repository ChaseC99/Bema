import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../shared/Button";
import { Form } from "../../shared/Forms";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal } from "../../shared/Modals";
import ProgramEmbed from "../../shared/ProgramEmbed";
import useAppState from "../../state/useAppState";
import request from "../../util/request";
import { fetchCurrentContest, fetchJudgingCriteria, fetchNextEntry } from "./fetchData";

type Criteria = {
  criteria_description: string
  criteria_name: string
}

type Entry = {
  o_entry_height: number
  o_entry_id: number
  o_entry_title: string
  o_entry_url: "https://www.khanacademy.org/computer-programming/spin-off-of-contest-animation/4554572617007104"
}

function Judging() {
  const { state } = useAppState();
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [criteriaIsLoading, setCriteriaIsLoading] = useState<boolean>(true);
  const [programIsLoading, setProgramIsLoading] = useState<boolean>(true);
  const [entryIsLoading, setEntryIsLoading] = useState<boolean>(true);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [currentContestId, setCurrentContestId] = useState<number>(1);
  const [showFlagEntryModal, setShowFlagEntryModal] = useState<boolean>(false);

  useEffect(() => {
    fetchJudgingCriteria()
      .then((data) => {
        setCriteria(data.criteria);
        setCriteriaIsLoading(false);
      });

    fetchNextEntry()
      .then((data) => {
        setEntry(data.entry);
        setEntryIsLoading(false);
      });

      fetchCurrentContest()
      .then((data) => {
        setCurrentContestId(data.id);
      })
  }, []);

  const handleSubmit = async (values: { [name: string]: any }) => {
    await request("POST", "/api/internal/judging/submit", {
      entry_id: entry?.o_entry_id,
      creativity: values.creativity,
      complexity: values.complexity,
      quality_code: values.quality,
      interpretation: values.interpretation,
      skill_level: values.skill_level
    });

    handleFetchNextEntry();
  }

  const handleProgramLoad = () => {
    setProgramIsLoading(false);
  }

  const openFlagEntryModal = () => {
    setShowFlagEntryModal(true);
  }

  const closeFlagEntryModal = () => {
    setShowFlagEntryModal(false);
  }

  const handleFlagEntry = async (id: number) => {
    await request("PUT", "/api/internal/entries/flag", {
      entry_id: id
    });

    closeFlagEntryModal();
    handleFetchNextEntry();
  }

  const handleFetchNextEntry = () => {
    setEntryIsLoading(true);
    fetchNextEntry()
      .then((data) => {
        setEntry(data.entry);
        setEntryIsLoading(false);
      });
  }

  if (!entryIsLoading && entry?.o_entry_id === -1) {
    return (
      <div className="container center col-12" style={{ height: "80vh", alignItems: "center" }}>
        <div className="container center col-8" style={{flexDirection: "column", alignItems: "center"}}>
          <h2>Woohoo! All the entries have been scored!</h2>
          <p>Visit the <Link to={"/results/" + currentContestId}>results</Link> page to view entry scores.</p>
        </div>
      </div >
    );
  }

  return (
    <React.Fragment>
      <div className="container center col-12" style={{ marginBottom: "100px" }}>
        <div className="container center col-8">
          {entryIsLoading && <LoadingSpinner size="MEDIUM" />}
          {!entryIsLoading &&
            <React.Fragment>
              <h2 style={{ width: "100%", textAlign: "center", margin: "0" }}>{entry?.o_entry_title}</h2>
              <p style={{ width: "100%", textAlign: "center" }}>Entry #{entry?.o_entry_id}</p>
              {state.logged_in &&
                <div className="container col-12" style={{ justifyContent: "flex-end", marginBottom: "24px" }}>
                  <Button type="tertiary" destructive text="Flag Entry" role="button" action={openFlagEntryModal} />
                </div>
              }
              {programIsLoading && <LoadingSpinner size="MEDIUM" />}
              <ProgramEmbed programKaid={entry?.o_entry_url.split("/")[5] || ""} height={entry?.o_entry_height || 400} onLoad={handleProgramLoad} />
            </React.Fragment>
          }

          {criteriaIsLoading ?
            <LoadingSpinner size="MEDIUM" />
            :
            <Form
              onSubmit={handleSubmit}
              submitLabel="Submit"
              cols={12}
              disabled={!state.logged_in}
              fields={[
                {
                  fieldType: "SLIDER",
                  name: "creativity",
                  id: "creativity",
                  label: criteria[0].criteria_name,
                  description: criteria[0].criteria_description,
                  min: 0,
                  max: 5,
                  step: 0.5,
                  tickStep: 1,
                  defaultValue: 2.5,
                  size: "MEDIUM"
                },
                {
                  fieldType: "SLIDER",
                  name: "complexity",
                  id: "complexity",
                  label: criteria[1].criteria_name,
                  description: criteria[1].criteria_description,
                  min: 0,
                  max: 5,
                  step: 0.5,
                  tickStep: 1,
                  defaultValue: 2.5,
                  size: "MEDIUM"
                },
                {
                  fieldType: "SLIDER",
                  name: "quality",
                  id: "quality",
                  label: criteria[2].criteria_name,
                  description: criteria[2].criteria_description,
                  min: 0,
                  max: 5,
                  step: 0.5,
                  tickStep: 1,
                  defaultValue: 2.5,
                  size: "MEDIUM"
                },
                {
                  fieldType: "SLIDER",
                  name: "interpretation",
                  id: "interpretation",
                  label: criteria[3].criteria_name,
                  description: criteria[3].criteria_description,
                  min: 0,
                  max: 5,
                  step: 0.5,
                  tickStep: 1,
                  defaultValue: 2.5,
                  size: "MEDIUM"
                },
                {
                  fieldType: "SELECT",
                  name: "skill_level",
                  id: "skill-level",
                  label: "Skill Level",
                  size: "SMALL",
                  defaultValue: null,
                  choices: [
                    {
                      text: "Advanced",
                      value: "Advanced"
                    },
                    {
                      text: "Intermediate",
                      value: "Intermediate"
                    },
                    {
                      text: "Beginner",
                      value: "Beginner"
                    }
                  ],
                  required: true,
                }
              ]}
            />
          }
        </div>
      </div>

      {showFlagEntryModal &&
        <ConfirmModal
          title="Flag entry?"
          confirmLabel="Flag"
          handleConfirm={handleFlagEntry}
          handleCancel={closeFlagEntryModal}
          destructive
          data={entry?.o_entry_id}
        >
          <p>Are you sure you want to flag this entry? This will remove the entry from the judging queue for all users until it has been reviewed.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default Judging;