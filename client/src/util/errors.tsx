import { ApolloError } from "@apollo/client";
import React from "react";
import { createContext, Dispatch, Reducer } from "react";

export type AppError = {
  type: "NOT FOUND" | "ERROR"
  message?: string
}

type Action = {
  type: "SET_GQL_ERROR" | "CLEAR_ERROR"
  payload?: ApolloError
}

type AppErrorContextProps = {
  error: AppError | null
  dispatch: Dispatch<Action>
}

type AppErrorProviderProps = {
  children: React.ReactNode;
}

export const reducer: Reducer<AppError | null, Action> = (state: AppError | null, action: Action): AppError | null => {
  switch (action.type) {
    case "SET_GQL_ERROR": {
      if (!action.payload) {
        return null;
      }

      if (action.payload?.graphQLErrors.length > 0 && action.payload?.graphQLErrors[0].extensions.status === 404) {
        return {
          type: "NOT FOUND",
          message: action.payload?.graphQLErrors[0].message || "The requested resource does not exist."
        };
      }
      else {
        return {
          type: "ERROR",
        };
      }
    }
    default:
      return null
  }
}

export function setGQLError(error: ApolloError): Action {
  return {
    type: "SET_GQL_ERROR",
    payload: error
  }
}

export function clearError(): Action {
  return {
    type: "CLEAR_ERROR"
  }
}

export const AppErrorContext = createContext<AppErrorContextProps>(
  {} as AppErrorContextProps
)

export const AppErrorProvider = ({ children }: AppErrorProviderProps) => {
  const [error, dispatch] = React.useReducer(reducer, null);

  return (
    <AppErrorContext.Provider value={{ error, dispatch }}>
      {children}
    </AppErrorContext.Provider>
  )
}

export default function useAppError(): {error: AppError | null, dispatch: Dispatch<Action>, handleGQLError: (error: ApolloError) => void} {
  const { error, dispatch } = React.useContext(AppErrorContext);

  const handleGQLError = (error: ApolloError) => {
    dispatch(setGQLError(error));
  }

  return { error, dispatch, handleGQLError };
}