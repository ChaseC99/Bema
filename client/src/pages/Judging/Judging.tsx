import { gql, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../shared/Button";
import { Form } from "../../shared/Forms";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal } from "../../shared/Modals";
import ProgramEmbed from "../../shared/ProgramEmbed";
import useAppState from "../../state/useAppState";
import useAppError from "../../util/errors";
import request from "../../util/request";
import { fetchNextEntry } from "./fetchData";

type Entry = {
  o_entry_height: number
  o_entry_id: number
  o_entry_title: string
  o_entry_url: "https://www.khanacademy.org/computer-programming/spin-off-of-contest-animation/4554572617007104"
}

type CurrentContest = {
  currentContest: {
    id: number
  }
}

type JudgingCriteria = {
  name: string
  description: string
}

type GetJudgingCriteriaResponse = {
  criteria: JudgingCriteria[]
}

const GET_CURRENT_CONTEST = gql`
  query GetCurrentContest {
    currentContest {
      id
    }
  }
`;

const GET_JUDGING_CRITERIA = gql`
  query GetJudgingCriteria {
    criteria: activeCriteria {
      name
      description
    }
  }
`;

function Judging() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [programIsLoading, setProgramIsLoading] = useState<boolean>(true);
  const [entryIsLoading, setEntryIsLoading] = useState<boolean>(true);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [showFlagEntryModal, setShowFlagEntryModal] = useState<boolean>(false);

  const { loading: currentContestIsLoading, data: currentContestData } = useQuery<CurrentContest>(GET_CURRENT_CONTEST, { onError: handleGQLError });
  const { loading: criteriaIsLoading, data: criteriaData } = useQuery<GetJudgingCriteriaResponse>(GET_JUDGING_CRITERIA, { onError: handleGQLError });

  useEffect(() => {
    fetchNextEntry()
      .then((data) => {
        setEntry(data.entry);
        setEntryIsLoading(false);
      });
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
        <div className="container center col-8" style={{ flexDirection: "column", alignItems: "center" }}>
          <h2>Woohoo! All the entries have been scored!</h2>
          <p>Visit the <Link to={"/results/" + (currentContestIsLoading ? 1 : currentContestData?.currentContest.id)}>results</Link> page to view entry scores.</p>
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
                  label: criteriaData?.criteria[0].name || "",
                  description: criteriaData?.criteria[0].description,
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
                  label: criteriaData?.criteria[1].name || "",
                  description: criteriaData?.criteria[1].description,
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
                  label: criteriaData?.criteria[2].name || "",
                  description: criteriaData?.criteria[2].description,
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
                  label: criteriaData?.criteria[3].name || "",
                  description: criteriaData?.criteria[3].description,
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