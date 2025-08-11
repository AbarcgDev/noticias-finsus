import { Guion } from "./Guion"

export interface GuionEvent {
  action: "guion.created" | "guion.updated" | "guion.validated"
  data: Guion
}
