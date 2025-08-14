import { IDomainEvent } from "./IDomainEvent";

export interface IEventHandler {
    handle(event: IDomainEvent): Promise<void>
}