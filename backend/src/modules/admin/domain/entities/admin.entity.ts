export class Admin {
  readonly id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  constructor(data: {
    id?: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    password?: string;
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
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.deletedAt = data.deletedAt || null;
  }
}
