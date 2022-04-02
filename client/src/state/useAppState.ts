import React, { Dispatch } from "react";
import { AppStateContext } from "./AppStateContext";
import { AppState, Action } from "./appStateReducer";

function useAppState(): {state: AppState, dispatch: Dispatch<Action>} {
    const { state, dispatch } = React.useContext(AppStateContext);
    return {state, dispatch};
}

export default useAppState;