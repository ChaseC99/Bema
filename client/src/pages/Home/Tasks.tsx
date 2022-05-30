import { gql, useQuery } from "@apollo/client";
import React from "react";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import request from "../../util/request";
import TaskCard from "./TaskCard";

type Task = {
  id: string
  title: string
  assignedUser: {
    id: string
    nickname: string
  } | null
  status: "Not Started" | "Started"
  dueDate: string
}

type GetTasksResponse = {
  tasks: Task[]
}

const GET_AVAILABLE_TASKS = gql`
  query GetAvailableTasks {
    tasks: availableTasks {
      id
      title
      assignedUser {
        id
        nickname
      }
      status
      dueDate
    }
  }
`;

const GET_MY_TASKS = gql`
  query GetMyTasks {
    tasks: currentUserTasks {
      id
      title
      assignedUser {
        id
        nickname
      }
      status
      dueDate
    }
  }
`;

function Tasks() {
  const { loading: availableTasksIsLoading, data: availableTasksData, refetch: refetchAvailableTasks } = useQuery<GetTasksResponse>(GET_AVAILABLE_TASKS);
  const { loading: myTasksIsLoading, data: myTasksData, refetch: refetchMyTasks } = useQuery<GetTasksResponse>(GET_MY_TASKS);

  function updateTaskStatus(id: number) {
    request("PUT", "/api/internal/tasks", {
      edit_task_id: id
    });

    refetchMyTasks();
  }
  
  function signupForTask(id: number) {
    request("PUT", "/api/internal/tasks/signup", {
      task_id: id
    });

    refetchAvailableTasks();
    refetchMyTasks();
  }

  return (
    <React.Fragment>
      { (availableTasksIsLoading || (availableTasksData && availableTasksData.tasks.length > 0)) &&
        <section id="available-tasks-section" className="container center col-12">
          <div className="col-6">
            <div className="section-header">
              <h2 data-testid="available-tasks-header">Available Tasks</h2>
            </div>
            <div className="section-body" data-testid="available-tasks-section-body">
              {availableTasksIsLoading && <LoadingSpinner size="MEDIUM" testId="available-tasks-spinner" />}

              {!availableTasksIsLoading && availableTasksData?.tasks.map((t) => {
                return (
                  <TaskCard
                    title={t.title}
                    status={t.status}
                    id={t.id}
                    dueDate={t.dueDate}
                    assigned={t.assignedUser !== null}
                    updateTaskStatus={updateTaskStatus}
                    signupForTask={signupForTask}
                    key={"tasks-" + t.id}
                  />
                );
              })}
            </div>
          </div>
        </section>
      }

      { (myTasksIsLoading || (myTasksData && myTasksData.tasks.length > 0)) && 
        <section id="my-tasks-section" className="container center col-12">
          <div className="col-6">
            <div className="section-header">
              <h2 data-testid="my-tasks-header">My Tasks</h2>
            </div>
            <div className="section-body" data-testid="my-tasks-section-body">
              {myTasksIsLoading && <LoadingSpinner size="MEDIUM" testId="my-tasks-spinner" />}

              {!myTasksIsLoading && myTasksData?.tasks.map((t) => {
                  return (
                    <TaskCard
                      title={t.title}
                      status={t.status}
                      id={t.id}
                      dueDate={t.dueDate}
                      assigned={t.assignedUser !== null}
                      updateTaskStatus={updateTaskStatus}
                      signupForTask={signupForTask}
                      key={"tasks-" + t.id}
                    />
                  );
                })}
            </div>
          </div>
        </section>
      }
    </React.Fragment>
  );
}

export default Tasks;