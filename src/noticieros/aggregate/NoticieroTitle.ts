import { NoticieroDate } from "./NoticieroDate";

export class NoticieroTitle {

  private static readonly MIN_LENGTH = 5;
  private static readonly MAX_LENGTH = 100;
  private static readonly DEFAULT_TITLE = "Noticiero Finsus"

  private constructor(private readonly _value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('NoticieroTitle no puede estar vacio');
    }

    if (value.trim().length < NoticieroTitle.MIN_LENGTH) {
      throw new Error(`NoticieroTitle de tener al menos ${NoticieroTitle.MIN_LENGTH} caracteres.`);
    }

    if (value.trim().length > NoticieroTitle.MAX_LENGTH) {
      throw new Error(`NoticieroTitle no puede exceder ${NoticieroTitle.MAX_LENGTH} caracteres`);
    }

    this._value = value.trim();
  }

  public get value(): string {
    return this._value;
  }

  public static default(): NoticieroTitle {
    const title = this.DEFAULT_TITLE + " - " + NoticieroDate.now().toLocaleDateString()
    return new NoticieroTitle(title);
  }

  public static of(value: string): NoticieroTitle {
    return new NoticieroTitle(value)
  }

  public get(): string {
    return this.value;
  }
}
