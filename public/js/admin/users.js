let usersSpinner = document.querySelector("#users-spinner");
let deactivatedUsersSpinner = document.querySelector("#deactivated-users-spinner");
let usersPreviewBox = document.querySelector("#users-preview-box");
let deactivatedUsersPreviewBox = document.querySelector("#deactivated-users-preview-box");
let tab = document.querySelector("#sidebar-users");

// Loads page data
request("get", "/api/internal/users", null, data => {
    if (!data.error) {
        if (data.logged_in) {
            data.evaluators.forEach(c => {
                usersSpinner.style.display = "none";
                deactivatedUsersSpinner.style.display = "none";

                let content = `
                    <div class="user preview col-4 standard">
                        <div class="db-header">
                            <p>
                                ${c.evaluator_name}
                            </p>
                            <div class="user-options">
                                <div class="actions-dropdown">`
                                    if (data.is_admin || permissions.edit_user_profiles || permissions.change_user_passwords || permissions.assume_user_identities) {
                                        content += `<i class="fas fa-ellipsis-v actions-dropdown-btn" onclick="showActionDropdown('user-dropdown-${c.evaluator_id}');"></i>`
                                    }
                                    content += `<div class="actions-dropdown-content" hidden id="user-dropdown-${c.evaluator_id}">`;
                                    if (data.is_admin || permissions.edit_user_profiles) {
                                        content += `<a href="#" onclick="showEditUserForm(${c.evaluator_id}, '${c.evaluator_name}', '${c.evaluator_kaid}', '${c.username}', '${c.nickname}', '${c.email}', '${c.dt_term_start}', '${c.dt_term_end}', ${c.is_admin}, ${c.account_locked}, ${c.receive_emails});">Edit Profile</a>`;
                                    }
                                    if (data.is_admin || permissions.change_user_passwords) {
                                        content += `<a href="#" onclick="showChangePasswordForm('${c.evaluator_name}', ${c.evaluator_id})">Change Password</a>`;
                                    }
                                    if (data.is_admin || permissions.assume_user_identities) {
                                        content += `<a href="#" onclick="assumeUserIdentity('${c.evaluator_kaid}')">Assume Identity</a>`;
                                    }
                                    if (data.is_admin) {
                                        content += `<a href="#" onclick="showEditUserPermissionsForm('${c.evaluator_id}')">Edit Permissions</a>`;
                                    }
                    content += `    </div>
                                </div>
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

                if (c.account_locked) {
                    deactivatedUsersPreviewBox.innerHTML += content;
                } else {
                    usersPreviewBox.innerHTML += content;
                }
            });
        }
    } else {
        displayError(data.error);
    }
});

// Form request handlers
let addUser = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("post", "/api/internal/users", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}
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
            displayError(data.error);
        }
    });
}
let editUserPermissions = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "evaluator_id") {
            body[key.name] = key.value;
        } else {
            body[key.name] = key.checked;
        }
    }
    delete body[""];
    request("put", "/api/internal/users/permissions", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
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
            displayError(data.error);
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
                displayError(data.error);
            }
        });
    }
}

// Displays forms
let showDeactivatedUsersPage = () => {
    let deactivatedUsers = document.querySelector("#view-deactivated-users-container");
    let viewUsers = document.querySelector("#view-users-container");
    viewUsers.style.display = "none";
    deactivatedUsers.style.display = "block";
};

let showActiveUsersPage = () => {
    let deactivatedUsers = document.querySelector("#view-deactivated-users-container");
    let viewUsers = document.querySelector("#view-users-container");
    deactivatedUsers.style.display = "none";
    viewUsers.style.display = "block";
};

let showAddUserForm = () => {
    let addUser = document.querySelector("#add-user-container");
    let viewUsers = document.querySelector("#view-users-container");
    viewUsers.style.display = "none";
    addUser.style.display = "block";
};

let showEditUserForm = (...args) => {
    // id, name, kaid, username, nickname, email, start, end, is_admin, account_locked, receive_emails
    let editUser = document.querySelector("#edit-user-container");
    let viewUsers = document.querySelector("#view-users-container");
    let editUserForm = document.querySelector("#edit-user-form");
    let deactivatedUsers = document.querySelector("#view-deactivated-users-container");
    viewUsers.style.display = "none";
    editUser.style.display = "block";
    deactivatedUsers.style.display = "none";

    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editUserForm.length - 1; i++) {
        if (editUserForm[i].name === "edit_user_is_admin" || editUserForm[i].name === "edit_user_account_locked" || editUserForm[i].name === "edit_user_receive_emails") {
            editUserForm[i].checked = args[i];
        } else {
            editUserForm[i].value = args[i];
        }
    }
};
let showEditUserPermissionsForm = (evaluator_id) => {
    let editUser = document.querySelector("#edit-user-permissions-container");
    let viewUsers = document.querySelector("#view-users-container");
    let editUserForm = document.querySelector("#edit-user-permissions-form");
    let deactivatedUsers = document.querySelector("#view-deactivated-users-container");
    viewUsers.style.display = "none";
    editUser.style.display = "block";
    deactivatedUsers.style.display = "none";

    request("get", "/api/internal/users/permissions?userId="+evaluator_id, null, (data) => {
        if (!data.error) {
            let keys = Object.keys(data.permissions);
            for (let i = 0; i < keys.length; i++) {
                if (data.permissions[keys[i]]) {
                    editUserForm[keys[i]].checked = true;
                }
            }
            editUserForm["evaluator_id"].value = evaluator_id;
        } else {
            displayError(data.error);
        }
    });
};
let showChangePasswordForm = (user_name, evaluator_id) => {
    let changePassword = document.querySelector("#change-password-container");
    let viewUsers = document.querySelector("#view-users-container");
    let deactivatedUsers = document.querySelector("#view-deactivated-users-container");
    viewUsers.style.display = "none";
    changePassword.style.display = "block";
    deactivatedUsers.style.display = "none";

    let title = document.querySelector("#change-password-title");
    title.innerText += (" " + user_name + ":");

    let changePasswordForm = document.querySelector("#change-password-form");
    changePasswordForm[0].value = evaluator_id;
}

// Update navbar highlighting
tab.classList.add("selected");
