import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { ConfirmModal } from "../../../shared/Modals";
import AdminSidebar from "../../../shared/Sidebars/AdminSidebar";
import useAppState from "../../../state/useAppState";
import useAppError from "../../../util/errors";
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
  query GetErrorDetails($id: ID!) {
    error(id: $id) {
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

type DeleteErrorResponse = {
  error: Error
}

const DELETE_ERROR = gql`
  mutation DeleteError($id: ID!) {
    error: deleteError(id: $id) {
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
  const { handleGQLError } = useAppError();
  const [deleteErrorId, setDeleteErrorId] = useState<number | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

  const { loading, data } = useQuery<GetErrorDetailsResponse>(GET_ERROR_DETAILS, {
    variables: {
      id: errorId
    },
    onError: handleGQLError
  });

  const [deleteError, { loading: deleteErrorIsLoading }] = useMutation<DeleteErrorResponse>(DELETE_ERROR, { onError: handleGQLError });

  const openDeleteErrorModal = (id: number) => {
    setDeleteErrorId(id);
  }

  const closeDeleteErrorModal = () => {
    setDeleteErrorId(null);
  }

  const handleDeleteError = async (id: number) => {
    await deleteError({
      variables: {
        id: id
      }
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
          loading={deleteErrorIsLoading}
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