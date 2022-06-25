import React, { Dispatch, createContext, useEffect, useState } from "react";
import LoadingSpinner from "../shared/LoadingSpinner";
import { reducer, initialState, AppState, Action, login } from "./appStateReducer";
import { fetchAppState } from "./fetchAppState";

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
    fetchAppState()
      .then((d) => {
        const data = d.data.currentUser;

        dispatch(login({
          user: data.user ? {...data.user, evaluator_id: data.user?.id} : null,
          loggedIn: data.loggedIn,
          isAdmin: data.isAdmin,
          isImpersonated: data.isImpersonated,
          originKaid: data.originKaid,
          logged_in: data.loggedIn,
          is_admin: data.isAdmin,
          is_impersonated: data.isImpersonated,
          origin_kaid: data.originKaid,
        }));
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