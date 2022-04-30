import React, { useEffect, useState } from "react";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import request from "../../util/request";
import { fetchAvailableTasks, fetchMyTasks } from "./fetchTasks";
import TaskCard from "./TaskCard";

type Task = {
  task_title: string
  task_status: "Not Started" | "Started"
  task_id: number
  due_date: string
  assigned_member: number
  testId?: string
}

function Tasks() {
  const [myTasksIsLoading, setMyTasksIsLoading] = useState<boolean>(true);
  const [availableTasksIsLoading, setAvailableTasksIsLoading] = useState<boolean>(true);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchAvailableTasks()
      .then(tasks => {
        setAvailableTasks(tasks);
        setAvailableTasksIsLoading(false);
      });

    fetchMyTasks()
      .then(tasks => {
        setMyTasks(tasks);
        setMyTasksIsLoading(false);
      });
  }, []);

  function updateTaskStatus(id: number) {
    request("PUT", "/api/internal/tasks", {
      edit_task_id: id
    });

    let newTasks = [...myTasks];
    
    for (let i = 0; i < newTasks.length; i++) {
      if (newTasks[i].task_id === id) {
        if (newTasks[i].task_status === "Not Started") {
          newTasks[i].task_status = "Started";
        }
        else {
          newTasks.splice(i, 1);
        }

        break;
      }
    }

    setMyTasks(newTasks);
  }
  
  function signupForTask(id: number) {
    request("PUT", "/api/internal/tasks/signup", {
      task_id: id
    });

    for (let i = 0; i < availableTasks.length; i++) {
      if (availableTasks[i].task_id === id) {
        let task = {...availableTasks[i]}

        let newAvailableTasks = [...availableTasks];
        newAvailableTasks.splice(i, 1);

        let newMyTasks = [...myTasks];
        newMyTasks.push(task);

        setAvailableTasks(newAvailableTasks);
        setMyTasks(newMyTasks);

        break;
      }
    }
  }

  return (
    <React.Fragment>
      { (availableTasksIsLoading || availableTasks.length > 0) &&
        <section id="available-tasks-section" className="container center col-12">
          <div className="col-6">
            <div className="section-header">
              <h2 data-testid="available-tasks-header">Available Tasks</h2>
            </div>
            <div className="section-body" data-testid="available-tasks-section-body">
              {availableTasksIsLoading && <LoadingSpinner size="MEDIUM" testId="available-tasks-spinner" />}

              {!availableTasksIsLoading && availableTasks.map((t) => {
                return (
                  <TaskCard
                    title={t.task_title}
                    status={t.task_status}
                    id={t.task_id}
                    dueDate={t.due_date}
                    assigned={t.assigned_member > 0}
                    updateTaskStatus={updateTaskStatus}
                    signupForTask={signupForTask}
                    testId={t.testId}
                    key={"tasks-" + t.task_id}
                  />
                );
              })}
            </div>
          </div>
        </section>
      }

      { (myTasksIsLoading || myTasks.length > 0) && 
        <section id="my-tasks-section" className="container center col-12">
          <div className="col-6">
            <div className="section-header">
              <h2 data-testid="my-tasks-header">My Tasks</h2>
            </div>
            <div className="section-body" data-testid="my-tasks-section-body">
              {myTasksIsLoading && <LoadingSpinner size="MEDIUM" testId="my-tasks-spinner" />}

              {!myTasksIsLoading && myTasks.length > 0 && myTasks.map((t) => {
                  return (
                    <TaskCard
                      title={t.task_title}
                      status={t.task_status}
                      id={t.task_id}
                      dueDate={t.due_date}
                      assigned={t.assigned_member > 0}
                      updateTaskStatus={updateTaskStatus}
                      signupForTask={signupForTask}
                      testId={t.testId}
                      key={"tasks-" + t.task_id}
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