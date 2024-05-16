const express = require('express');
const router = express.Router();
const petController = require('../controllers/pet.controller.js');
const checkRights = require('../utils/checkRights');

router.get('/' , petController.getPets); 
router.post('/',checkRights("write"),  petController.postPet); 
router.get('/taken',checkRights("write"),  petController.getTakenPets);   
router.get('/:id', petController.getPet); 
router.put('/:id',checkRights("read"),  petController.putPet) 
router.delete('/:id',checkRights("write"),  petController.deletePet); 

module.exports = router;

