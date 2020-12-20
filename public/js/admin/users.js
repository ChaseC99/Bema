let usersSpinner = document.querySelector("#users-spinner");
let usersPreviewBox = document.querySelector("#users-preview-box");
let tab = document.querySelector("#sidebar-users");

// Loads page data
request("get", "/api/internal/users", null, data => {
    if (!data.error) {
        if (data.logged_in) {
            data.evaluators.forEach(c => {
                usersSpinner.style.display = "none";
                usersPreviewBox.innerHTML += `
                    <div class="user preview col-4 standard">
                        <div class="db-header">
                            <p>
                                ${c.evaluator_name}
                            </p>
                            <div class="user-options">
                                <i class="control-btn far fa-edit" onclick="showEditUserForm(${c.evaluator_id}, '${c.evaluator_name}', '${c.evaluator_kaid}', '${c.username}', '${c.nickname}', '${c.email}', '${c.dt_term_start}', '${c.dt_term_end}', ${c.is_admin}, ${c.account_locked}, ${c.receive_emails});"></i>
                                <i class="control-btn fas fa-key" onclick="showChangePasswordForm('${c.evaluator_name}', ${c.evaluator_id})"></i>
                                <i class="control-btn fas fa-user" onclick="assumeUserIdentity('${c.evaluator_kaid}')"></i>
                            </div>
                        </div>
                        <div class="preview-content">
                            <p><a href="https://www.khanacademy.org/profile/${c.evaluator_kaid}" target="_blank">KA Profile</a></p>
                            <p><a href="/evaluator/${c.evaluator_id}" target="_blank">Bema Profile</a></p>
                            <p>
                                <span class="bold">ID:</span>
                                ${c.evaluator_id}
                            </p>
                            <p>
                                <span class="bold">KAID:</span>
                                ${c.evaluator_kaid}
                            </p>
                            <p>
                                <span class="bold">Username:</span>
                                ${c.username}
                            </p>
                            <p>
                                <span class="bold">Nickname:</span>
                                ${c.nickname}
                            </p>
                            <p>
                                <span class="bold">Email:</span>
                                ${c.email}
                            </p>
                            <p>
                                <span class="bold">Receive emails:</span>
                                ${c.receive_emails ? `Yes` : `No`}
                            </p>
                            <p>
                                <span class="bold">Term start:</span>
                                ${c.dt_term_start ?
                                    c.dt_term_start :
                                    `N/A`
                                }
                            </p>
                            <p>
                                <span class="bold">Term end:</span>
                                ${c.dt_term_end ?
                                    c.dt_term_end :
                                    `N/A`
                                }
                            </p>
                            <p>
                                <span class="bold">Last login:</span>
                                ${c.logged_in_tstz}
                            </p>
                            ${c.account_locked ? `
                            <p>
                                <span class="bold">Status:</span>
                                <span class="red">Deactivated</span>
                            </p>` : `
                            <p>
                                <span class="bold">Status:</span>
                                <span class="green">Active</span>
                            </p>`
                            }
                            <p>
                                <span class="bold">Permission Level:</span>
                                ${c.is_admin ? "Admin" : "Standard User"}
                            </p>
                        </div>
                    </div>
                `;
            });
        }
    } else {
        alert(data.error.message);
    }
});

// Form request handlers
let editUser = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "edit_user_is_admin" || key.name === "edit_user_account_locked" || key.name === "edit_user_receive_emails") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];
    request("put", "/api/internal/users", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let changePassword = (e) => {
    e.preventDefault();
    let evaluator_id = e.target[0].value;
    let new_password = e.target[1].value;
    request("put", "/api/auth/changePassword", {
        evaluator_id,
        new_password
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            alert(data.error.message);
        }
    });
}
let assumeUserIdentity = (evaluator_kaid) => {
    let confirmed = window.confirm("Are you sure you want to assume this user's identity?");

    if (confirmed) {
        request("post", "/api/auth/assumeUserIdentity", {
            evaluator_kaid
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                alert(data.error.message);
            }
        });
    }
}

// Displays forms
let showEditUserForm = (...args) => {
    // id, name, kaid, username, nickname, email, start, end, is_admin, account_locked, receive_emails
    let editUser = document.querySelector("#edit-user-container");
    let viewUsers = document.querySelector("#view-users-container");
    let editUserForm = document.querySelector("#edit-user-form");
    viewUsers.style.display = "none";
    editUser.style.display = "block";

    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editUserForm.length - 1; i++) {
        if (editUserForm[i].name === "edit_user_is_admin" || editUserForm[i].name === "edit_user_account_locked" || editUserForm[i].name === "edit_user_receive_emails") {
            editUserForm[i].checked = args[i];
        } else {
            editUserForm[i].value = args[i];
        }
    }
};
let showChangePasswordForm = (user_name, evaluator_id) => {
    let changePassword = document.querySelector("#change-password-container");
    let viewUsers = document.querySelector("#view-users-container");
    viewUsers.style.display = "none";
    changePassword.style.display = "block";

    let title = document.querySelector("#change-password-title");
    title.innerText += (" " + user_name + ":");

    let changePasswordForm = document.querySelector("#change-password-form");
    changePasswordForm[0].value = evaluator_id;
}

// Update navbar highlighting
tab.classList.add("selected");
