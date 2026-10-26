export class UpdateUserPasswordCommand {
  constructor(
    public readonly password: string,
    public readonly id: number,
  ) {}
}
