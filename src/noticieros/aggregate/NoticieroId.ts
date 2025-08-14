import { v4 as uuidV4, validate as validateUUID } from "uuid"


export class NoticieroId {
  private constructor(private readonly _value: string) {
    if (!validateUUID(value)) {
      throw new Error("NoticieroId debe ser un string uuid valido")
    }
  }

  public get value(): string {
    return this._value
  }


  public static generate() {
    return new NoticieroId(uuidV4())
  }

  public static of(value: string) {
    return new NoticieroId(value)
  }

  public toString() {
    return this.value
  }
}
