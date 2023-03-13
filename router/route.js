const express = require('express');
const router = express.Router();
const { signup , login , update , resetPassword , remove,permission, generateOTP , forgetPassword, superAdmin , admin ,  forAll } = require('../Controller/controller.js');

/* route for all api  */
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/update').put(update);
router.route('/permission').patch(permission);
router.route('/resetPassword').patch(resetPassword);
router.route('/remove').delete(remove);
router.route('/forgetPassword').patch(generateOTP).post(forgetPassword);
router.route('/showSuperAdmin').get(superAdmin);
router.route('/showAdmin').get(admin);
router.route('*').all(forAll);

/* export the router */
module.exports = router;

