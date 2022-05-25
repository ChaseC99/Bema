import { useState } from "react";

export function displayError(error: string) {
    // TODO
}

export function useAppError() {
    const [error, setError] = useState<string | Error | null>(null);
    
    return [error, setError];
}