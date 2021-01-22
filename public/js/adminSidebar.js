let entriesTab = document.getElementById("sidebar-entries");
let resultsTab = document.getElementById("sidebar-results");
let evaluationsTab = document.getElementById("sidebar-evaluations");
let currentContest;

request("get", "/api/internal/contests/getCurrentContest", null, (data) => {
    if (!data.error) {
        currentContest = data.currentContest.contest_id;
        entriesTab.href = "/entries/" + data.currentContest.contest_id;
        resultsTab.href = "/results/" + data.currentContest.contest_id;
    } else {
        displayError(data.error);
    }
});

request("get", "/api/internal/users/id", null, (d) => {
    if (!d.error) {
        if (d.evaluator_id !== null) {
            // The evaluations tab only needs to be updated if the user is logged in, since public users can't see the evaluations page
            request("get", "/api/internal/contests/getContestsEvaluatedByUser?userId=" + d.evaluator_id, null, (data) => {
                if (!data.error) {
                    if (data.contests.length > 0) {
                        evaluationsTab.href += ("/" + data.contests[0].contest_id);
                    } else {
                        evaluationsTab.href += ("/" + currentContest);
                    }
                } else {
                    displayError(data.error);
                }
            });
        }
    } else {
        displayError(d.error.message);
    }
});
