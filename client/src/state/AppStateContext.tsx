import React, { Dispatch, createContext, useEffect } from "react";
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

  useEffect(() => {
    fetch("/api/internal/users/getFullUserProfile")
    .then(response => response.json())
    .then(data => {
      dispatch(login(data))
    });

  }, []);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  )
}