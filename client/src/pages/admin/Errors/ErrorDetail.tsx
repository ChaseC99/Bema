import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal } from "../../../shared/Modals";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import useAppState from "../../../state/useAppState";
import { handleGqlError } from "../../../util/errors";
import request from "../../../util/request";

type Error = {
  id: string
  message: string
  stack: string | null
  timestamp: string
  requestOrigin: string | null
  requestReferrer: string | null
  requestUserAgent: string | null
  user: {
    id: string
  }
}

type GetErrorDetailsResponse = {
  error: Error
}

const GET_ERROR_DETAILS = gql`
  query GetErrorDetails {
    error(id: 255) {
      id
      message
      stack
      timestamp
      requestOrigin
      requestReferrer
      requestUserAgent
      user {
        id
      }
    }
  }
`;

function ErrorDetail() {
  const { errorId } = useParams();
  const { state } = useAppState();
  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

  const { loading, data, error } = useQuery<GetErrorDetailsResponse>(GET_ERROR_DETAILS);

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

  if (error) {
    return handleGqlError(error, "This error does not exist.");
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
            {loading && <LoadingSpinner size="LARGE" />}

            {(!loading && data?.error) &&
              <div className="card col-12" style={{ padding: "30px" }}>
                <p><strong>User ID:</strong> {data.error.user?.id}</p>
                <p><strong>Date:</strong> {data.error.timestamp}</p>
                <p><strong>Request Origin:</strong> {data.error.requestOrigin}</p>
                <p><strong>Request Referrer:</strong> {data.error.requestReferrer}</p>
                <p><strong>User Agent:</strong> {data.error.requestUserAgent}</p>
                <p><strong>Error Message:</strong> {data.error.message}</p>
                <p><strong>Call Stack:</strong> {data.error.stack}</p>
              </div>
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