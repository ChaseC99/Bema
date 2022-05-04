import React, { useEffect, useState } from "react";
import { Error } from ".";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import { fetchAllErrors } from "./fetchAllErrors";

function AllErrors() {
  const [errors, setErrors] = useState<Error[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAllErrors()
    .then((data) => {
      setErrors(data.errors);
      setIsLoading(false);
    });
  }, []);

  return (
    <React.Fragment>
      <AdminSidebar />

      <section className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>Errors</h2>
          </div>
          <div className="section-body">
            {isLoading && <LoadingSpinner size="LARGE" />}

            {!isLoading &&
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
                  {errors.map((e) => {
                    return (
                      <Row key={e.error_id}>
                        <Cell>{e.error_id}</Cell>
                        <Cell>{e.evaluator_id}</Cell>
                        <Cell>{e.error_tstz}</Cell>
                        <Cell>{e.error_message}</Cell>
                        <Cell><Button type="tertiary" role="link" action={"/admin/errors/" + e.error_id} text="View" /></Cell>
                      </Row>
                    );
                  })}
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