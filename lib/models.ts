import Parse from './parseClient';

// Image class
export class EroImage extends Parse.Object {
  constructor() {
    super('EroImage');
  }

  get file(): Parse.File {
    return this.get('file');
  }

  set file(value: Parse.File) {
    this.set('file', value);
  }

  get uploader(): Parse.User {
    return this.get('uploader');
  }

  set uploader(value: Parse.User) {
    this.set('uploader', value);
  }

  get yesCount(): number {
    return this.get('yesCount') || 0;
  }

  set yesCount(value: number) {
    this.set('yesCount', value);
  }

  get noCount(): number {
    return this.get('noCount') || 0;
  }

  set noCount(value: number) {
    this.set('noCount', value);
  }

  get totalVotes(): number {
    return this.yesCount + this.noCount;
  }

  get yesPercentage(): number {
    return this.totalVotes > 0 ? Math.round((this.yesCount / this.totalVotes) * 100) : 0;
  }
}

// Vote class
export class Vote extends Parse.Object {
  constructor() {
    super('Vote');
  }

  get image(): EroImage {
    return this.get('image');
  }

  set image(value: EroImage) {
    this.set('image', value);
  }

  get user(): Parse.User {
    return this.get('user');
  }

  set user(value: Parse.User) {
    this.set('user', value);
  }

  get answer(): boolean {
    return this.get('answer');
  }

  set answer(value: boolean) {
    this.set('answer', value);
  }
}

// Register the classes
Parse.Object.registerSubclass('EroImage', EroImage);
Parse.Object.registerSubclass('Vote', Vote);

export { Parse };
