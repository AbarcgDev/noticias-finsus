

export class Noticiero {
    constructor(
        public readonly id: string = crypto.randomUUID(),
        public title: string,
        public transcript: string,
        public wavAudioId: string,
        public readonly publication_date: Date = new Date()
    ) { }
}