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
                    ${ data.is_admin || permissions.manage_announcements ? `
                        <i class="actions-dropdown-btn" onclick="showActionDropdown('message-dropdown-${msg.message_id}');"></i>
                        <div class="actions-dropdown-content" hidden id="message-dropdown-${msg.message_id }">
                            <a href="javascript:void(0);" onclick="showEditMessageForm(${ msg.message_id }, '${ msg.message_date }', '${ msg.message_title }', \`${ msg.message_content.replace(/"/g, "'") }\`, ${ msg.public });">Edit</a>
                            <a href="javascript:void(0);" onclick="showConfirmModal('Delete Message?', 'Are you sure you want to delete this message? This action cannot be undone.', 'deleteMessage(${ msg.message_id })', true, 'Delete')">Delete</a>
                        </div>
                    ` : "" }
                </div>
                <div class="message-content">
                    ${ msg.message_content.replace(/\n/g, '<br>') }
                </div>
                <div class="message-bottom">
                    <div class="message-meta">
                        ${ data.logged_in
                            ? `<p class="message-public"><span class="label">Visibility</span>${ msg.public ? "Public" : "Not public" }</p>`
                            : ""
                        }
                        <p class="message-author"><span class="label">Author</span>
                            ${ msg.message_author }
                        </p>
                        <p class="message-date"><span class="label">Posted</span>
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
                        <p><strong>Status: </strong>${c.task_status}</p>
                        ${c.task_status === "Not Started" ? `
                            <p><span style="padding-left: 0px !important;" class="btn-tertiary" onclick="showConfirmModal('Mark as started?', 'Are you sure you want to mark this task as started? This action cannot be undone.', 'editTask(${c.task_id})', false, 'Start Task')">Mark as Started</span></p>
                        ` : c.task_status === "Started" ? `
                            <p><span style="padding-left: 0px !important;" class="btn-tertiary" onclick="showConfirmModal('Mark as completed?', 'Are you sure you want to mark this task as completed? You will lose access to this task after it is completed.', 'editTask(${c.task_id})', false, 'Complete Task')">Mark as Completed</span></p>
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
                            <span style="padding-left: 0px !important" class="btn-tertiary" onclick="showConfirmModal('Sign up for task?', 'Are you sure you want to sign up for this task? This action cannot be undone.', 'signUpForTask(${c.task_id})', false, 'Sign Up')">Sign Up</span>
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
    // Set default message creation Date
    let today = new Date();
    let date = (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getFullYear();
    document.querySelector("#create-message-form #new_message_date").value = date;

    showPage("create-message-page");
}
let showEditMessageForm = (...args) => {
    // Params are passed into displayed HTML.
    let editMsgForm = document.querySelector("#edit-message-form");
    editMsgForm["message_id"].value = args[0];
    editMsgForm["message_date"].value = args[1];
    editMsgForm["message_title"].value = args[2];
    editMsgForm["public"].checked = args[4];

    // Fill text editors
    document.querySelector("#edit-announcement-editor").firstChild.innerHTML = args[3];

    showPage("edit-message-page");
}

let editTask = (edit_task_id) => {
    request("put", "/api/internal/tasks", {
        edit_task_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
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

let signUpForTask = (task_id) => {
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

// Create text editors
var newAnnouncementEditor = new Quill("#new-announcement-editor", quillOptions);
var editAnnouncementEditor = new Quill("#edit-announcement-editor", quillOptions);
