import React, { useState } from "react";
import ActionMenu, { Action } from "../../../shared/ActionMenu";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal, FormModal } from "../../../shared/Modals";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import request from "../../../util/request";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import useAppError from "../../../util/errors";

type Task = {
  id: string
  title: string
  assignedUser: {
    id: string
    nickname: string
  } | null
  status: "Not Started" | "Started" | "Completed"
  dueDate: string
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

type GetTasksResponse = {
  tasks: Task[]
}

const GET_COMPLETED_TASKS = gql`
  query GetCompletedTasks {
    tasks: completedTasks {
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

const GET_INCOMPLETE_TASKS = gql`
  query GetIncompleteTasks {
    tasks {
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

type GetUsersResponse = {
  users: {
    id: number
    nickname: string
  }[]
}

const GET_USERS = gql`
  query GetAllUsers {
    users{
      id
      nickname
    }
  }
`;

function Tasks() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const { data: usersData } = useQuery<GetUsersResponse>(GET_USERS, { onError: handleGQLError });
  const { loading: incompleteTasksIsLoading, data: incompleteTasksData, refetch: refetchIncompleteTasks } = useQuery<GetTasksResponse>(GET_INCOMPLETE_TASKS);
  const [fetchCompletedTasks, { loading: completedTasksIsLoading, data: completedTasksData, refetch: refetchCompletedTasks }] = useLazyQuery<GetTasksResponse>(GET_COMPLETED_TASKS);

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

    refetchIncompleteTasks();
    setShowNewTaskModal(false);
  }

  const openEditTaskModal = (id: string) => {
    let task = incompleteTasksData?.tasks.find((t) => t.id === id);

    if (!task) {
      task = completedTasksData?.tasks.find((t) => t.id === id);
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
      edit_task_id: editTask?.id,
      edit_task_title: data.title,
      edit_due_date: data.due_date,
      edit_assigned_member: data.assigned_member,
      edit_task_status: data.status,
    });

    if (editTask?.status !== "Completed" && data.status !== "Completed") {
      refetchIncompleteTasks();
    }
    else if (editTask?.status === "Completed" && data.status === "Completed") {
      if (completedTasksData) {
        refetchCompletedTasks();
      }
    }
    else {
      refetchIncompleteTasks();
      if (completedTasksData) {
        refetchCompletedTasks();
      }
    }

    setEditTask(null);
  }

  const openDeleteTaskModal = (id: string) => {
    setDeleteTaskId(id);
  }

  const closeDeleteTaskModal = () => {
    setDeleteTaskId(null);
  }

  const handleDeleteTask = async (id: number) => {
    await request("DELETE", "/api/internal/tasks", {
      task_id: id
    });

    refetchIncompleteTasks();

    if (completedTasksData) {
      refetchCompletedTasks();
    }

    setDeleteTaskId(null);
  }

  const loadCompletedTasks = () => {
    fetchCompletedTasks();
  }

  const getTaskActions = (taskId: string) => {
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

  return (
    <React.Fragment>
      <AdminSidebar />

      <section id="tasks-section" className="container col-12">
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
                  {incompleteTasksData ? incompleteTasksData.tasks.map((t) => {
                    if (state.user?.permissions.edit_all_tasks || state.user?.permissions.delete_all_tasks) {
                      return (
                        <Row key={t.id}>
                          <Cell>{t.title}</Cell>
                          <Cell>{t.dueDate}</Cell>
                          <Cell>{t.assignedUser ? t.assignedUser.nickname : "Available for Sign Up"}</Cell>
                          <Cell>{t.status}</Cell>
                          <Cell><ActionMenu actions={getTaskActions(t.id)} /></Cell>
                        </Row>
                      );
                    }

                    return (
                      <Row key={t.id}>
                        <Cell>{t.title}</Cell>
                        <Cell>{t.dueDate}</Cell>
                        <Cell>{t.assignedUser ? t.assignedUser.nickname : "Available for Sign Up"}</Cell>
                        <Cell>{t.status}</Cell>
                      </Row>
                    );
                  }) : ""}
                </TableBody>
              </Table>
            }

            {(!completedTasksIsLoading && !completedTasksData) &&
              <div className="container col-12 center">
                <Button type="secondary" role="button" action={loadCompletedTasks} text="Load completed tasks" />
              </div>
            }

            {(completedTasksIsLoading || completedTasksData) &&
              <React.Fragment>
                {completedTasksIsLoading && <LoadingSpinner size="MEDIUM" />}

                {!completedTasksIsLoading &&
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
                      {completedTasksData ? completedTasksData.tasks.map((t) => {
                        if (state.user?.permissions.edit_all_tasks || state.user?.permissions.delete_all_tasks) {
                          return (
                            <Row key={t.id}>
                              <Cell>{t.title}</Cell>
                              <Cell>{t.dueDate}</Cell>
                              <Cell>{t.assignedUser ? t.assignedUser.nickname : "Available for Sign Up"}</Cell>
                              <Cell>{t.status}</Cell>
                              <Cell><ActionMenu actions={getTaskActions(t.id)} /></Cell>
                            </Row>
                          );
                        }

                        return (
                          <Row key={t.id}>
                            <Cell>{t.title}</Cell>
                            <Cell>{t.dueDate}</Cell>
                            <Cell>{t.assignedUser ? t.assignedUser.nickname : "Available for Sign Up"}</Cell>
                            <Cell>{t.status}</Cell>
                          </Row>
                        );
                      }) : ""}
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
              defaultValue: "",
              required: true
            },
            {
              fieldType: "DATE",
              name: "due_date",
              id: "due-date",
              size: "MEDIUM",
              label: "Due date",
              defaultValue: (new Date()).toLocaleString(),
              required: true
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
                ...(usersData ? usersData.users.map((u) => {
                  return {
                    text: u.nickname,
                    value: u.id
                  }
                }) : [])
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
              defaultValue: editTask.title,
              required: true
            },
            {
              fieldType: "DATE",
              name: "due_date",
              id: "due-date",
              size: "MEDIUM",
              label: "Due date",
              defaultValue: editTask.dueDate,
              required: true
            },
            {
              fieldType: "SELECT",
              name: "status",
              id: "status",
              size: "MEDIUM",
              label: "Status",
              placeholder: "Select a status",
              defaultValue: editTask.status,
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
              ],
              required: true
            },
            {
              fieldType: "SELECT",
              name: "assigned_member",
              id: "assigned-member",
              size: "LARGE",
              label: "Assign to",
              placeholder: "Select a user",
              defaultValue: editTask.assignedUser ? editTask.assignedUser.id : null,
              choices: [
                {
                  text: "Available for Sign Up",
                  value: null
                },
                ...(usersData ? usersData.users.map((u) => {
                  return {
                    text: u.nickname,
                    value: u.id
                  }
                }) : [])
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