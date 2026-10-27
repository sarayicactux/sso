export class User {
  readonly id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password?: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(data: {
    id?: number;
    username: string;
    firstName?: string;
    lastName?: string;
    email: string;
    mobile: string;
    password?: string;
    status?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }) {
    this.id = data.id;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.mobile = data.mobile;
    this.password = data.password;
    this.status = data.status !== false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deletedAt = data.deletedAt || null;
  }

  /** Works with Prisma plain rows and class instances. */
  static canAuthenticate(user: {
    status?: boolean;
    deletedAt?: Date | null;
  }): boolean {
    return user.deletedAt == null && user.status !== false;
  }

  /** Works with Prisma plain rows and class instances. */
  static canGrantAppAccess(user: {
    status?: boolean;
    deletedAt?: Date | null;
  }): boolean {
    return user.deletedAt == null && user.status !== false;
  }

  canAuthenticate(): boolean {
    return User.canAuthenticate(this);
  }

  canGrantAppAccess(): boolean {
    return User.canGrantAppAccess(this);
  }
}
