import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../shared/Button";
import { Form } from "../../shared/Forms";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { ConfirmModal } from "../../shared/Modals";
import ProgramEmbed from "../../shared/ProgramEmbed";
import useAppState from "../../state/useAppState";
import useAppError from "../../util/errors";
import request from "../../util/request";

type Entry = {
  id: string
  title: string
  height: number
  kaid: string
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

type GetNextEntryResponse = {
  entry: Entry | null
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

const GET_NEXT_ENTRY = gql`
  query GetNextEntry {
    entry: nextEntryToJudge {
      id
      title
      height
      kaid
    }
  }
`;

type FlagEntryResponse = {
  entry: Entry
}

const FLAG_ENTRY = gql`
  mutation FlagEntry($id: ID!) {
    flagEntry(id: $id) {
      id
      title
      height
      kaid
    }
  }
`;

type ScoreEntryResponse = {
  evaluation: {
    id: string
  }
}

const SCORE_ENTRY = gql`
  mutation ScoreEntry($entryId: ID!, $input: ScoreEntryInput!) {
    evaluation: scoreEntry(id: $entryId, input: $input) {
      id
    }
  }
`;

const DEFAULT_ENTRY: Entry = {
  id: "0",
  title: "Sample Entry",
  kaid: "6586620957786112",
  height: 400,
}

function Judging() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [programIsLoading, setProgramIsLoading] = useState<boolean>(true);
  const [showFlagEntryModal, setShowFlagEntryModal] = useState<boolean>(false);

  const { loading: currentContestIsLoading, data: currentContestData } = useQuery<CurrentContest>(GET_CURRENT_CONTEST, { onError: handleGQLError });
  const { loading: criteriaIsLoading, data: criteriaData } = useQuery<GetJudgingCriteriaResponse>(GET_JUDGING_CRITERIA, { onError: handleGQLError });
  const { loading: entryIsLoading, data: entryData, refetch: fetchNextEntry } = useQuery<GetNextEntryResponse>(GET_NEXT_ENTRY, { onError: handleGQLError });
  const [flagEntry, { loading: flagEntryIsLoading }] = useMutation<FlagEntryResponse>(FLAG_ENTRY, { onError: handleGQLError });
  const [scoreEntry, { loading: scoreEntryIsLoading }] = useMutation<ScoreEntryResponse>(SCORE_ENTRY, { onError: handleGQLError });

  const handleSubmit = async (values: { [name: string]: any }) => {
    if (!entryData?.entry) {
      return;
    }

    await scoreEntry({
      variables: {
        entryId: entryData.entry.id,
        input: {
          creativity: values.creativity,
          complexity: values.complexity,
          execution: values.quality,
          interpretation: values.interpretation,
          skillLevel: values.skill_level
        }
      }
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
    await flagEntry({
      variables: {
        id: id
      }
    });

    fetchNextEntry();
    closeFlagEntryModal();
  }

  const handleFetchNextEntry = () => {
    fetchNextEntry();
  }

  if (!entryIsLoading && state.loggedIn && entryData?.entry === null) {
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
              <h2 style={{ width: "100%", textAlign: "center", margin: "0" }}>{entryData?.entry?.title || DEFAULT_ENTRY.title}</h2>
              <p style={{ width: "100%", textAlign: "center" }}>Entry #{entryData?.entry?.id || DEFAULT_ENTRY.id}</p>
              {state.logged_in &&
                <div className="container col-12" style={{ justifyContent: "flex-end", marginBottom: "24px" }}>
                  <Button type="tertiary" destructive text="Flag Entry" role="button" action={openFlagEntryModal} />
                </div>
              }
              {programIsLoading && <LoadingSpinner size="MEDIUM" />}
              <ProgramEmbed programKaid={entryData?.entry?.kaid || DEFAULT_ENTRY.kaid} height={entryData?.entry?.height || DEFAULT_ENTRY.height} onLoad={handleProgramLoad} />
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
              loading={scoreEntryIsLoading}
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
          loading={flagEntryIsLoading}
          data={entryData?.entry?.id}
        >
          <p>Are you sure you want to flag this entry? This will remove the entry from the judging queue for all users until it has been reviewed.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default Judging;