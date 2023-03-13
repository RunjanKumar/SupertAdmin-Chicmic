const {
  signupSchema,
  loginSchema,
  updateSchema,
  resetPasswordSchema,
  forgetPasswordSchema,
  permissionSchema,
  removeSchema,
  schemaValidate,
} = require("../validation/validation.js");
const hashPassword = require("../hashPassword.js");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const userData = require("../database/userData.json");
const { userUrl } = require("../utils/constant.js");
const { SECRET_KEY } = require("../config.js");

/* @desc  api of signup
@route POST /signup
@access public
  */
const signup = (req, res) => {
  /* validation of body */
  try {
    schemaValidate(signupSchema, req.body, res);
  } catch (err) {
    return res.send(err.message);
  }

  /* store the data from url */
  delete req.body.confirmPassword;
  let bodyData = req.body;
  bodyData.email = bodyData.email.toLowerCase();
  bodyData.password = hashPassword(bodyData.password);
  /* Checking the Email */
  if (userData[bodyData.email]) {
    return res.status(200).send("email is also registered");
  }
  /* make the key of the object */
  userData[bodyData.email] = bodyData;

  if (userData[bodyData.email].role === "admin") {
    userData[bodyData.email].permission = true;
  }

  const token = jwt.sign({ id: bodyData.email }, SECRET_KEY);
  userData[bodyData.email].token = token;
  /* update in file  */
  fs.writeFileSync(userUrl, JSON.stringify(userData));
  return res.json({ token, message: "successfully signup" });
};
/* @desc api for login
@router POST /login
@access public
*/
const login = (req, res) => {
  /* validation of body */
  try {
    schemaValidate(loginSchema, req.body, res);
  } catch (err) {
    return res.send(err.message);
  }
  req.body.email = req.body.email.toLowerCase();
  let bodyData = req.body;

  /* checking Email */
  if (!userData[bodyData.email]) {
    return res.status(404).send("please check the email");
  }
  /* checking Password */
  if (hashPassword(bodyData.password) !== userData[bodyData.email].password) {
    return res.status(404).send("please check the password");
  }
  /* Generate token */
  const token = jwt.sign({ id: bodyData.email }, SECRET_KEY);
  userData[bodyData.email].token = token;
  /* update in file  */
  fs.writeFileSync(userUrl, JSON.stringify(userData));
  res.send(JSON.stringify({ token, message: "succsessfull login" }));
};
/* @desc  api of update
@route PUT  /update
@access public
  */
const update = (req, res) => {
  /* validation of body */
  try {
    schemaValidate(updateSchema, req.body, res);
  } catch (err) {
    return res.send(err.message);
  }
  ({ id } = jwt.verify(req.headers.token, SECRET_KEY));
  req.body.email = req.body.email.toLowerCase();
  let bodyData = req.body;
  /* checking email */
  if (!userData[bodyData.email]) {
    res.send("please provide us a valid email");
  }
  if (userData[id].role === "user") {
    return res.send("you have not access to edit");
  }
  if (
    userData[id].role === "admin" &&
    Boolean(userData[id].permission) === true
  ) {
    if (userData[bodyData.email].role === "user") {
      if (bodyData.name) {
        userData[bodyData.email].name = bodyData.name;
        fs.writeFileSync(userUrl, JSON.stringify(userData));
        return res.send("updated");
      }
      if (bodyData.age) {
        userData[bodyData.email].age = bodyData.age;
        fs.writeFileSync(userUrl, JSON.stringify(userData));
        return res.send("updated");
      }
    } else {
      return res.send("you have not access to edit admin or superAdmin");
    }
  } else {
    return res.send("you have not access to edit ");
  }
  if (userData[id].role === "superAdmin") {
    if (userData[bodyData.email].role === "superAdmin") {
      return res.send("you have no access to  edit other superAdmin ");
    } else {
      if (bodyData.name) {
        userData[bodyData.email].name = bodyData.name;
        fs.writeFileSync(userUrl, JSON.stringify(userData));

        if (bodyData.age) {
          userData[bodyData.email].age = bodyData.age;
          fs.writeFileSync(userUrl, JSON.stringify(userData));
        }
        res.send("successfully updated");
      }
    }
  }
  res.send("succesfull update");
};

/* @desc  api of resetPassword
@route PATCH  /resetPassword
@access public
  */
