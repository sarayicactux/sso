export interface UpdateUserTokenPublicKeyInterface {
  /** When set, update this token row directly (preferred for consume/clear). */
  id?: number;
  /** When id is omitted, update the latest token for this user. */
  userId?: number;
  publicKey: string;
}
