
const { pbkdf2Sync } = require('crypto'); 
const { SALT } = require('./config');

const hashPassword = (str) => {
    return pbkdf2Sync (str , SALT , 1000 , 64 , 'sha512').toString('hex');
};

module.exports = hashPassword;