const resetPassword = (req, res) => {
  /* validation of body */
  try {
    schemaValidate(resetPasswordSchema, req.body, res);
  } catch (err) {
    return res.send(err.message);
  }
  ({ id } = jwt.verify(req.headers.token, SECRET_KEY));
  let bodyData = req.body;

  /* checking the old Password */
  if (hashPassword(bodyData.oldPassword) !== userData[id].password) {
    return res.send("please provide correct password");
  }
  /* updating your password */
  userData[id].password = hashPassword(bodyData.newPassword);
  /* write in user file */
  fs.writeFileSync(userUrl, JSON.stringify(userData));
  res.send("successfully update your password ");
};

/* @desc  api of permission
@route PATCH  /permission
@access public
  */
const permission = (req, res) => {
  /* validation of body */
  try {
    schemaValidate(permissionSchema, req.body, res);
  } catch (err) {
    return res.send(err.message);
  }

  ({ id } = jwt.verify(req.headers.token, SECRET_KEY));
  let bodyData = req.body;
  /* checking email */
  if (!userData[bodyData.email]) {
    res.send("please provide us a valid email");
  }
  if (userData[bodyData.email].role === "admin") {
    userData[bodyData.email].permission = bodyData.permission;
    fs.writeFileSync(userUrl, JSON.stringify(userData));
    res.send("changed the permission to the admin");
  } else {
    res.send("this field is valid for only admin ");
  }
  res.send("successfully updated permission");
};
/* @desc  api of/remove
@route DELETE  /remove
@access public
  */
const remove = (req, res) => {
  /* validation of body */
  try {
    schemaValidate(removeSchema, req.body, res);
  } catch (err) {
    return res.send(err.message);
  }
  ({ id } = jwt.verify(req.headers.token, SECRET_KEY));
  let bodyData = req.body;

  /* checking email */
  if (!userData[bodyData.email]) {
    res.send("please provide us a valid email");
  }
  if (
    userData[id].role === "superAdmin" ||
    (userData[id].role === "admin" && Boolean(userData[id].permission) === true)
  ) {
    if (userData[bodyData.email].role === "user") {
      delete userData[bodyData.email];
      fs.writeFileSync(userUrl, JSON.stringify(userData));
      res.send("successfully deleted");
    } else {
      res.send("you only delete user");
    }
  } else {
    res.send("you have not access to delete");
  }
  res.send("successfully deleted user");
};

const generateOTP = (req, res) => {
  /* validation of body */
  try {
    schemaValidate(removeSchema, req.body, res);
  } catch (err) {
    return res.send(err.message);
  }

  const bodyData = req.body;
  if (!userData[bodyData.email]) {
    return res.send("please provide me a valid mail");
  }
  userData[bodyData.email].OTP = Math.random().toPrecision(6) * 1000000;
  fs.writeFileSync(userUrl, JSON.stringify(userData));
  res.send(`${userData[bodyData.email].OTP}`);
};

const forgetPassword = (req, res) => {
  /* validation of body */
  try {
    schemaValidate(forgetPasswordSchema, req.body, res);
  } catch (err) {
    return res.send(err.message);
  }
  let bodyData = req.body;
  if (!userData[bodyData.email]) {
    return res.send("please provide me a valid mail");
  }
  if (userData[bodyData.email].OTP == bodyData.OTP) {
    delete userData[bodyData.email].OTP;
    userData[bodyData.email].password = hashPassword(bodyData.changePassword);
    fs.writeFileSync(userUrl, JSON.stringify(userData));
    res.send("successfully updated your password");
  } else {
    res.send("wrong otp");
  }
};

const superAdmin = (req, res) => {
  ({ id } = jwt.verify(req.headers.token, SECRET_KEY));
  if (userData[id].role === "superAdmin") {
    let data = Object.values(userData).filter((elem) => {
      return elem.role !== "superAdmin";
    });
    return res.json(data);
  }else{
    return res.send("you have no access to see the data");
  }
};
const admin = (req, res) => {
  ({ id } = jwt.verify(req.headers.token, SECRET_KEY));
  if(userData[id].role === 'user'){
    res.send("you have no access to see the data");
  }
  let data = Object.values(userData).filter((elem) => {
    return elem.role === "user";
  });
  return res.json(data);
};

const forAll = (req, res) => {
  res.status(404).send("this is not a valid url");
};

module.exports = {
  signup,
  login,
  update,
  resetPassword,
  permission,
  generateOTP,
  forgetPassword,
  superAdmin,
  admin,
  remove,
  forAll,
};
