const express = require('express');
const router = express.Router();
const checkRights = require('../utils/checkRights');

// eslint-disable-next-line import/extensions
// eslint-disable-next-line import/extensions
const userController = require('../controllers/index.js').userController;

router.get('/me',checkRights("read"),  userController.getCurrentUser);
router.put('/me',checkRights("read"),  userController.putCurrentUser) 

router.get('/',checkRights("write"),  userController.getUsers); 
router.post('/',checkRights("write"),  userController.postUser);   
router.get('/:id',checkRights("read"),  userController.getUser); 
router.put('/:id',checkRights("read"),  userController.putUser) 
router.delete('/:id',checkRights("write"),  userController.deleteUser);

module.exports = router;
