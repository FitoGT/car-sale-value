import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) { }

  async signup(email: string, password: string) {
    // see if email if in use
    const user = await this.userService.find(email)
    if (user.length) {
      throw new BadRequestException('email in use');
    }
    // hash user password
    // generate a salt
    const salt = randomBytes(8).toString('hex');

    // hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer

    // join the hashed result and the salt together and save it
    const result = salt + '.' + hash.toString('hex');

    // create a new user and save it
    const createdUser = await this.userService.create(email, result)
    return createdUser
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email)
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Bad password')
    }

    return user;
  }
}