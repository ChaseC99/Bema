import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppError from "../../../util/errors";

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
  query GetAllErrors($page: Int!) {
    errors(page: $page) {
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
  const [page, setPage] = useState<number>(0);
  const { handleGQLError } = useAppError();
  const { loading, data, fetchMore } = useQuery<GetAllErrorsResponse>(GET_ALL_ERRORS, {
    variables: {
      page: page
    },
    onError: handleGQLError
  });

  const handleNextPage = () => {
    fetchMore({
      variables: {
        page: page + 1
      }
    });

    setPage(page + 1);
  }

  const handlePreviousPage = () => {
    if (page === 0) {
      return;
    }

    setPage(page - 1);
  }

  return (
    <React.Fragment>
      <AdminSidebar />

      <section className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>Errors</h2>

            <span className="section-actions" data-testid="contests-section-actions">
              <Button type="tertiary" role="button" action={handlePreviousPage} text="Prev" disabled={page === 0} style={{ marginLeft: "16px", marginRight: "16px" }} />
              |
              <Button type="tertiary" role="button" action={handleNextPage} text="Next" disabled={!loading && data?.errors.length === 0} style={{ marginLeft: "16px", marginRight: "16px" }} />
            </span>
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
                  }) : ""}
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