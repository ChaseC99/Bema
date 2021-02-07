let header = document.querySelector(".page-header");
header.classList.add("hero");
let messagesContainer = document.querySelector("#messages-container");
let messagesSpinner = document.querySelector("#messages-spinner");
let tasksContainer = document.querySelector("#tasks-container");
let availableTasksContainer = document.querySelector("#available-tasks-container");
let availableTasksSection = document.querySelector("#available-tasks-section");

// Get messages, and load into page.
request("get", "/api/internal/messages", null, (data) => {
    if (!data.error) {
        messagesSpinner.style.display = "none";
        if (data.messages.length === 0) {
            messagesContainer.innerHTML = "No public messages"
        }
        // Display private stuff based on returned logged_in or is_admin prop.
        data.messages.forEach((msg, idx) => {
            messagesContainer.innerHTML +=
            `<div class="message-container">
                <div class="message-header">
                    <h3>
                        ${ msg.message_title }
                    </h3>
                </div>
                <div class="message-content">
                    ${ msg.message_content.replace(/\n/g, '<br>') }
                </div>
                <div class="message-bottom">
                    <div class="message-options">
                        ${ data.is_admin || permissions.manage_announcements ? `<i class="control-btn far fa-edit" onclick="showEditMessageForm(${ msg.message_id }, '${ msg.message_date }', '${ msg.message_title }', \`${ msg.message_content.replace(/"/g, "'") }\`, ${ msg.public });"></i>` : "" }
                    </div>
                    <div class="message-meta">
                        ${ data.logged_in
                            ? `<p class="message-public ${msg.public ? "red" : "green"}">${ msg.public ? "Public" : "Not public" }</p>`
                            : ""
                        }
                        <p class="message-author">By
                            ${ msg.message_author }
                        </p>
                        <p class="message-date">Posted
                            ${ msg.message_date }
                        </p>
                    </div>
                </div>
            </div>`;
        });
    } else {
        displayError(data.error);
    }
});
// Get tasks for user, load into its container.
request("get", "/api/internal/tasks/user", null, data => {
    if (!data.error) {
        if (data.tasks) {
            if (data.tasks.length === 0) {
                return tasksContainer.innerHTML = "<p>Woohoo! There are no tasks currently assigned to you!</p>";
            }
            data.tasks.forEach(c => {
                tasksContainer.innerHTML += `
                    <div class="task">
                        <h3>${c.task_title}</h3>
                        <p><strong>Due by: </strong>${c.due_date}</p>

                            ${c.task_status === "Not Started" ? `
                                <span class="admin-button tasks" onclick="editTask(${c.task_id}, '${c.task_title}', '${c.due_date}', ${c.assigned_member}, 'Started');"><i class="control-btn tasks far fa-edit"></i>Mark as Started</span>
                            ` : c.task_status === "Started" ? `
                                <span class="admin-button tasks" onclick="editTask(${c.task_id}, '${c.task_title}', '${c.due_date}', ${c.assigned_member}, 'Completed');"><i class="control-btn tasks far fa-check-square"></i>Mark as Completed</span>
                            ` : ""}

                    </div>
                `;
            });
            availableTasksSection.style.display = "none";
        }
    } else {
        displayError(data.error);
    }
});

request("get", "/api/internal/tasks/available", null, data => {
    if (!data.error) {
        if (data.tasks) {
            if (data.tasks.length === 0) {
                availableTasksSection.style.display = "none";
            } else {
                data.tasks.forEach(c => {
                    availableTasksContainer.innerHTML += `
                        <div class="task">
                            <span><h3>${c.task_title}</h3></span>
                            <p><strong>Due by: </strong>${c.due_date}</p>
                            <span class="admin-button tasks" onclick="signUpForTask(${c.task_id})">Sign Up</span>
                        </div>
                    `;
                });
            }
        }
    } else {
        displayError(data.error);
    }
});

///// HTML modifier functions (like displaying forms) /////
let showCreateMessageForm = () => {
    let createMsg = document.querySelector("#create-message-container");
    let viewMsgs = document.querySelector("#view-messages-container");
    let viewTasks = document.querySelector("#view-tasks-container");

    // Set default message creation Date
    let today = new Date();
    let date = (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getFullYear();
    document.querySelector("#create-message-form #new_message_date").value = date;

    viewMsgs.style.display = "none";
    viewTasks.style.display = "none";
    createMsg.style.display = "block";
}
let showEditMessageForm = (...args) => {
    // Params are passed into displayed HTML.
    let editMsg = document.querySelector("#edit-message-container");
    let viewMsgs = document.querySelector("#view-messages-container");
    let viewTasks = document.querySelector("#view-tasks-container");
    let editMsgForm = document.querySelector("#edit-message-form");
    viewMsgs.style.display = "none";
    viewTasks.style.display = "none";
    editMsg.style.display = "block";
    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editMsgForm.length - 1; i++) {
        if (editMsgForm[i].name === "public") {
            editMsgForm[i].checked = args[i];
        } else {
            editMsgForm[i].value = args[i];
        }
    }

    // Fill text editors
    document.querySelector("#edit-announcement-editor").firstChild.innerHTML = args[3];
}

let editTask = (edit_task_id, edit_task_title, edit_due_date, edit_assigned_member, edit_task_status) => {
    let confirm = window.confirm("Are you sure you want to mark this task as " + edit_task_status + "?");
    if (confirm) {
        request("put", "/api/internal/tasks", {
            edit_task_id, edit_task_title, edit_due_date, edit_assigned_member, edit_task_status
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                displayError(data.error);
            }
        });
    }
}

///// These send form post requests /////
let addMessage = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "public") {
            body[key.name] = key.checked;
        } else if (key.name === "send_email") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    body["message_content"] = document.querySelector("#new-announcement-editor").firstChild.innerHTML;
    delete body[""];
    request("post", "/api/internal/messages", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let editMessage = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        if (key.name === "public") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    body["message_content"] = document.querySelector("#edit-announcement-editor").firstChild.innerHTML;
    delete body[""];
    request("put", "/api/internal/messages", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let deleteMessage = (message_id) => {
    let confirm = window.confirm("Are you sure you want to delete this message?");

    if (confirm) {
        request("delete", "/api/internal/messages", {
            message_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                displayError(data.error);
            }
        });
    }
}

let signUpForTask = (task_id) => {
    let confirm = window.confirm("Are you sure you want to sign up for this task?");

    if (confirm) {
        request("put", "/api/internal/tasks/signup", {
            task_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                displayError(data.error);
            }
        });
    }
}

// Create text editors
var newAnnouncementEditor = new Quill("#new-announcement-editor", quillOptions);
var editAnnouncementEditor = new Quill("#edit-announcement-editor", quillOptions);
