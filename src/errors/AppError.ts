export default class AppError extends Error {
  code: number;
  constructor(message: string, name: string, code: number) {
    super(message);
    this.name = name;
    this.code = code;
  }
}
