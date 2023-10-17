import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe('AuthService', () => {
  let service: AuthService
  let fakeUserService: Partial<UsersService>

  beforeEach(async () => {
    // Fake object of the users service
    const users: User[] = []
    fakeUserService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email)
        return Promise.resolve(filteredUsers)
      },
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 99999), email, password } as User
        users.push(user)
        return Promise.resolve(user)
      }
    }

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService
        }]
    }).compile();

    service = module.get(AuthService)
  })

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  })

  it('creates a new user with a salted and hased pass', async () => {
    const user = await service.signup('asdasd@asdasd.com', 'asdf')
    expect(user.password).not.toEqual('asdf')
    const [salt, hash] = user.password.split('.')
    expect(salt).toBeDefined()
    expect(hash).toBeDefined()
  })

  it('throws an error if user signs up with email that is in use', async () => {
    fakeUserService.find = () => Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws error if an invalid password is provided', async () => {
    await service.signup('asdf@asdf.com', 'tetas')


    await expect(
      service.signin('asdf@asdf.com', 'asd')
    ).rejects.toThrow(BadRequestException)

  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'tetas')
    const user = await service.signin('asdf@asdf.com', 'tetas')
  })
})
