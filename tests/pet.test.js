const supertest = require('supertest');
const { faker } = require('@faker-js/faker');
const app = require('../src/app').app;
const setupTestDB = require('../src/utils/setupTestDB');
const  jwtWriteTokenExample  = process.env.JWT_TOKEN_WITH_WRITE_ROLE_EXAMPLE;
const jwtReadTokenExample = process.env.JWT_TOKEN_WITH_READ_ROLE_EXAMPLE;
const jwtWrongTokenExample = process.env.JWT_TOKEN_WITH_WRONG_ROLE_EXAMPLE;
const jwtReadTokenNotActivatedExample = process.env.JWT_TOKEN_WITH_READ_ROLE_NOT_ACTIVATED_EXAMPLE;

setupTestDB();

describe('Pet routes', () => {
  
  describe('POST /adoptly/pets/', () => {
    let newPet;
    beforeEach(() => {
      let petSex = faker.person.sex();
      let petSpecies = faker.animal.type();
      newPet = {
        name: faker.person.firstName(petSex),
        species:petSpecies,
        breed:`test ${petSpecies} breed`,
        age:faker.number.int({ min: 0, max: 50 }),
        sex:petSex,
        taken:faker.datatype.boolean(),
        description:faker.person.bio(),
        ownerID:null,
        imageURL:faker.image.url()
      };
    });
    test('should return a 201', async () => {
      const res = await supertest(app)
        .post(`/adoptly/pets/`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
        .send(newPet)
        .expect('Content-Type', /json/)
        .expect(201);
      const expectedProperties = ['id','name', 'species', 'breed', 'age', 'sex', 'taken', 'description', 'imageURL', 'ownerID', 'id'];
      for (const property of expectedProperties) {
        expect(res.body).toHaveProperty(property);
      }
      expect({
        name:res.body.name,
        species:res.body.species,
        breed:res.body.breed,
        age:res.body.age,
        sex:res.body.sex,
        taken:res.body.taken,
        description:res.body.description,
        ownerID:res.body.ownerID,
        imageURL:res.body.imageURL
      }).toMatchObject(newPet);
      expect(res.body.age).toBeGreaterThanOrEqual(0);
      expect(res.body.age).toBeLessThanOrEqual(50);
      expect(res.body.ownerID).toBeNull()
     // expect(res.body.houses.length).toBeGreaterThan(0);

    //   const dbStreet = await Street.findById(res.body.id);
    //   expect(dbStreet).toBeDefined();
    //   expect(dbStreet).toMatchObject({ name: newPet.name, houses: newPet.houses });
    });
    test('should return a 400 if some of the required fields are missing', async () => {
      await supertest(app)
         .post(`/adoptly/pets/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send({
           species:newPet.species,
           age:newPet.age,
           sex:newPet.sex,
         })
         .expect(400);
     });
     test('should return a 400 if age field is out of min or max values', async () => {
      await supertest(app)
         .post(`/adoptly/pets/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send({
           ...newPet,
           age:-1,
         })
         .expect(400);
     });
     test('should return a 400 if sex field is not enum value', async () => {
      await supertest(app)
         .post(`/adoptly/pets/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send({
           ...newPet,
           sex:'non-binary',
         })
         .expect(400);
     });
    test('should return a 401 if something is wrong with access token', async () => {
      //await supertest(server).post(`/v1/streets/`).set('Authorization', `Bearer randomToken123`).send(newStreet).expect(403);
     await supertest(app)
        .post(`/adoptly/pets/`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample}+1;`])
        .send(newPet)
        .expect(401);
    });
    test('should return a 403 if something is wrong with your token rights', async () => {
     await supertest(app)
        .post(`/adoptly/pets/`)
        .set('Cookie', [`access_token=${jwtWrongTokenExample};`])
        .send(newPet)
        .expect(403);
    });
  });
  describe('GET /adoptly/pets/', () => {
    test('should return a 200', async () => {
      const res = await supertest(app)
        .get(`/adoptly/pets/`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
        .expect('Content-Type', /json/)
        .expect(200);
        expect(res.body.length).toEqual(0);
    });
  });
  describe('GET /adoptly/pets/:id', () => {
   let newPet;
   let petResponse;
    beforeEach(async () => {
      let petSex = faker.person.sex();
      let petSpecies = faker.animal.type();
      newPet = {
        name: faker.person.firstName(petSex),
        species:petSpecies,
        breed:`test ${petSpecies} breed`,
        age:faker.number.int({ min: 0, max: 50 }),
        sex:petSex,
        taken:faker.datatype.boolean(),
        description:faker.person.bio(),
        ownerID:null,
        imageURL:faker.image.url()
      };
      petResponse= await supertest(app)
        .post(`/adoptly/pets/`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
        .send(newPet)
        .expect('Content-Type', /json/)
        .expect(201);
      
    });
    test('should return a 200', async () => {
      //console.log(responseBeforeEach)
      const res = await supertest(app)
        .get(`/adoptly/pets/${petResponse.body.id}`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
        .expect('Content-Type', /json/)
        .expect(200);
        
        const expectedProperties = ['id','name', 'species', 'breed', 'age', 'sex', 'taken', 'description', 'imageURL', 'ownerID', 'id'];
        for (const property of expectedProperties) {
          expect(res.body).toHaveProperty(property);
        }
        expect({
          name:res.body.name,
          species:res.body.species,
          breed:res.body.breed,
          age:res.body.age,
          sex:res.body.sex,
          taken:res.body.taken,
          description:res.body.description,
          ownerID:res.body.ownerID,
          imageURL:res.body.imageURL
        }).toMatchObject(newPet);
        expect(res.body.age).toBeGreaterThanOrEqual(0);
        expect(res.body.age).toBeLessThanOrEqual(50);
        expect(res.body.ownerID).toBeNull()
    });
    test("should return a 404 if pet wasn't found", async () => {
      let randomId = (petResponse.body.id.slice(0,23)+'1')!=petResponse.body.id?(petResponse.body.id.slice(0,23)+'1'):(petResponse.body.id.slice(0,23)+'2')
      await supertest(app)
        .get(`/adoptly/pets/${randomId}`)
        .expect(404);
    });
  });
  describe('PUT /adoptly/pets/:id', () => {
    let pet;
    let petResponse;
    let newPet;
     beforeEach(async () => {
       let petSex = faker.person.sex();
       let petSpecies = faker.animal.type();
       pet = {
         name: faker.person.firstName(petSex),
         species:petSpecies,
         breed:`test ${petSpecies} breed`,
         age:faker.number.int({ min: 0, max: 50 }),
         sex:petSex,
         taken:faker.datatype.boolean(),
         description:faker.person.bio(),
         ownerID:null,
         imageURL:faker.image.url()
       };
       petResponse= await supertest(app)
         .post(`/adoptly/pets/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send(pet)
         .expect('Content-Type', /json/)
         .expect(201);

         petSex = faker.person.sex();
         petSpecies = faker.animal.type();
         newPet = {
         name: faker.person.firstName(petSex),
          species:petSpecies,
          breed:`test ${petSpecies} breed`,
          age:faker.number.int({ min: 0, max: 50 }),
          sex:petSex,
          taken:faker.datatype.boolean(),
          description:faker.person.bio(),
          ownerID:null,
          imageURL:faker.image.url()
        }
        
       
     });
     test('should return a 200', async () => {
       const res = await supertest(app)
         .put(`/adoptly/pets/${petResponse.body.id}`)
         .set('Cookie', [`access_token=${jwtReadTokenExample};`])
         .send(newPet)
         .expect('Content-Type', /json/)
         .expect(200);
         
         const expectedProperties = ['id','name', 'species', 'breed', 'age', 'sex', 'taken', 'description', 'imageURL', 'ownerID', 'id'];
         for (const property of expectedProperties) {
           expect(res.body).toHaveProperty(property);
         }
         expect({
           name:res.body.name,
           species:res.body.species,
           breed:res.body.breed,
           age:res.body.age,
           sex:res.body.sex,
           taken:res.body.taken,
           description:res.body.description,
           ownerID:res.body.ownerID,
           imageURL:res.body.imageURL
         }).toMatchObject(newPet);
         expect(res.body.age).toBeGreaterThanOrEqual(0);
         expect(res.body.age).toBeLessThanOrEqual(50);
         expect(res.body.ownerID).toBeNull()
         expect(res.body.id).toBe(petResponse.body.id);
     });
     test('should return a 400 if age field is out of min or max values', async () => {
         await supertest(app)
          .put(`/adoptly/pets/${petResponse.body.id}`)
          .set('Cookie', [`access_token=${jwtReadTokenExample};`])
          .send({
            ...newPet,
            age:-1
          })
          .expect('Content-Type', /json/)
          .expect(400);
     });
     test('should return a 400 if sex field is not enum value', async () => {
         await supertest(app)
          .put(`/adoptly/pets/${petResponse.body.id}`)
          .set('Cookie', [`access_token=${jwtReadTokenExample};`])
          .send({
            ...newPet,
            sex:'non-binary'
          })
          .expect('Content-Type', /json/)
          .expect(400);
     });
    test('should return a 401 if something is wrong with access token', async () => {
         await supertest(app)
          .put(`/adoptly/pets/${petResponse.body.id}`)
          .set('Cookie', [`access_token=${jwtReadTokenExample}+1;`])
          .send(newPet)
          .expect('Content-Type', /json/)
          .expect(401);
    });
    test('should return a 403 if something is wrong with your token rights', async () => {
         await supertest(app)
          .put(`/adoptly/pets/${petResponse.body.id}`)
          .set('Cookie', [`access_token=${jwtWrongTokenExample};`])
          .send(newPet)
          .expect('Content-Type', /json/)
          .expect(403);
    });
    test('should return a 403 if your account is not activated', async () => {
      await supertest(app)
       .put(`/adoptly/pets/${petResponse.body.id}`)
       .set('Cookie', [`access_token=${jwtReadTokenNotActivatedExample};`])
       .send(newPet)
       .expect('Content-Type', /json/)
       .expect(403);
    });
     test("should return a 404 if pet wasn't found", async () => {
       let randomId = (petResponse.body.id.slice(0,23)+'1')!=petResponse.body.id?(petResponse.body.id.slice(0,23)+'1'):(petResponse.body.id.slice(0,23)+'2')
        await supertest(app)
         .put(`/adoptly/pets/${randomId}`)
         .set('Cookie', [`access_token=${jwtReadTokenExample};`])
         .send(newPet)
         .expect(404);
   });
  });
  describe('DELETE /adoptly/pets/:id', () => {
    let pet;
    let petResponse;
     beforeEach(async () => {
       let petSex = faker.person.sex();
       let petSpecies = faker.animal.type();
       pet = {
         name: faker.person.firstName(petSex),
         species:petSpecies,
         breed:`test ${petSpecies} breed`,
         age:faker.number.int({ min: 0, max: 50 }),
         sex:petSex,
         taken:faker.datatype.boolean(),
         description:faker.person.bio(),
         ownerID:null,
         imageURL:faker.image.url()
       };
       petResponse= await supertest(app)
         .post(`/adoptly/pets/`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .send(pet)
         .expect('Content-Type', /json/)
         .expect(201);
       
     });
     test('should return a 204', async () => {
       const res = await supertest(app)
         .delete(`/adoptly/pets/${petResponse.body.id}`)
         .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
         .expect(204);
     });
    test('should return a 401 if something is wrong with access token', async () => {
        await supertest(app)
        .delete(`/adoptly/pets/${petResponse.body.id}`)
        .set('Cookie', [`access_token=${jwtWriteTokenExample}+1;`])
        .expect(401);
    });
    test('should return a 403 if something is wrong with your token rights', async () => {
        await supertest(app)
        .delete(`/adoptly/pets/${petResponse.body.id}`)
        .set('Cookie', [`access_token=${jwtWrongTokenExample};`])
        .expect(403);
    });
     test("should return a 404 if pet wasn't found", async () => {
       let randomId = (petResponse.body.id.slice(0,23)+'1')!=petResponse.body.id?(petResponse.body.id.slice(0,23)+'1'):(petResponse.body.id.slice(0,23)+'2')
       await supertest(app)
       .delete(`/adoptly/pets/${randomId}`)
       .set('Cookie', [`access_token=${jwtWriteTokenExample};`])
       .expect(404);
   });
  });

});
