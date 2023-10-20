const supertest = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../src/app').app;
const setupTestDB = require('../src/utils/setupTestDB');

setupTestDB();

describe('Authorization routes', () => {
describe('Register /adoptly/auth/register', () => {
            let newUser;
            beforeEach(() => {
              newUser = {
                name: faker.person.firstName(),
                email:faker.internet.email(),
                phoneNumber:faker.phone.number(),
                password:faker.internet.password(),
                rights:'write',
                address:faker.location.streetAddress(),
              };
            });
            test('should return a 201', async () => {
              const res = await supertest(app)
                .post(`/adoptly/auth/register`)
                .send(newUser)
                .expect('Content-Type', /json/)
                .expect(201);
              const expectedProperties = ['id','name', 'email', 'phoneNumber', 'password', 'rights', 'address', 'isActivated','activationLink','favorites'];
              for (const property of expectedProperties) {
                expect(res.body).toHaveProperty(property);
              }
              expect({
                name:res.body.name,
                email:res.body.email,
                phoneNumber:res.body.phoneNumber,
                password:res.body.password,
                rights:res.body.rights,
                address:res.body.address,
              }).toMatchObject({...newUser,password:res.body.password});
              expect(res.body.isActivated).toBeFalsy();
              expect(res.body.rights).toBe("write");
              expect(res.body.favorites).toStrictEqual([])
              expect(res.body.activationLink).toBeDefined()
            });
            test('should return a 400 if some of the required fields are missing', async () => {
                await supertest(app)
                   .post(`/adoptly/auth/register`)
                   .send({
                     name:newUser.name,
                     favorites:newUser.favorites,
                     address:newUser.address,
                   })
                   .expect(400);
            });
            test('should return a 400 if phoneNumber or email value is not unique', async () => {
            await supertest(app)
                .post(`/adoptly/auth/register`)
                .send(newUser)
                .expect(201);
                await supertest(app)
                .post(`/adoptly/auth/register`)
                .send(newUser)
                .expect(400);
            });
            test('should return a 400 if rights field is not enum value', async () => {
            await supertest(app)
                .post(`/adoptly/auth/register`)
                .send({
                    ...newUser,
                    rights:'wrongRights',
                })
                .expect(400);
            });
    });
describe('Login /adoptly/auth/login', () => {
        let newUser;
        beforeEach(async() => {
          newUser = {
            name: faker.person.firstName(),
            email:faker.internet.email(),
            phoneNumber:faker.phone.number(),
            password:faker.internet.password(),
            rights:'write',
            address:faker.location.streetAddress(),
          };
          userResponse= await supertest(app)
          .post(`/adoptly/auth/register`)
          .send(newUser)
          .expect('Content-Type', /json/)
          .expect(201);
          });
        test('should return a 200', async () => {
          const res = await supertest(app)
            .post(`/adoptly/auth/login`)
            .send({email:newUser.email,password:newUser.password})
            .expect('Content-Type', /json/)
            .expect(200);
            expect(Object.keys(res.header)).toContain('set-cookie');
            expect(res.header['set-cookie'][0].split('=')[0]).toBe('access_token')
        });
        test('should return a 400 if some of the required fields are missing', async () => {
            await supertest(app)
               .post(`/adoptly/auth/login`)
               .send({email:newUser.email})
               .expect(400);
        });
        test('should return a 401 if password was not correct', async () => {
            await supertest(app)
               .post(`/adoptly/auth/login`)
               .send({email:newUser.email,password:newUser.password+'random'})
               .expect(401);
        });
        test('should return a 404 if user was not found by email', async () => {
            await supertest(app)
               .post(`/adoptly/auth/login`)
               .send({email:newUser.email+'random',password:newUser.password})
               .expect(404);
        });
});
describe('Logout /adoptly/auth/logout', () => {
    test('should return a 200', async () => {
      const res = await supertest(app)
        .get(`/adoptly/auth/logout`)
        .expect('Content-Type', /json/)
        .expect(200);
        expect(Object.keys(res.header)).toContain('set-cookie');
        expect(res.header['set-cookie'][0].split('access_token=')[1][0]).toBe(';')
    });
   
});
describe('Activate /adoptly/auth/:activationLink', () => {
    let newUser;
        beforeEach(async() => {
          newUser = {
            name: faker.person.firstName(),
            email:faker.internet.email(),
            phoneNumber:faker.phone.number(),
            password:faker.internet.password(),
            rights:'write',
            address:faker.location.streetAddress(),
          };
            userResponse= await supertest(app)
            .post(`/adoptly/auth/register`)
            .send(newUser)
            .expect('Content-Type', /json/)
            .expect(201);
            });
    test('should return a 302', async () => {
         await supertest(app)
        .get(`/adoptly/auth/activate/${userResponse.body.activationLink}`)
        .expect('Content-Type','text/plain; charset=utf-8')
        .expect(302);
    });
    test('should return a 404 if user was not found by activationLink', async () => {
          await supertest(app)
          .get(`/adoptly/auth/activate/${userResponse.body.activationLink}123`)
          .expect('Content-Type', /json/)
          .expect(404);
      });
   
});
});