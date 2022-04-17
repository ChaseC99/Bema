import React, { useEffect, useState } from "react";
import ActionMenu, { Action } from "../../../shared/ActionMenu";
import AdminSidebar from "../../../shared/AdminSidebar";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import request from "../../../util/request";
import { fetchCompleteTasks, fetchEvaluators, fetchIncompleteTasks } from "./fetchTaskData";

type Task = {
  assigned_member: number | null
  due_date: string
  evaluator_name: string | null
  task_id: number
  task_status: "Not Started" | "Started" | "Completed"
  task_title: string
}

type CreateTaskData = {
  assigned_member: number | null
  due_date: string
  title: string
}

type EditTaskData = {
  title: string
  due_date: string
  assigned_member: number | null
  status: "Not Started" | "Started" | "Completed"
}

type Evaluator = {
  evaluator_id: number
  evaluator_name: string
  nickname: string
}

function Tasks() {
  const { state } = useAppState();
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([]);
  const [incompleteTasksIsLoading, setIncompleteTasksIsLoading] = useState<boolean>(true);
  const [completeTasks, setCompleteTasks] = useState<Task[]>([]);
  const [completeTasksHasBeenRequested, setCompleteTasksHasBeenRequested] = useState<boolean>(false);
  const [completeTasksIsLoading, setCompleteTasksIsLoading] = useState<boolean>(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);

  useEffect(() => {
    fetchIncompleteTasks()
      .then(data => {
        setIncompleteTasks(data);
        setIncompleteTasksIsLoading(false);
      });

    fetchEvaluators()
      .then(data => {
        setEvaluators(data);
      });
  }, []);

  const openNewTaskModal = () => {
    setShowNewTaskModal(true);
  }

  const closeNewTaskModal = () => {
    setShowNewTaskModal(false);
  }

  const handleCreateTask = (values: { [name: string]: any }) => {
    const data = values as CreateTaskData;

    request("POST", "/api/internal/tasks", {
      task_title: data.title,
      due_date: data.due_date,
      assigned_member: data.assigned_member,
      task_status: "Not Started"
    });

    setShowNewTaskModal(false);
  }

  const openEditTaskModal = (id: number) => {
    let task = incompleteTasks.find((t) => t.task_id === id);

    if (!task) {
      task = completeTasks.find((t) => t.task_id === id);
    }

    setEditTask(task || null);
  }

  const closeEditTaskModal = () => {
    setEditTask(null);
  }

  const handleEditTask = (values: { [name: string]: any }) => {
    if (!editTask) return;

    const data = values as EditTaskData;

    request("PUT", "/api/internal/tasks", {
      edit_task_id: editTask?.task_id,
      edit_task_title: data.title,
      edit_due_date: data.due_date,
      edit_assigned_member: data.assigned_member,
      edit_task_status: data.status,
    });

    if (editTask?.task_status !== "Completed" && data.status !== "Completed") {
      let newIncompleteTasks = [...incompleteTasks];
      for (let i = 0; i < newIncompleteTasks.length; i++) {
        if (newIncompleteTasks[i].task_id === editTask.task_id) {
          newIncompleteTasks[i].task_title = data.title;
          newIncompleteTasks[i].due_date = data.due_date;
          newIncompleteTasks[i].assigned_member = data.assigned_member;
          newIncompleteTasks[i].evaluator_name = data.assigned_member ? getEvaluatorNameById(data.assigned_member) : "Available for Sign Up";
          newIncompleteTasks[i].task_status = data.status;
        }
      }
      setIncompleteTasks(newIncompleteTasks);
    }
    else if (editTask?.task_status !== "Completed" && data.status === "Completed") {
      let newIncompleteTasks = [...incompleteTasks];
      newIncompleteTasks = newIncompleteTasks.filter((t) => t.task_id !== editTask.task_id);

      let newCompleteTasks = [...completeTasks];
      newCompleteTasks.push({
        assigned_member: data.assigned_member,
        due_date: data.due_date,
        evaluator_name: data.assigned_member ? getEvaluatorNameById(data.assigned_member) : "Available for Sign Up",
        task_id: editTask.task_id,
        task_status: data.status,
        task_title: data.title
      });

      setIncompleteTasks(newIncompleteTasks);
      setCompleteTasks(newCompleteTasks);
    }
    else if (editTask?.task_status === "Completed" && data.status !== "Completed") {
      let newIncompleteTasks = [...incompleteTasks];
      newIncompleteTasks.push({
        assigned_member: data.assigned_member,
        due_date: data.due_date,
        evaluator_name: data.assigned_member ? getEvaluatorNameById(data.assigned_member) : "Available for Sign Up",
        task_id: editTask.task_id,
        task_status: data.status,
        task_title: data.title
      });

      let newCompleteTasks = [...completeTasks];
      newCompleteTasks = newCompleteTasks.filter((t) => t.task_id !== editTask.task_id);

      setIncompleteTasks(newIncompleteTasks);
      setCompleteTasks(newCompleteTasks);
    }
    else {
      let newCompleteTasks = [...completeTasks];
      for (let i = 0; i < newCompleteTasks.length; i++) {
        if (newCompleteTasks[i].task_id === editTask.task_id) {
          newCompleteTasks[i].task_title = data.title;
          newCompleteTasks[i].due_date = data.due_date;
          newCompleteTasks[i].assigned_member = data.assigned_member;
          newCompleteTasks[i].evaluator_name = data.assigned_member ? getEvaluatorNameById(data.assigned_member) : "Available for Sign Up";
          newCompleteTasks[i].task_status = data.status;
        }
      }
      setCompleteTasks(newCompleteTasks);
    }

    setEditTask(null);
  }

  const openDeleteTaskModal = (id: number) => {
    setDeleteTaskId(id);
  }

  const closeDeleteTaskModal = () => {
    setDeleteTaskId(null);
  }

  const handleDeleteTask = async (id: number) => {
    await request("DELETE", "/api/internal/tasks", {
      task_id: id
    });

    let newIncompleteTasks = [...incompleteTasks]
    newIncompleteTasks = newIncompleteTasks.filter((t) => t.task_id !== id);
    setIncompleteTasks(newIncompleteTasks);

    let newCompleteTasks = [...completeTasks]
    newCompleteTasks = newCompleteTasks.filter((t) => t.task_id !== id);
    setCompleteTasks(newCompleteTasks);

    setDeleteTaskId(null);
  }

  const loadCompletedTasks = () => {
    setCompleteTasksIsLoading(true);
    setCompleteTasksHasBeenRequested(true);

    fetchCompleteTasks()
      .then(data => {
        setCompleteTasks(data);
        setCompleteTasksIsLoading(false);
      });
  }

  const getTaskActions = (taskId: number) => {
    const actions: Action[] = [];

    if (state.user?.permissions.edit_all_tasks) {
      actions.push({
        role: "button",
        action: openEditTaskModal,
        text: "Edit",
        data: taskId
      });
    }

    if (state.user?.permissions.delete_all_tasks) {
      actions.push({
        role: "button",
        action: openDeleteTaskModal,
        text: "Delete",
        data: taskId
      });
    }

    return actions;
  }

  const getEvaluatorNameById = (id: number) => {
    const e = evaluators.find((e) => e.evaluator_id === id);

    return e?.evaluator_name || null;
  }

  return (
    <React.Fragment>
      <AdminSidebar />

      <section id="tasks-section" className="container">
        <div className="col-12">
          <div className="section-header">
            <h2 data-testid="tasks-header">Tasks</h2>

            <span className="section-actions" data-testid="tasks-section-actions">
              {(state.user?.permissions.edit_all_tasks || state.is_admin) && <Button type="primary" role="button" action={openNewTaskModal} text="New Task" />}
            </span>
          </div>
          <div className="section-body" data-testid="tasks-section-body">
            {incompleteTasksIsLoading && <LoadingSpinner size="MEDIUM" />}

            {!incompleteTasksIsLoading &&
              <Table label="Incomplete Tasks">
                <TableHead>
                  <Row>
                    <Cell header>Description</Cell>
                    <Cell header>Due Date</Cell>
                    <Cell header>Assigned Member</Cell>
                    <Cell header>Status</Cell>
                    <Cell header permissions={["edit_all_tasks", "delete_all_tasks"]} width="15px"></Cell>
                  </Row>
                </TableHead>
                <TableBody>
                  {incompleteTasks.map((t) => {
                    if (state.user?.permissions.edit_all_tasks || state.user?.permissions.delete_all_tasks) {
                      return (
                        <Row key={t.task_id}>
                          <Cell>{t.task_title}</Cell>
                          <Cell>{t.due_date}</Cell>
                          <Cell>{t.evaluator_name ? t.evaluator_name : "Available for Sign Up"}</Cell>
                          <Cell>{t.task_status}</Cell>
                          <Cell><ActionMenu actions={getTaskActions(t.task_id)} /></Cell>
                        </Row>
                      );
                    }

                    return (
                      <Row key={t.task_id}>
                        <Cell>{t.task_title}</Cell>
                        <Cell>{t.due_date}</Cell>
                        <Cell>{t.evaluator_name ? t.evaluator_name : "Available for Sign Up"}</Cell>
                        <Cell>{t.task_status}</Cell>
                      </Row>
                    );
                  })}
                </TableBody>
              </Table>
            }

            {!completeTasksHasBeenRequested &&
              <div className="container col-12 center">
                <Button type="secondary" role="button" action={loadCompletedTasks} text="Load completed tasks" />
              </div>
            }

            {completeTasksHasBeenRequested &&
              <React.Fragment>
                {completeTasksIsLoading && <LoadingSpinner size="MEDIUM" />}

                {!completeTasksIsLoading &&
                  <Table label="Completed Tasks">
                    <TableHead>
                      <Row>
                        <Cell header>Description</Cell>
                        <Cell header>Due Date</Cell>
                        <Cell header>Assigned Member</Cell>
                        <Cell header>Status</Cell>
                        <Cell header permissions={["edit_all_tasks", "delete_all_tasks"]} width="15px"></Cell>
                      </Row>
                    </TableHead>
                    <TableBody>
                      {completeTasks.map((t) => {
                        if (state.user?.permissions.edit_all_tasks || state.user?.permissions.delete_all_tasks) {
                          return (
                            <Row key={t.task_id}>
                              <Cell>{t.task_title}</Cell>
                              <Cell>{t.due_date}</Cell>
                              <Cell>{t.evaluator_name ? t.evaluator_name : "Available for Sign Up"}</Cell>
                              <Cell>{t.task_status}</Cell>
                              <Cell><ActionMenu actions={getTaskActions(t.task_id)} /></Cell>
                            </Row>
                          );
                        }

                        return (
                          <Row key={t.task_id}>
                            <Cell>{t.task_title}</Cell>
                            <Cell>{t.due_date}</Cell>
                            <Cell>{t.evaluator_name ? t.evaluator_name : "Available for Sign Up"}</Cell>
                            <Cell>{t.task_status}</Cell>
                          </Row>
                        );
                      })}
                    </TableBody>
                  </Table>
                }
              </React.Fragment>
            }
          </div>
        </div>
      </section>

      {showNewTaskModal &&
        <FormModal
          title="Create Task"
          submitLabel="Create"
          handleSubmit={handleCreateTask}
          handleCancel={closeNewTaskModal}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "title",
              id: "title",
              size: "LARGE",
              label: "Title",
              defaultValue: ""
            },
            {
              fieldType: "DATE",
              name: "due_date",
              id: "due-date",
              size: "MEDIUM",
              label: "Due date",
              defaultValue: (new Date()).toLocaleString()
            },
            {
              fieldType: "SELECT",
              name: "assigned_member",
              id: "assigned-member",
              size: "LARGE",
              label: "Assign to",
              placeholder: "Select a user",
              defaultValue: null,
              choices: [
                {
                  text: "Available for Sign Up",
                  value: null
                },
                ...evaluators.map((e) => {
                  return {
                    text: e.evaluator_name,
                    value: e.evaluator_id
                  }
                })
              ]
            }
          ]}
          cols={4}
        />
      }

      {editTask &&
        <FormModal
          title="Edit Task"
          submitLabel="Save"
          handleSubmit={handleEditTask}
          handleCancel={closeEditTaskModal}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "title",
              id: "title",
              size: "LARGE",
              label: "Title",
              defaultValue: editTask.task_title
            },
            {
              fieldType: "DATE",
              name: "due_date",
              id: "due-date",
              size: "MEDIUM",
              label: "Due date",
              defaultValue: editTask.due_date
            },
            {
              fieldType: "SELECT",
              name: "status",
              id: "status",
              size: "MEDIUM",
              label: "Status",
              placeholder: "Select a status",
              defaultValue: editTask.task_status,
              choices: [
                {
                  text: "Not Started",
                  value: "Not Started"
                },
                {
                  text: "Started",
                  value: "Started"
                },
                {
                  text: "Completed",
                  value: "Completed"
                }
              ]
            },
            {
              fieldType: "SELECT",
              name: "assigned_member",
              id: "assigned-member",
              size: "LARGE",
              label: "Assign to",
              placeholder: "Select a user",
              defaultValue: editTask.assigned_member,
              choices: [
                {
                  text: "Available for Sign Up",
                  value: null
                },
                ...evaluators.map((e) => {
                  return {
                    text: e.evaluator_name,
                    value: e.evaluator_id
                  }
                })
              ]
            }
          ]}
          cols={4}
        />
      }

      {deleteTaskId &&
        <ConfirmModal
          title="Delete task?"
          confirmLabel="Delete"
          handleConfirm={handleDeleteTask}
          handleCancel={closeDeleteTaskModal}
          destructive
          data={deleteTaskId}
        >
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default Tasks;