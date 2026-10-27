export class DeleteAppUserCommand {
  constructor(
    public readonly userId: number,
    public readonly appId: number,
  ) {}
}
