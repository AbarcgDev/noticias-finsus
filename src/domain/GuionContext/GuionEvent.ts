import { Guion } from "./Guion"

export enum GuionEvent {
  Created = "guion.created",
  Udated = "guion.updated",
  Validated = "guion.validated",
  Queued = "guion.queued"
}

export interface GuionEventMsg {
  action: GuionEvent
  data: Guion
}
