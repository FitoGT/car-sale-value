import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Handles a signup request', async () => {
    const userEmail = 'test@pass.com'
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: userEmail,
        password: 'asdas'
      })
      .expect(201)
      .then((response) => {
        const { id, email } = response.body
        expect(id).toBeDefined()
        expect(email).toEqual(userEmail)
      })
  });

  it('Sign up as a new user and get the current logged user', async () => {
    const email = "asddd@asdddd.com"

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: email,
        password: 'asdas'
      })
      .expect(201)

    const cookie = res.get('Set-Cookie')

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200)

    expect(body.email).toEqual(email)
  })

});
