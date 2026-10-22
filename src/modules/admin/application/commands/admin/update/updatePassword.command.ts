export class UpdatePasswordCommand {
  constructor(
    public readonly password: string,
    public readonly id: number,
  ) {}
}
