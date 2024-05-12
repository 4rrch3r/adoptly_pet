const petModel = require('../models/index').Pet;
const userModel = require('../models/index').User;
const apiError = require('../utils/apiError');

const getPets =async(req,res,next)=>{
try{
    const pets = await petModel.find({}).select('name species taken breed age sex description imageURL');
    return res.status(200).json(pets);
}
catch(err)
{
    return next(err);
}
};
const getPet = async(req,res,next)=>{
    try{
        const pet = await petModel.findById(req.params.id).exec();
        if (!pet) {
                throw new apiError(404, 'Pet was not found');
          }
          return  res.status(200).json(pet);
    }
    catch(err)
    {
        return next(err);
    }
};
const postPet = async(req,res,next)=>{
    try{
        const newPet= new petModel({
            name:req.body.name,
            species:req.body.species,
            breed:req.body.breed,
            age:req.body.age,
            sex:req.body.sex,
            taken:req.body.taken,
            description:req.body.description,
            imageURL:req.body.imageURL,
            ownerID:req.body.ownerID,
        });
        const savedPet= await newPet.save();
        return res.status(201).json(savedPet);
    }
    catch(err)
    {
        return next(err);
    }
};
const putPet = async(req,res,next)=>{
    try{
        if(req.user.rights == "read"&&req.user.isActivated==false)
        {
            throw new apiError(403, "Activate your account");
        }
    
        const pet =await petModel.findById(req.params.id).exec();
        if(!pet)
        {
            throw new apiError(404, 'Pet was not found');
        }
        const updatedPet = await petModel.findByIdAndUpdate(req.params.id,{
            name:req.body.name,
            species:req.body.species,
            breed:req.body.breed,
            age:req.body.age,
            sex:req.body.sex,
            taken:req.body.taken,
            description:req.body.description,
            imageURL:req.body.imageURL,
            ownerID:req.body.ownerID,
        },{new:true,
            //runValidators: true
        });
        return res.status(200).json(updatedPet);
    }
    catch(err)
    {
        return next(err);
    }
};
const deletePet = async(req,res,next)=>{
    try{
        const pet =await petModel.findById(req.params.id).exec();
        if(!pet)
        {
            throw new apiError(404, 'Pet was not found');
        }
        await petModel.findByIdAndDelete(req.params.id);
        return res.status(204).json("Pet deleted");
    }
    catch(err)
    {
        return next(err);
    }
};
module.exports={
    getPets,
    getPet,
    postPet,
    putPet,
    deletePet
}