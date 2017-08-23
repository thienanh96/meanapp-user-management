const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const auth = require('../models/auth');

module.exports.authorUser = function (user,action,appliedTo){
  var arr_action = [];
  var arr_appliedTo = [];
  for(let i in user.permission){
    arr_action.push(user.permission[i].action);
    arr_appliedTo.push(user.permission[i].appliedTo);
  }
  return {
    containAction : arr_action.includes(action),
    containAppliedTo : arr_appliedTo.includes(appliedTo)
  }
}

module.exports.getAppliedToByAction = function (currentUser,action){
  var arr_appliedTo = [];
  for(let i = 0; i < currentUser.permission.length; i++){
    if(currentUser.permission[i].action == action) {
      arr_appliedTo.push(currentUser.permission[i].appliedTo);
    }

  }
  return arr_appliedTo;
}