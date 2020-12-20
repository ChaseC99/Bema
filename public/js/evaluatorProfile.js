let userId = document.location.href.split("/")[4];
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
        pageTitle.innerHTML = `<h2>User Profile - ${data.evaluator_name}</h2>`;

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

        if (is_self || is_admin) {
            // Personal Information
            personalInformationSpinner.style.display = "none";
            personalInformation.innerHTML = `
                <p><strong>Display Name:</strong> ${data.nickname}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Receive email notifications:</strong> ${data.receive_emails ? "Yes" : "No"}</p>
            `;
            if (is_self && !is_admin) {
                personalInformation.parentNode.firstElementChild.innerHTML += `<i class="control-btn far fa-edit" onclick="showEditPersonalInformationForm('${data.nickname}', '${data.email}', ${data.receive_emails});"></i>`;
            }

            // Login Information
            loginInformationSpinner.style.display = "none";
            loginInformation.innerHTML = `
                <p><strong>Username:</strong> ${data.username}</p>
                <p><strong>Last login:</strong> ${data.logged_in_tstz}</p>
                <p><span class="admin-button" onclick="showResetPasswordForm();">Reset Password</span></p>
            `;
            if (is_self && !is_admin) {
                loginInformation.parentNode.firstElementChild.innerHTML += `<i class="control-btn far fa-edit" onclick="showEditLoginInformationForm('${data.username}');"></i>`;
            }
        }
    } else {
        alert(data.error.message);
    }
});

request("get", "/api/internal/users/stats?userId="+userId, null, (data) => {
    if (!data.error) {
        judgingInformation.innerHTML += `
            <p><strong>Contests Judged:</strong> ${data.totalContestsJudged}</p>
            <p><strong>Total Entries Scored:</strong> ${data.totalEvaluations}</p>
        `;
    } else {
        alert(data.error.message);
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
            alert(data.error.message);
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
            alert(data.error.message);
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
            alert(data.error.message);
        }
    });
}

// Show page forms
let showEditPersonalInformationForm = (...args) => {
    // nickname, email, receive_emails
    let formPage = document.querySelector("#edit-personal-information-page");
    let profile = document.querySelector("#view-profile-page");
    let form = document.querySelector("#edit-personal-information-form");
    profile.style.display = "none";
    formPage.style.display = "block";

    for (let i = 0; i < form.length - 1; i++) {
        if (form[i].name === "receive_emails") {
            form[i].checked = args[i];
        } else {
            form[i].value = args[i];
        }
    }
};

let showEditLoginInformationForm = (...args) => {
    // username
    let formPage = document.querySelector("#edit-login-information-page");
    let profile = document.querySelector("#view-profile-page");
    let form = document.querySelector("#edit-login-information-form");
    profile.style.display = "none";
    formPage.style.display = "block";

    for (let i = 0; i < form.length - 1; i++) {
        form[i].value = args[i];
    }
};

let showResetPasswordForm = (...args) => {
    // nickname, email, receive_emails
    let formPage = document.querySelector("#reset-password-page");
    let profile = document.querySelector("#view-profile-page");
    let form = document.querySelector("#reset-password-form");
    profile.style.display = "none";
    formPage.style.display = "block";
};
