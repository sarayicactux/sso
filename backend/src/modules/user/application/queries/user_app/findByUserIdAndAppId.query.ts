export class FindUserAppByUserIdAndAppIdQuery {
  constructor(
    public readonly userId: number,
    public readonly appId: number,
  ) {}
}
