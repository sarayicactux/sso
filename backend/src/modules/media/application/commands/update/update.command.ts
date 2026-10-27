export class UpdateMediaOwnerCommand {
  constructor(
    public readonly ownerId: number,
    public readonly ownerModel: string,
    public readonly id: number,
  ) {}
}
