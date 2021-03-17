let userId = document.location.href.split("/")[4].split("#")[0];
let pageTitle = document.querySelector("#page-title");
let evaluatorNameSpinner = document.querySelector("#evaluator-name-spinner");
let evaluatorInformation = document.querySelector("#evaluator-information");
let evaluatorInformationSpinner = document.querySelector("#evaluator-information-spinner");
let judgingInformation = document.querySelector("#judging-information");
let judgingInformationSpinner = document.querySelector("#judging-information-spinner");
let personalInformation = document.querySelector("#personal-information");
let personalInformationSpinner = document.querySelector("#personal-information-spinner");
let loginInformation = document.querySelector("#login-information");
let loginInformationSpinner = document.querySelector("#login-information-spinner");

request("get", "/api/internal/users?userId="+userId, null, (data) => {
    if (!data.error) {
        let is_admin = data.is_admin;
        let is_self = data.is_self;
        data = data.evaluator;

        // Page Title
        evaluatorNameSpinner.style.display = "none";
        pageTitle.innerHTML = `<h2>User Profile - ${data.nickname}</h2>`;

        // Evaluator Information
        evaluatorInformationSpinner.style.display = "none";
        evaluatorInformation.innerHTML = `
            <p><strong>KA Profile:</strong> <a href="https://www.khanacademy.org/profile/${data.evaluator_kaid}" target="_blank">Link</a></p>
            <p><strong>Term Start:</strong> ${data.dt_term_start}</p>
            <p><strong>Term End:</strong> ${data.dt_term_end ? data.dt_term_end : "N/A"}</p>
            <p><strong>Evaluator Status:</strong> ${data.dt_term_end ? "Retired" : "Active"}</p>
        `;

        // Judging Information
        judgingInformationSpinner.style.display = "none";
        judgingInformation.innerHTML = `
            <p><strong>Judging Group:</strong> ${data.group_id}</p>
        ` + judgingInformation.innerHTML;

        if (is_self || is_admin || permissions.view_all_users) {
            // Personal Information
            personalInformationSpinner.style.display = "none";
            personalInformation.innerHTML = `
                <p><strong>Display Name:</strong> ${data.nickname}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Receive email notifications:</strong> ${data.receive_emails ? "Yes" : "No"}</p>
            `;
            if (is_self && !is_admin && !permissions.edit_user_profiles) {
                personalInformation.parentNode.firstElementChild.innerHTML += `
                    <i class="actions-dropdown-btn" onclick="showActionDropdown('edit-personal-info-dropdown');"></i>
                    <div class="actions-dropdown-content" hidden id="edit-personal-info-dropdown">
                        <a href="#" onclick="showEditPersonalInformationForm('${data.nickname}', '${data.email}', ${data.receive_emails});">Edit</a>
                    </div>
                `;
            }

            // Login Information
            loginInformationSpinner.style.display = "none";
            loginInformation.innerHTML = `
                <p><strong>Username:</strong> ${data.username}</p>
                <p><strong>Last login:</strong> ${data.logged_in_tstz}</p>
            `;
            loginInformation.parentNode.firstElementChild.innerHTML += `
                <i class="actions-dropdown-btn" onclick="showActionDropdown('edit-login-info-dropdown');"></i>
                <div class="actions-dropdown-content" hidden id="edit-login-info-dropdown">
                    ${is_self && !is_admin && !permissions.edit_user_profiles ? `<a href="#" onclick="showEditLoginInformationForm('${data.username}')">Change Username</a>` : ''}
                    <a href="#" onclick="showPage('reset-password-page')">Change Password</a>
                </div>
            `;
        }
    } else {
        displayError(data.error);
    }
});

request("get", "/api/internal/users/stats?userId="+userId, null, (data) => {
    if (!data.error) {
        judgingInformationSpinner.style.display = "none";
        judgingInformation.innerHTML += `
            <p><strong>Contests Judged:</strong> ${data.totalContestsJudged}</p>
            <p><strong>Total Entries Scored:</strong> ${data.totalEvaluations}</p>
        `;
    } else {
        displayError(data.error);
    }
});

// Form request handlers
let editPersonalInformation = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "receive_emails") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    body["evaluator_id"] = parseInt(userId);
    delete body[""];
    request("put", "/api/internal/users", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let editLoginInformation = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    body["evaluator_id"] = parseInt(userId);
    delete body[""];
    request("put", "/api/internal/users", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let resetPassword = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    body["evaluator_id"] = parseInt(userId);
    delete body[""];
    request("put", "/api/auth/changePassword", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

// Show page forms
let showEditPersonalInformationForm = (...args) => {
    // nickname, email, receive_emails
    let form = document.querySelector("#edit-personal-information-form");
    for (let i = 0; i < form.length - 1; i++) {
        if (form[i].name === "receive_emails") {
            form[i].checked = args[i];
        } else {
            form[i].value = args[i];
        }
    }

    showPage("edit-personal-information-page");
};

let showEditLoginInformationForm = (...args) => {
    // username
    let form = document.querySelector("#edit-login-information-form");
    form["username"].value = args[0];

    showPage("edit-login-information-page");
};
