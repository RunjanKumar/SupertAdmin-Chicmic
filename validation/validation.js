const joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const options ={
    min: 8,
    max:100,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: Infinity,
  };
  const otpOptions ={
    min: 6,
    max: 6,
    lowerCase: 0,
    upperCase: 0,
    numeric: 6,
    symbol: 0,
    requirementCount: Infinity,
  };


const signupSchema = joi.object({
  name : joi.string().min(5).max(30).required(),
  age : joi.number().integer().min(18).max(100).required(),
  email : joi.string().email({  tlds : {allow : ['com' , 'in']},}).required(),
  role  : joi.string().valid("superAdmin" , "admin" , "user").required(),
  password : passwordComplexity(options).required(),
  confirmPassword : joi.string().required().valid(joi.ref('password')),
});

const loginSchema = joi.object({ 
  email : joi.string().email({  tlds : {allow : ['com' , 'in']},}).required(),
  password : joi.string().required(),
});

const updateSchema = joi.object({ 
  age : joi.number().integer().min(18).max(100),
  name : joi.string().min(5).max(30),
  email : joi.string().email({  tlds : {allow : ['com' , 'in']},}).required(),
});

const resetPasswordSchema = joi.object({ 
  oldPassword : joi.string().required(),
  newPassword : passwordComplexity(options).required()
});

const permissionSchema = joi.object({ 
  email : joi.string().email({  tlds : {allow : ['com' , 'in']},}).required(),
  permission : joi.boolean().required(),
});

const removeSchema = joi.object({ 
  email : joi.string().email({  tlds : {allow : ['com' , 'in']},}).required(),
});

const forgetPasswordSchema = joi.object({ 
  email : joi.string().email({  tlds : {allow : ['com' , 'in']},}).required(),
  changePassword :  passwordComplexity(options).required(),
  OTP : passwordComplexity(otpOptions).required(),
});

const schemaValidate =(schema , body ) => {
  let result = schema.validate(body);
    if(result.error)  throw new Error(result.error.message);
};

module.exports = {
    signupSchema ,
    loginSchema,
    updateSchema,
    resetPasswordSchema,
    permissionSchema,
    forgetPasswordSchema,
    removeSchema,
    schemaValidate
};