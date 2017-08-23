const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');


// User Schema
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true
    },
    permission: [{
        action: String,
        appliedTo: String
    }],
    facebook: {
        id: String,
    },
    google: {
        id: String
    },
    avatar: {
        path_social: String,
        local: {
            image: [{
                path_local: String,
                typeImage: String
            }],
            displayImageID: String
        },
        displayImageType: String
    },
    notification: [{
        emitUser: String,
        editedUser: String,
        action: String
    }]
});


var User = module.exports = mongoose.model('User', UserSchema, 'User');

module.exports.validateUser = function(user) {
    if (user.name == undefined || user.email == undefined || user.username == undefined || user.password == undefined) {
        return false;
    } else {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(user.email);
    }
}

module.exports.createUser = function(newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.saveUser = function(newUser, callback) {
    newUser.save(callback);
}

module.exports.getAllUser = function(query, callback) {
    User.find(query, { avatar: false, permission: false }, callback);
}

module.exports.correctUser = function(query, correctUser, callback) {
    User.findOneAndUpdate(query, correctUser,{new: true}, callback);
}

module.exports.deleteUser = function(query, callback) {
    User.remove(query, callback);
}

module.exports.getUser = function(query, callback) {
    User.findOne(query, callback);
}

module.exports.generateObjectID = function() {
    return mongoose.Types.ObjectId();
}

module.exports.getUserByUsername = function(username, callback) {
    const query = { username: username }
    User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        callback(null, isMatch);
    });
}