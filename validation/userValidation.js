const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

const userUrl = '../database/userData.json';
const userData = require(userUrl);



const userValidation = (req,res,next) => {
    if( req.url === "/signup" || req.url === "/login" || req.url === '/forgetPassword'){
        next();
        return ;
    }
    if (!req.headers.token) {
        return res.status(401).send("please login again because your token is invalid");
      }
      try {( {id} = jwt.verify(req.headers.token, SECRET_KEY));}
      catch(err){
        return res.status(401).send("your token is expired");
      }
      if(!userData[id]){
        return res.status(401).send("you are not a valid user");
      }
      next();
};

module.exports = userValidation;