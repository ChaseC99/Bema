import React, { Dispatch, createContext, useEffect, useState } from "react";
import LoadingSpinner from "../shared/LoadingSpinner";
import { reducer, initialState, AppState, Action, login } from "./appStateReducer";

type AppStateContextProps = {
  state: AppState
  dispatch: Dispatch<Action>
}

type AppStateProviderProps = {
  children: React.ReactNode;
}

export const AppStateContext = createContext<AppStateContextProps>(
  {} as AppStateContextProps
)

export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/internal/users/getFullUserProfile")
    .then(response => response.json())
    .then(data => {
      dispatch(login(data));
      setIsLoading(false);
    });

  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner size="LARGE" />
    );
  }
  
  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  )
}