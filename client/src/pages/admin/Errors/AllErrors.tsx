import { gql, useQuery } from "@apollo/client";
import React from "react";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import { handleGqlError } from "../../../util/errors";

type Error = {
  id: string
  message: string
  timestamp: string
  user: {
    id: string
  } | null
}

type GetAllErrorsResponse = {
  errors: Error[]
}

const GET_ALL_ERRORS = gql`
  query GetAllErrors {
    errors {
      id
      message
      timestamp
      user {
        id
      }
    }
  }
`;

function AllErrors() {
  const { loading, data, error } = useQuery<GetAllErrorsResponse>(GET_ALL_ERRORS);

  if (error) {
    return handleGqlError(error)
  }

  return (
    <React.Fragment>
      <AdminSidebar />

      <section className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>Errors</h2>
          </div>
          <div className="section-body">
            {loading && <LoadingSpinner size="LARGE" />}

            {!loading &&
              <Table>
                <TableHead>
                  <Row>
                    <Cell header>Error ID</Cell>
                    <Cell header>User ID</Cell>
                    <Cell header>Date</Cell>
                    <Cell header>Message</Cell>
                    <Cell header></Cell>
                  </Row>
                </TableHead>
                <TableBody>
                  {data ? data.errors.map((e) => {
                    return (
                      <Row key={e.id}>
                        <Cell>{e.id}</Cell>
                        <Cell>{e.user?.id}</Cell>
                        <Cell>{e.timestamp}</Cell>
                        <Cell>{e.message}</Cell>
                        <Cell><Button type="tertiary" role="link" action={"/admin/errors/" + e.id} text="View" /></Cell>
                      </Row>
                    );
                  }): ""}
                </TableBody>
              </Table>
            }
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

export default AllErrors;