import React, { useState } from "react";
import Button from "../../shared/Button";
import { Form } from "../../shared/Forms";
import AdminSidebar from "../../shared/Sidebars/AdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import { fetchContestantSearchData } from "./fetchContestantData";

type Contestant = {
  contestant_kaid: string
  contestant_names: string
}

function ContestantSearch() {
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [results, setResults] = useState<Contestant[]>([]);

  const handleSearch = (values: { [name: string]: any }) => {
    fetchContestantSearchData(values.search_input)
      .then((data) => {
        setResults(data.contestants);
        setHasSearched(true);
      });
  }

  return (
    <React.Fragment>
      <AdminSidebar />

      <section id="contestant-search-section" className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2 data-testid="contestant-search-header">Search Contestants</h2>
          </div>
          <div className="section-body" data-testid="contestant-search-section-body">
            <div className="col-5" style={{marginBottom: "50px"}}>
              <Form
                onSubmit={handleSearch}
                submitLabel="Search"
                cols={6}
                fields={[
                  {
                    fieldType: "INPUT",
                    type: "text",
                    size: "LARGE",
                    name: "search_input",
                    id: "search-input",
                    label: "",
                    defaultValue: "",
                    placeholder: "Enter display name or KAID"
                  }
                ]}
              />
            </div>

            {hasSearched &&
              <Table>
                <TableHead>
                  <Row>
                    <Cell>Name</Cell>
                    <Cell>KAID</Cell>
                    <Cell></Cell>
                  </Row>
                </TableHead>
                <TableBody>
                  {(results.length > 0) ?
                    results.map((r) => {
                      return (
                        <Row>
                          <Cell>{r.contestant_names}</Cell>
                          <Cell>{r.contestant_kaid}</Cell>
                          <Cell><Button type="tertiary" role="link" action={"/contestants/" + r.contestant_kaid} text="View Profile" /></Cell>
                        </Row>
                      );
                    })

                    :

                    <Row>
                      <Cell>No results found.</Cell>
                      <Cell></Cell>
                      <Cell></Cell>
                    </Row>
                  }
                </TableBody>
              </Table>
            }
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

export default ContestantSearch;