import AllErrors from "./AllErrors";
import ErrorDetail from "./ErrorDetail";

export type Error = {
  error_id: number
  error_message: string
  error_stack: string
  error_tstz: string
  evaluator_id: number
  request_origin: string
  request_referer: string
  user_agent: string
}


export { AllErrors, ErrorDetail };