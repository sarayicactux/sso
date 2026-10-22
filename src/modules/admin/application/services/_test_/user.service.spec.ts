// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { UserService } from '../user.service';
import { UserMapper } from '../../../infrastructure/mappers/user.mapper';
import { Jwt } from '../../../../../shared/helpers/jwt.helper';
import { Tools } from '../../../../../shared/helpers/tools.helper';

import { UserStatus } from '../../../domain/enums/userStatus.enum';

// Mock data
const mappedUser = {
  id: 1,
  username: 'newuser',
  mobile: '09123456789',
  email: 'new@example.com',
  password: '$2a$10$hashedpassword',
  isActive: UserStatus.Active,
  firstName: 'New',
  lastName: 'User',
  roleId: 1,
  Role: null,
  access_token: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRegisterDto = {
  username: 'newuser',
  mobile: '09123456780',
  email: 'new@example.com',
  password: 'password123',
  firstName: 'New',
  lastName: 'User',
  roleId: 1,
};

const mockLoginDto = {
  mobile: '09123456789',
  password: 'password123',
  fireBaseToken: 'firebase-token',
};
const ip = '1.1.1.1';
const mockToken = 'DFG$%Fnb5fg#$dg&gDFG4e4fg%$4567rgf33245fdfgd';
const adminId = 2;
describe('UserService', () => {
  let service: UserService;
  let commandBus: Partial<Record<keyof CommandBus, jest.Mock>>;
  let queryBus: Partial<Record<keyof QueryBus, jest.Mock>>;
  let jwt: Partial<Record<keyof Jwt, jest.Mock>>;
  let tools: Partial<Record<keyof Tools, jest.Mock>>;
  let userMapper: jest.Mocked<UserMapper>;

  userMapper = {
    userObject: jest.fn(),
  };

  jwt = {
    signer: jest.fn(),
    verifier: jest.fn(),
  };
  tools = {
    sendSmsCode: jest.fn(),
    codeCreator: jest.fn(),
    saveLogs: jest.fn(),
  };
  commandBus = {
    execute: jest.fn(),
  };

  queryBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserMapper, useValue: userMapper },
        { provide: Jwt, useValue: jwt },
        { provide: Tools, useValue: tools },
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  // ===================== register tests =======================
  it('new user registered', async () => {
    jest
      .spyOn(queryBus, 'execute')
      .mockResolvedValueOnce(null) // mobile check
      .mockResolvedValueOnce(null) // username check
      .mockResolvedValueOnce(null); // email check
    jest
      .spyOn(bcrypt, 'hash')
      .mockResolvedValue(mockRegisterDto.password as never);
    jest.spyOn(commandBus, 'execute').mockResolvedValue(mockRegisterDto);
    jest.spyOn(userMapper, 'userObject').mockReturnValue(mappedUser);
    const result = await service.register(adminId, mockRegisterDto);
    expect(result).toEqual(mappedUser);
    expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
    expect(commandBus.execute).toHaveBeenCalled();
  });
  it('should throw error if mobile already exists', async () => {
    // Mock data

    const mockRegisterDtoDupMobile = {
      username: 'newuser',
      mobile: '09123456780',
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      roleId: 1,
    };
    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mappedUser); // mobile check

    await expect(
      service.register(adminId, mockRegisterDtoDupMobile),
    ).rejects.toBeInstanceOf(HttpException);
    try {
      await service.register(adminId, mockRegisterDtoDupMobile);
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.CONFLICT);
      expect((e as HttpException).getResponse()).toEqual(
        expect.objectContaining({ error: 'شماره موبایل تکراری است' }),
      );
    }
  });
  it('should throw error if username already exists', async () => {
    // Mock data

    const mockRegisterDtoDupUsername = {
      username: 'newuser',
      mobile: '09123456780',
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      roleId: 1,
    };
    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mappedUser); // mobile check

    await expect(
      service.register(adminId, mockRegisterDtoDupUsername),
    ).rejects.toBeInstanceOf(HttpException);
    try {
      await service.register(adminId, mockRegisterDtoDupUsername);
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.CONFLICT);
      expect((e as HttpException).getResponse()).toEqual(
        expect.objectContaining({ error: 'نام کاربری تکراری است' }),
      );
    }
  });
  it('should throw error if username already exists', async () => {
    // Mock data

    const mockRegisterDtoDupEmail = {
      username: 'newuser',
      mobile: '09123456780',
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      roleId: 1,
    };
    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mappedUser); // mobile check

    await expect(
      service.register(adminId, mockRegisterDtoDupEmail),
    ).rejects.toBeInstanceOf(HttpException);
    try {
      await service.register(adminId, mockRegisterDtoDupEmail);
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.CONFLICT);
      expect((e as HttpException).getResponse()).toEqual(
        expect.objectContaining({ error: 'ایمیل  تکراری است' }),
      );
    }
  });
  // ===================== login tests =======================
  it('should login successfully with correct mobile and password', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValue(mappedUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    jest.spyOn(jwt, 'signer').mockReturnValue(mockToken);
    jest.spyOn(commandBus, 'execute').mockResolvedValue(true);
    jest.spyOn(userMapper, 'userObject').mockReturnValue(mappedUser);
    const result = await service.login(mockLoginDto, ip);
    expect(result).toEqual(mappedUser);
    expect(jwt.signer).toHaveBeenCalledWith(
      { adminId: mappedUser.id, mobile: mappedUser.mobile },
      86400 * 30,
    );
  });
  it('should throw HttpException if user not found', async () => {
    const mockLoginDto = {
      mobile: '09182586598',
      password: '123456',
    };

    jest.spyOn(queryBus, 'execute').mockResolvedValue(null);

    await expect(service.login(mockLoginDto, ip)).rejects.toBeInstanceOf(
      HttpException,
    );
    try {
      await service.login(mockLoginDto, ip);
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect((e as HttpException).getResponse()).toEqual(
        expect.objectContaining({ error: 'اطلاعات ورود نا معتبر است' }),
      );
    }
  });
  it('should throw HttpException if user status in not Active', async () => {
    const mockLoginDto = {
      mobile: '09182586598',
      password: '123456',
    };

    const fakeUser = {
      id: 42,
      mobile: '09182586598',
      password: 'asd@#$sdf',
      isActive: UserStatus.Inactive,
    };

    jest.spyOn(queryBus, 'execute').mockResolvedValue(fakeUser);

    await expect(service.login(mockLoginDto, ip)).rejects.toBeInstanceOf(
      HttpException,
    );
    try {
      await service.login(mockLoginDto, ip);
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect((e as HttpException).getResponse()).toEqual(
        expect.objectContaining({ error: 'اطلاعات ورود نا معتبر است' }),
      );
    }
  });
  it('should throw HttpException if mobile is correct but password is wrong', async () => {
    const mockLoginDto = {
      username: 'mobile',
      password: 'wrongPassword',
    };

    const fakeUser = {
      id: 42,
      username: 'mobile',
      password: 'asd@#$sdf',
      isActive: UserStatus.Active,
    };

    jest.spyOn(queryBus, 'execute').mockResolvedValue(fakeUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(service.login(mockLoginDto, ip)).rejects.toBeInstanceOf(
      HttpException,
    );
    try {
      await service.login(mockLoginDto, ip);
    } catch (e) {
      expect((e as HttpException).getStatus()).toBe(HttpStatus.FORBIDDEN);
      expect((e as HttpException).getResponse()).toEqual(
        expect.objectContaining({ error: 'اطلاعات ورود نا معتبر است' }),
      );
    }
  });
});
