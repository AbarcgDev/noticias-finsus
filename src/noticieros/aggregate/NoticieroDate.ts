export class NoticieroDate {
  private constructor(private readonly value: Date) {

  }

  public static now(): NoticieroDate {
    return new NoticieroDate(new Date());
  }

  public static of(value: Date) {
    return new NoticieroDate(value)
  }

  public get(): Date {
    return this.value
  }

  public toLocaleDateString(): string {
    const formater = new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Mexico_City'
    });
    return formater.format(this.value)
  }
}
