let searchResultsTable = document.getElementById("contestant-search-results-table");
let searchResultsTableBody = document.getElementById("contestant-search-results-table-body");

const searchContestants = (e) => {
    e.preventDefault();

    request("get", "/api/internal/contestants/search?searchQuery="+e.target["search-input"].value, null, (data) => {
        if (!data.error) {
            searchResultsTableBody.innerHTML = '';

            if (data.contestants.length > 0) {
                data.contestants.forEach(c => {
                    searchResultsTableBody.innerHTML += `
                    <tr>
                        <td>${c.contestant_names}</td>
                        <td>${c.contestant_kaid}</td>
                        <td><a href="/contestants/${c.contestant_kaid}">View Profile</a></td>
                    </tr>`;
                });
            } else {
                searchResultsTableBody.innerHTML = '<span id="no-results">No results found.</span>';
            }

            searchResultsTable.hidden = false;
        } else {
            displayError(data.error);
        }
    });
}
