import { ApolloError } from "@apollo/client";
import ErrorPage from "../shared/ErrorPage";

export function handleGqlError(error: ApolloError, notFoundMessage?: string) {
    if (error.graphQLErrors[0].extensions.status === 404) {
        return <ErrorPage type="NOT FOUND" message={notFoundMessage || "The requested resource does not exist."} />
    }
    else {
        return <ErrorPage type="ERROR" />
    }
}