let incompleteTasksTableBody = document.querySelector("#incomplete-tasks-table-body");
let completedTasksTableBody = document.querySelector("#completed-tasks-table-body");
let taskAssignedMember = document.querySelector("#assigned-member-dropdown .select-dropdown-content");
let editTaskAssignedMember = document.querySelector("#edit-assigned-member-dropdown .select-dropdown-content");
let tab = document.querySelector("#sidebar-tasks");

// Load page data
request("get", "/api/internal/tasks", null, data => {
    if (!data.error) {
        if (data.logged_in) {
            data.tasks.forEach(t => {
                if (t.task_status === "Completed") {
                    completedTasksTableBody.innerHTML += `
                    <tr id="${t.task_id}">
                        <td>${t.task_title}</td>
                        <td>${t.due_date}</td>
                        <td>${t.evaluator_name !== null ? t.evaluator_name : "Available for Sign Up"}</td>
                        <td>${t.task_status}</td>
                        ${permissions.edit_all_tasks || permissions.delete_all_tasks || data.is_admin ? `
                            <td class="actions">
                                <i class="actions-dropdown-btn" onclick="showActionDropdown('task-dropdown-${t.task_id}');"></i>
                                <div class="actions-dropdown-content" hidden id="task-dropdown-${t.task_id}">
                                    ${permissions.edit_all_tasks || data.is_admin ? `<a href="#" onclick="showEditTaskForm(${t.task_id}, '${t.task_title}', '${t.due_date}', '${t.assigned_member}', '${t.task_status}', '${t.evaluator_name}');">Edit</a>` : ""}
                                    ${permissions.delete_all_tasks || data.is_admin ? `<a href="#" onclick="showConfirmModal('Delete Task?', 'Are you sure you want to delete this task? This action cannot be undone.', 'deleteTask(${t.task_id})', true, 'Delete')">Delete</a>` : "" }
                                </div>
                            </td>
                        ` : ""}
                    </tr>`;
                }
                else {
                    incompleteTasksTableBody.innerHTML += `
                    <tr id="${t.task_id}">
                        <td>${t.task_title}</td>
                        <td>${t.due_date}</td>
                        <td>${t.evaluator_name !== null  ? t.evaluator_name : "Available for Sign Up"}</td>
                        <td>${t.task_status}</td>
                        ${permissions.edit_all_tasks || permissions.delete_all_tasks || data.is_admin ? `
                            <td class="actions">
                                <i class="actions-dropdown-btn" onclick="showActionDropdown('task-dropdown-${t.task_id}');"></i>
                                <div class="actions-dropdown-content" hidden id="task-dropdown-${t.task_id}">
                                    ${permissions.edit_all_tasks || data.is_admin ? `<a href="#" onclick="showEditTaskForm(${t.task_id}, '${t.task_title}', '${t.due_date}', '${t.assigned_member}', '${t.task_status}', '${t.evaluator_name}');">Edit</a>` : ""}
                                    ${permissions.delete_all_tasks || data.is_admin ? `<a href="#" onclick="showConfirmModal('Delete Task?', 'Are you sure you want to delete this task? This action cannot be undone.', 'deleteTask(${t.task_id})', true, 'Delete')">Delete</a>` : "" }
                                </div>
                            </td>
                        ` : ""}
                    </tr>`;
                }
            });
        }
    } else {
        displayError(data.error);
    }
});

request("get", "/api/internal/users", null, data => {
    if (!data.error) {
        if (data.is_admin || permissions.edit_all_tasks) {
            data.evaluators.forEach(c => {
                taskAssignedMember.innerHTML += `
                    ${!c.account_locked ? `
                        <a href="#" onclick="setSelectValue('assigned-member', ${c.evaluator_id}, '${c.evaluator_name}');">${c.evaluator_name}</a>
                    ` : ""}
                `;
                editTaskAssignedMember.innerHTML += `
                    ${!c.account_locked ? `
                        <a href="#" onclick="setSelectValue('edit-assigned-member', ${c.evaluator_id}, '${c.evaluator_name}');">${c.evaluator_name}</a>
                    ` : ""}
                `;
            });
        }
    } else {
        displayError(data.error);
    }
});

// Handles form requests
let addTask = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        if (key.value === "null") {
            body[key.name] = null;
        } else if (key.name === "assigned_member") {
            body[key.name] = parseInt(key.value);
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("post", "/api/internal/tasks", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}
let editTask = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        if (key.value === "null") {
            body[key.name] = null;
        } else if (key.name === "edit_assigned_member") {
            body[key.name] = parseInt(key.value);
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("put", "/api/internal/tasks", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}
let deleteTask = (task_id) => {
    request("delete", "/api/internal/tasks", {
        task_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

// Shows task forms
let showViewTasks = () => {
    let viewTasks = document.querySelector("#view-tasks-container");
    let createTask = document.querySelector("#create-task-container");
    let editTask = document.querySelector("#edit-task-container");

    createTask.style.display = "none";
    editTask.style.display = "none";
    viewTasks.style.display = "block";
}
let showCreateTaskForm = () => {
    let createTask = document.querySelector("#create-task-container");
    let viewTasks = document.querySelector("#view-tasks-container");

    // Set default date
    let today = new Date();
    let date = (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getFullYear();
    document.querySelector("#add-task-form #due_date").value = date;

    viewTasks.style.display = "none";
    createTask.style.display = "block";
}
let showEditTaskForm = (...args) => {
    let editTask = document.querySelector("#edit-task-container");
    let viewTasks = document.querySelector("#view-tasks-container");
    let editTaskForm = document.querySelector("#edit-task-form");
    viewTasks.style.display = "none";
    editTask.style.display = "block";
    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editTaskForm.length - 1; i++) {
        editTaskForm[i].value = args[i];
    }

    setSelectValue('edit-assigned-member', `${args[3]}`, `${args[5] === 'null' ? 'Available for Sign Up' : args[5]}`)
    setSelectValue('edit-status', `${args[4]}`, `${args[4]}`);
}

// Update navbar highlighting
tab.classList.add("selected");
