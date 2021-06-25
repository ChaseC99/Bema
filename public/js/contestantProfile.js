let hasHashInUrl = document.location.href.indexOf("#") != -1;
let contestantId = (
    hasHashInUrl ?
    document.location.href.split("#")[0].split("/")[4] :
    document.location.href.split("/")[4]
);

let entriesTable = document.getElementById("contestant-entries-table");
let entriesTableBody = document.getElementById("contestant-entries-table-body");
let entriesSpinner = document.getElementById("contestant-entries-spinner");

request("get", "/api/internal/contestants/stats?id="+contestantId, null, (data) => {
    if (!data.error) {
        let contestInfo = document.getElementById("contestant-info");
        contestInfo.innerHTML = `
            <h1>${data.profileInfo.name}$</h1>
            <div id="contestant-stat-container">
                <span class="stat-box"><span class="big-number">${data.entryCount}</span><br><span class="label">Entries<br>Submitted</span></span>
                <span class="stat-box"><span class="big-number">${data.contestCount}</span><br><span class="label">Contests<br>Entered</span></span>
            </div>
        `;
        contestInfo.hidden = false;
    } else {
        displayError(data.error);
    }
});

request("get", "/api/internal/contestants/entries?id="+contestantId, null, (data) => {
    if (!data.error) {
        data.entries.forEach(e => {
            entriesTableBody.innerHTML += `
            <td>${e.entry_id}</td>
            <td>
                ${e.entry_title}
                ${e.disqualified ? '<span class="disqualified-tag">Disqualified</span>' : ''}
                ${e.is_winner ? '<span class="winner-tag">Winner</span>' : ''}
            </td>
            <td>${e.contest_name.split("Contest: ")[1]}</td>
            <td>${e.entry_level}</td>
            <td>${e.avg_score}</td>
            `;
        });
        entriesTable.hidden = false;
        entriesSpinner.style.display = "none";
    } else {
        displayError(data.error);
    }
});
