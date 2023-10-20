const mongoose = require('mongoose');
const toJSON = require('../utils/toJson');
var Schema = mongoose.Schema;

var petSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name of the pet is required'],
  },
  species:{
    type: String,
    required: [true, 'Species of the pet is required']
  },
  age:{
    type: Number,
    required: [true, 'Age of the pet is required'],
    min:0,
    max:50
  },
  sex:{
    type: String,
    required: [true, 'Sex of the pet is required'],
    enum: ['male', 'female']
  },
  breed:{
    type: String
  },
  taken:{
    type: Boolean,
    default:false
  },
  description: {
    type: String,
    default:"",
  },
  imageURL:{
    type: String,
    default:"https://as1.ftcdn.net/v2/jpg/02/52/84/92/1000_F_252849218_Acdc6N696mDekuQvrCmqlFDMx4UYYF2Y.jpg"
  },
  ownerID:{
    type: mongoose.Schema.Types.ObjectId,
    default:null
  },
});

toJSON(petSchema);

module.exports = mongoose.model('pets', petSchema);
