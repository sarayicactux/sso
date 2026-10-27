export class FindAppUserByUserIdAndAppIdQuery {
  constructor(
    public readonly userId: number,
    public readonly appId: number,
  ) {}
}
