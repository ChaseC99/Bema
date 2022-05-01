import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Error } from ".";
import Button from "../../../shared/Button";
import ErrorPage from "../../../shared/ErrorPage";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal } from "../../../shared/Modals";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import useAppState from "../../../state/useAppState";
import request from "../../../util/request";
import { fetchErrorDetails } from "./fetchErrorDetails";

function ErrorDetail() {
  const { errorId } = useParams();
  const { state } = useAppState();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

  useEffect(() => {
    fetchErrorDetails(parseInt(errorId || ""))
    .then((data) => {
      setError(data.error);
      setIsLoading(false);
    });
  }, [errorId]);

  const openDeleteErrorModal = (id: number) => {
    setDeleteErrorId(id);
  }

  const closeDeleteErrorModal = () => {
    setDeleteErrorId(null);
  }

  const handleDeleteError = async (id: number) => {
    await request("DELETE", "/api/internal/errors", {
      error_id: id
    });

    closeDeleteErrorModal();
    setShouldRedirect(true);
  }

  if (shouldRedirect) {
    return (
      <Navigate to="/admin/errors" />
    );
  }

  return (
    <React.Fragment>
      <AdminSidebar />

      <section className="container col-12">
        <div className="col-8">
          <div className="section-header">
            <h2>Error #{errorId}</h2>

            <span className="section-actions">
              <Button type="tertiary" role="link" action="/admin/errors" text="Back to all errors" />
              {(state.is_admin || state.user?.permissions.delete_errors) &&
                <Button type="primary" role="button" action={openDeleteErrorModal} data={errorId} text="Delete" destructive />
              }
            </span>
          </div>
          <div className="section-body">
            {isLoading && <LoadingSpinner size="LARGE" />}

            {(!isLoading && error) &&
              <div className="card col-12" style={{ padding: "30px" }}>
                <p><strong>User ID:</strong> {error.evaluator_id}</p>
                <p><strong>Date:</strong> {error.error_tstz}</p>
                <p><strong>Request Origin:</strong> {error.request_origin}</p>
                <p><strong>Request Referrer:</strong> {error.request_referer}</p>
                <p><strong>User Agent:</strong> {error.user_agent}</p>
                <p><strong>Error Message:</strong> {error.error_message}</p>
                <p><strong>Call Stack:</strong> {error.error_stack}</p>
              </div>
            }

            {(!isLoading && !error) && 
              <ErrorPage type="NOT FOUND" />
            }
          </div>
        </div>
      </section>

      {deleteErrorId &&
        <ConfirmModal
          title="Delete error?"
          confirmLabel="Delete"
          handleConfirm={handleDeleteError}
          handleCancel={closeDeleteErrorModal}
          destructive
          data={deleteErrorId}
        >
          <p>Are you sure you want to delete this error? This action cannot be undone.</p>
        </ConfirmModal>
      }
    </React.Fragment>
  );
}

export default ErrorDetail;