import { gql, useLazyQuery } from "@apollo/client";
import React from "react";
import Button from "../../shared/Button";
import { Form } from "../../shared/Forms";
import LoadingSpinner from "../../shared/LoadingSpinner";
import AdminSidebar from "../../shared/Sidebars/AdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../shared/Table";
import useAppError from "../../util/errors";

type Contestant = {
  name: string
  kaid: string
}

type ContestantSearchResponse = {
  contestants: Contestant[]
}

const CONTESTANT_SEARCH = gql`
  query ContestantSearch($query: String!) {
    contestants: contestantSearch(query: $query) {
      name
      kaid
    }
  }
`;

function ContestantSearch() {
  const { handleGQLError } = useAppError();
  const [search, { loading, data }] = useLazyQuery<ContestantSearchResponse>(CONTESTANT_SEARCH, { onError: handleGQLError });

  const handleSearch = (values: { [name: string]: any }) => {
    search({
      variables: {
        query: values.search_input
      }
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
            <div className="col-5" style={{ marginBottom: "50px" }}>
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
                    placeholder: "Enter display name or KAID",
                    required: true
                  }
                ]}
              />
            </div>

            {(loading && !data) && 
              <div className="col-12">
                <LoadingSpinner size="LARGE" />
              </div>
            }

            {(!loading && data) &&
              <Table>
                <TableHead>
                  <Row>
                    <Cell>Name</Cell>
                    <Cell>KAID</Cell>
                    <Cell></Cell>
                  </Row>
                </TableHead>
                <TableBody>
                  {(data.contestants.length > 0) ?
                    data.contestants.map((r) => {
                      return (
                        <Row key={r.kaid}>
                          <Cell>{r.name}</Cell>
                          <Cell>{r.kaid ? r.kaid : "N/A"}</Cell>
                          <Cell>
                            {r.kaid ? 
                              <Button type="tertiary" role="link" action={"/contestants/" + r.kaid} text="View Profile" />
                              :
                              "No profile available"
                            }
                          </Cell>
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