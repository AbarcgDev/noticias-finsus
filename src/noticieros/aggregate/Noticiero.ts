import { NoticieroDate } from "./NoticieroDate";
import { NoticieroId } from "./NoticieroId";
import { NoticieroTitle } from "./NoticieroTitle";

export class Noticiero {
  constructor(
    private readonly _id: NoticieroId,
    private readonly _title: NoticieroTitle,
    private readonly _guion: NoticieroGuion,
    private readonly _state: NoticieroState,
    private readonly _updatedAt: NoticieroDate,
    private readonly _wavAudioId: NoticieroWavAudioId,
    private readonly _mp3AudioId: NoticieroMp3AudioId,
    private readonly _publicationDate: NoticieroDate,
    private readonly _aprovedBy: NoticieroAdminName,
  ) { }

  public get aprovedBy(): NoticieroAdminName {
    return this._aprovedBy;
  }
  public get publicationDate(): NoticieroDate {
    return this._publicationDate;
  }
  public get mp3AudioId(): NoticieroMp3AudioId {
    return this._mp3AudioId;
  }
  public get wavAudioId(): NoticieroWavAudioId {
    return this._wavAudioId;
  }
  public get updatedAt(): NoticieroDate {
    return this._updatedAt;
  }
  public get state(): NoticieroState {
    return this._state;
  }
  public get title(): NoticieroTitle {
    return this._title;
  }
  public get id(): NoticieroId {
    return this._id;
  }
  public get guion(): NoticieroGuion {
    return this._guion;
  }
}
