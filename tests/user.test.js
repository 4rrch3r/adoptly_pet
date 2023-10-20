const supertest = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../src/app').app;
const setupTestDB = require('../src/utils/setupTestDB');
const  jwtWriteTokenExample  = process.env.JWT_TOKEN_WITH_WRITE_ROLE_EXAMPLE;
const jwtReadTokenExample = process.env.JWT_TOKEN_WITH_READ_ROLE_EXAMPLE;
const jwtWrongTokenExample = process.env.JWT_TOKEN_WITH_WRONG_ROLE_EXAMPLE;
const jwtReadTokenNotActivatedExample = process.env.JWT_TOKEN_WITH_READ_ROLE_NOT_ACTIVATED_EXAMPLE;

setupTestDB();

describe('User routes', () => {
  
  describe('POST /adoptly/users/', () => {
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
        .post(`/adoptly/users/`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
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
      expect(res.body.activationLink).toBeNull()
    });
    test('should return a 400 if some of the required fields are missing', async () => {
      await supertest(app)
         .post(`/adoptly/users/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send({
           name:newUser.name,
           favorites:newUser.favorites,
           address:newUser.address,
         })
         .expect(400);
     });
     test('should return a 400 if phoneNumber or email value is not unique', async () => {
      await supertest(app)
         .post(`/adoptly/users/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send(newUser)
         .expect(201);
         await supertest(app)
         .post(`/adoptly/users/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send(newUser)
         .expect(400);
     });
     test('should return a 400 if rights field is not enum value', async () => {
      await supertest(app)
         .post(`/adoptly/users/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send({
           ...newUser,
           rights:'wrongRights',
         })
         .expect(400);
     });
    test('should return a 401 if something is wrong with access token', async () => {
     await supertest(app)
        .post(`/adoptly/users/`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample}+1;`])
        .send(newUser)
        .expect(401);
    });
    test('should return a 403 if something is wrong with your token rights', async () => {
     await supertest(app)
        .post(`/adoptly/users/`)
        .set('Cookie', [`access_token=${jwtWrongTokenExample};`])
        .send(newUser)
        .expect(403);
    });
  });
  describe('GET /adoptly/users/', () => {
    test('should return a 200', async () => {
      const res = await supertest(app)
        .get(`/adoptly/users/`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
        .expect('Content-Type', /json/)
        .expect(200);
        expect(res.body.length).toEqual(0);
    });
    test('should return a 401 if something is wrong with access token', async () => {
      await supertest(app)
         .get(`/adoptly/users/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample}+1;`])
         .expect(401);
     });
     test('should return a 403 if something is wrong with your token rights', async () => {
      await supertest(app)
         .get(`/adoptly/users/`)
         .set('Cookie', [`access_token=${jwtWrongTokenExample};`])
         .expect(403);
     });
   });
  describe('GET /adoptly/users/:id', () => {
   let newUser;
   let userResponse;
    beforeEach(async () => {
      newUser = {
        name: faker.person.firstName(),
        email:faker.internet.email(),
        phoneNumber:faker.phone.number(),
        password:faker.internet.password(),
        rights:'write',
        address:faker.location.streetAddress(),
      };
      userResponse= await supertest(app)
        .post(`/adoptly/users/`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);
      
    });
    test('should return a 200', async () => {
      const res = await supertest(app)
        .get(`/adoptly/users/${userResponse.body.id}`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
        .expect('Content-Type', /json/)
        .expect(200);
        
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
      expect(res.body.activationLink).toBeNull()
    });
    test('should return a 401 if something is wrong with access token', async () => {
      await supertest(app)
         .get(`/adoptly/users/${userResponse.body.id}`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample}+1;`])
         .expect(401);
     });
     test('should return a 403 if something is wrong with your token rights', async () => {
      await supertest(app)
         .get(`/adoptly/users/${userResponse.body.id}`)
         .set('Cookie', [`access_token=${jwtWrongTokenExample};`])
         .expect(403);
     });
     test('should return a 403 if your account is not activated', async () => {
      await supertest(app)
       .get(`/adoptly/users/${userResponse.body.id}`)
       .set('Cookie', [`access_token=${jwtReadTokenNotActivatedExample};`])
       .expect('Content-Type', /json/)
       .expect(403);
 });
     test("should return a 404 if you have a read rights but you want to get info about other user", async () => {
      await supertest(app)
      .get(`/adoptly/users/${userResponse.body.id}`)
      .set('Cookie', [`access_token=${jwtReadTokenExample};`])
      .expect(404);
    });
    test("should return a 404 if user wasn't found", async () => {
      let randomId = (userResponse.body.id.slice(0,23)+'1')!=userResponse.body.id?(userResponse.body.id.slice(0,23)+'1'):(userResponse.body.id.slice(0,23)+'2')
      await supertest(app)
        .get(`/adoptly/user/${randomId}`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
        .expect(404);
    });
  });
  describe('PUT /adoptly/users/:id', () => {
    let user;
    let userResponse;
    let newUser;
     beforeEach(async () => {
       user = {
        name: faker.person.firstName(),
        email:faker.internet.email(),
        phoneNumber:faker.phone.number(),
        password:faker.internet.password(),
        rights:'write',
        address:faker.location.streetAddress(),
       };
       userResponse= await supertest(app)
        .post(`/adoptly/users/`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
        .send(user)
        .expect('Content-Type', /json/)
        .expect(201);

         newUser = {
          name: faker.person.firstName(),
          email:faker.internet.email(),
          phoneNumber:faker.phone.number(),
          password:faker.internet.password(),
          rights:'write',
          address:faker.location.streetAddress(),
        }
     });
     test('should return a 200', async () => {
       const res = await supertest(app)
         .put(`/adoptly/users/${userResponse.body.id}`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send(newUser)
         .expect('Content-Type', /json/)
         .expect(200);
         
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
      expect(res.body.activationLink).toBeNull()
      expect(res.body.id).toBe(userResponse.body.id);
     });
     test('should return a 400 if phoneNumber or email value is not unique', async () => {
    let res= await supertest(app)
         .post(`/adoptly/users/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send(newUser)
         .expect(201);
         await supertest(app)
         .put(`/adoptly/users/${res.body.id}`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send({phoneNumber:user.phoneNumber})
         .expect(400);
     });
     test('should return a 400 if rights field is not enum value', async () => {
      await supertest(app)
         .put(`/adoptly/users/${userResponse.body.id}`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send({
           rights:'wrongRights',
         })
         .expect(400);
     });
    test('should return a 401 if something is wrong with access token', async () => {
         await supertest(app)
          .put(`/adoptly/users/${userResponse.body.id}`)
          .set('Cookie', [`access_token=${jwtReadTokenExample}+1;`])
          .send(newUser)
          .expect('Content-Type', /json/)
          .expect(401);
    });
    test('should return a 403 if something is wrong with your token rights', async () => {
         await supertest(app)
          .put(`/adoptly/users/${userResponse.body.id}`)
          .set('Cookie', [`access_token=${jwtWrongTokenExample};`])
          .send(newUser)
          .expect('Content-Type', /json/)
          .expect(403);
    });
    test('should return a 403 if your account is not activated', async () => {
      await supertest(app)
       .put(`/adoptly/users/${userResponse.body.id}`)
       .set('Cookie', [`access_token=${jwtReadTokenNotActivatedExample};`])
       .send(newUser)
       .expect('Content-Type', /json/)
       .expect(403);
 });
    test("should return a 404 if you have a read rights but you want to get info about other user", async () => {
    await supertest(app)
    .put(`/adoptly/users/${userResponse.body.id}`)
    .set('Cookie', [`access_token=${jwtReadTokenExample};`])
    .send(newUser)
    .expect(404);
  });
     test("should return a 404 if user wasn't found", async () => {
       let randomId = (userResponse.body.id.slice(0,23)+'1')!=userResponse.body.id?(userResponse.body.id.slice(0,23)+'1'):(userResponse.body.id.slice(0,23)+'2')
        await supertest(app)
         .put(`/adoptly/users/${randomId}`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send(newUser)
         .expect(404);
   });
  });
  describe('DELETE /adoptly/users/:id', () => {
    let user;
    let userResponse;
     beforeEach(async () => {
       user = {
        name: faker.person.firstName(),
        email:faker.internet.email(),
        phoneNumber:faker.phone.number(),
        password:faker.internet.password(),
        rights:'write',
        address:faker.location.streetAddress(),
       };
       userResponse= await supertest(app)
         .post(`/adoptly/users/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send(user)
         .expect('Content-Type', /json/)
         .expect(201);
       
     });
     test('should return a 204', async () => {
        await supertest(app)
         .delete(`/adoptly/users/${userResponse.body.id}`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .expect(204);
     });
    test('should return a 401 if something is wrong with access token', async () => {
        await supertest(app)
        .delete(`/adoptly/users/${userResponse.body.id}`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample}+1;`])
        .expect(401);
    });
    test('should return a 403 if something is wrong with your token rights', async () => {
        await supertest(app)
        .delete(`/adoptly/users/${userResponse.body.id}`)
        .set('Cookie', [`access_token=${jwtWrongTokenExample};`])
        .expect(403);
    });
     test("should return a 404 if user wasn't found", async () => {
       let randomId = (userResponse.body.id.slice(0,23)+'1')!=userResponse.body.id?(userResponse.body.id.slice(0,23)+'1'):(userResponse.body.id.slice(0,23)+'2')
       await supertest(app)
       .delete(`/adoptly/users/${randomId}`)
       .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
       .expect(404);
   });
   });

});
