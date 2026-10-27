export class DeleteUserAppCommand {
  constructor(
    public readonly userId: number,
    public readonly appId: number,
  ) {}
}
