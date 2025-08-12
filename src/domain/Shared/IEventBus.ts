import { GuionEventMsg } from "../GuionContext/GuionEvent";
import { IDomainEvent } from "./IDomainEvent";
import { IEventHandler } from "./IEventHandler";

export interface IEventBus {
    send(msg: GuionEventMsg): Promise<void>;
}