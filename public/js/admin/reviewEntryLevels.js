const tab = document.querySelector("#sidebar-skill-levels");
const entryEditorContainer = document.querySelector("#entry-editor-container");
const authorInformation = document.querySelector("#author-information");

// The ID of the entry currently being reviewed
let entryID;

request("get", "/api/internal/admin/skillLevels/getNextEntryToReview", null, data => {
    if (!data.error) {
        entryID = data.entry.entry_id;

        entryEditorContainer.innerHTML = `
            <a href="${data.entry.entry_url}" target="_blank"><h3>${data.entry.entry_title}</h3></a>
            <p>By: <a href="https://www.khanacademy.org/profile/${data.entry.entry_author_kaid}/projects" target="_blank">${data.entry.entry_author}</a></p>
            <p>Votes: ${data.entry.entry_votes}</p>
            <iframe id="entry-viewer-iframe" src="${data.entry.entry_url}/embedded" height="${data.entry.entry_height}"></iframe>
        `;

        request("get", "/api/internal/contestants/entries?id="+data.entry.entry_author_kaid, null, data => {
            if (!data.error) {
                authorInformation.innerHTML = `
                <h3>Previous Submissions</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Contest</th>
                            <th>Level</th>
                            <th>Avg Score</th>
                        </tr>
                    </thead>
                    <tbody id="entries-table-body">
                    </tbody>
                </table>
                `;

                const entriesTable = document.querySelector("#entries-table-body");
                data.entries.forEach((entry) => {
                    entriesTable.innerHTML += `
                    <tr>
                        <td>${entry.entry_id}</td>
                        <td>
                            ${entry.entry_title}
                            ${entry.disqualified ? '<span class="disqualified-tag">Disqualified</span>' : ''}
                            ${entry.is_winner ? '<span class="winner-tag">Winner</span>' : ''}
                        </td>
                        <td>${entry.contest_name}</td>
                        <td>${entry.entry_level}</td>
                        <td>${entry.avg_score ? entry.avg_score : "-----"}</td>
                    </tr>
                    `;
                })
            } else {
                displayError(data.error);
            }
        });
    } else {
        displayError(data.error);
    }
});

const setSkillLevel = (level) => {
    request("put", "/api/internal/admin/skillLevels/setEntrySkillLevel", {
        entry_id: entryID,
        entry_level: level
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

const deleteEntry = () => {
    request("delete", "/api/internal/entries", {
        entry_id: entryID
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

const disqualifyEntry = () => {
    request("put", "/api/internal/entries/disqualify", {
        entry_id: entryID
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

// Update navbar highlighting
tab.classList.add("selected");
