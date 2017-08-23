const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const configDatabase = require('../config/database');
const configAuth = require('../config/auth');
const qs = require('querystring');
const request = require('request');
const User = require('../models/user');
const auth = require('../models/auth');
const async = require('async');
const fs = require('fs');

// Register
router.post('/register', (req, res) => {
    auth.updatePermission(req.body, function(newUser) {
        console.log('first: '+JSON.stringify(newUser))
        if (!User.validateUser(newUser)) {
            res.json({ success: false, msg: 'Invalid user !' })
        } else {
            User.getUser({ $or: [{ username: newUser.username }, { email: newUser.email }]}, (err, user) => {
                if (err) {
                    res.json({ success: false, msg: 'Username has special character!' })
                }
                var avatar = {
                     path_social: 'sasasasasa',
                    local: {
                        image: [{ path_local: 'uploads/default.jpg', typeImage: 'image/jpeg' }],
                        displayImageID: ''
                    },
                    displayImageType: 'local'
                }
                if (!user) {
                    //console.log('assi: '+JSON.stringify(new User(finalUser)))
                    var finalUser = {
                    username: newUser.username,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    permission: newUser.permission,
                    password: newUser.password,
                    avatar: {
                        path_social: '',
                        local: {
                            image: [{
                                path_local: 'uploads/default.jpg',
                                typeImage: 'image/jpeg'
                            }],
                            displayImageID: ''
                        },
                        displayImageType: 'local'
                    }
                }
                    User.createUser(new User(finalUser), (err, user) => {
                        User.correctUser({ _id: user._id }, { 'avatar.local.displayImageID': user.avatar.local.image[0]._id }, (err) => {
                            if (err) {
                                res.json({ success: false, msg: 'Failed to register user !' });
                            } else {
                                return res.json({ success: true, msg: 'User registered !' });
                            }
                        })

                    });
                }
                if (user) {
                    res.json({ success: false, msg: 'Username or Email existed, please enter another one !' });
                }
            })
        }
    });
});


router.post('/login', (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username == undefined || password == undefined) {
        res.json({ success: false, msg: 'Please fill in all field !' })
    } else {
        User.getUser({ $or: [{ username: username }, { email: username }] },
            (err, user) => {
                if (err) throw err;
                if (!user) {
                    return res.json({ success: false, msg: 'User not found' });
                }
                User.comparePassword(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        var newToken = jwt.sign(user, configDatabase.secret, {
                            expiresIn: 604800 // 1 week
                        });
                        res.json({
                            success: true,
                            token: 'JWT ' + newToken,
                            user: {
                                _id: user._id,
                                username: user.username,
                                name: user.name,
                                email: user.email,
                                permission: user.permission,
                                role: user.role
                            }
                        });
                    } else {
                        return res.json({ success: false, msg: 'Wrong password' });
                    }
                });
            });
    }
});

router.post('/auth/facebook', function(req, res) {
    async.waterfall([
        function(done) {
            var accessTokenUrl = 'https://graph.facebook.com/v2.10/oauth/access_token';
            if (req.body.code) {
                var params = {
                    code: req.body.code,
                    client_id: configAuth.facebookAuth.clientID,
                    client_secret: configAuth.facebookAuth.clientSecret,
                    redirect_uri: configAuth.facebookAuth.callbackURL
                };
                request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
                    if (response.statusCode !== 200) {
                        return res.status(500).send({ message: accessToken.error.message });
                    }
                    done(err, accessToken)
                })
            } else {
                done(null, req.body.accessToken)
            }
        },
        function(accessToken, done) {
            var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name', 'picture.type(large)'];
            var graphApiUrl = 'https://graph.facebook.com/v2.9/me?fields=' + fields.join(',');
            request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
                if (response.statusCode !== 200) {
                    return res.status(500).send({ message: profile.error.message });
                }
                done(err, profile);
            })
        },
        function(profile, done) {
            User.findOne({ 'facebook.id': profile.id }, function(err, existingUser) {
                if (existingUser) {
                    let existUser = true;
                    done(err, existingUser, profile, existUser)
                }
                if (!existingUser) {
                    let existUser = false
                    done(err, null, profile, existUser)
                }
            })
        },
        function(existingUser, profile, existUser, done) {
            if (existUser == true) {
                var query_name_email = checkUpdateProfile(existingUser, profile);
                var query_avatar = {
                    'avatar.path_social': profile.picture.data.url
                }
                User.correctUser({ _id: existingUser._id }, Object.assign(query_name_email, query_avatar), function(err, result) {
                    var newToken = jwt.sign(existingUser, configDatabase.secret, { expiresIn: 604800 });
                    return res.send({
                        success: true,
                        token: 'JWT ' + newToken,
                        user: {
                            _id: result._id,
                            name: result.name,
                            username: result.username,
                            email: result.email,
                            role: result.role,
                            permission: result.permission
                        }
                    });
                })
            }
            if (existUser == false) {
                let newUser = {
                    username: 'temp',
                    name: profile.name,
                    email: profile.email,
                    password: 'temp',
                    role: 'Normal User'
                }
                done(null, newUser, profile);
            }
        },
        function(newUser, profile, done) {
            auth.updatePermission(newUser, (user) => {
                var _user = new User(user);
                console.log(JSON.stringify(_user))
                var finalUser = {
                    name: _user.name,
                    email: _user.email,
                    role: 'Normal User',
                    permission: _user.permission,
                    facebook: {
                        id: profile.id
                    },
                    avatar: {
                        path_social: profile.picture.data.url,
                        local: {
                            image: [{
                                path_local: 'uploads/default.jpg',
                                typeImage: 'image/jpeg'
                            }],
                            displayImageID: ''
                        },
                        displayImageType: 'social'
                    }
                }
                done(null, finalUser)
            })
        },
        function(finalUser) {
            User.saveUser(new User(finalUser), (err, users) => {
                User.correctUser({ _id: users._id }, { 'avatar.local.displayImageID': users.avatar.local.image[0]._id }, (err, docs) => {
                    if (err) throw err;
                    var newToken = jwt.sign(users, configDatabase.secret, {
                        expiresIn: 604800 // 1 week
                    });
                    res.send({
                        success: true,
                        token: 'JWT ' + newToken,
                        user: {
                            username: users.username,
                            name: users.name,
                            email: users.email,
                            role: users.role,
                            permission: users.permission
                        }
                    });
                })

            })
        }
    ])
})

router.post('/auth/google', function(req, res) {
    async.waterfall([
        function(done) {
            var accessTokenUrl = 'https://www.googleapis.com/oauth2/v4/token';
            if (req.body.code) {
                var params = {
                    code: req.body.code,
                    client_id: configAuth.googleAuth.clientID,
                    client_secret: configAuth.googleAuth.clientSecret,
                    redirect_uri: configAuth.googleAuth.callbackURL,
                    grant_type: 'authorization_code'
                };
                let body = qs.stringify(params);
                request.post(accessTokenUrl, { body: body, headers: { 'Content-type': 'application/x-www-form-urlencoded' } }, function(err, response, token) {
                    if (response.statusCode !== 200) {
                        return res.status(500).send({ message: accessToken.error.message });
                    }
                    done(err, JSON.parse(token))
                })
            } else {
                done(null, JSON.stringify(req.body.accessToken))
            }
        },
        function(token, done) {
            var peopleApiUrl = 'https://www.googleapis.com/oauth2/v3/userinfo'; // userinfo_endpoint
            var accessToken = token.access_token;
            var headers = { Authorization: 'Bearer ' + accessToken };
            // Retrieve profile information about the current user.
            request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
                if (profile.error) {
                    return res.status(500).send({ message: profile.error.message });
                }
                done(err, profile)
            })
        },
        function(profile, done) {
            User.findOne({ 'google.id': profile.sub }, function(err, existingUser) {
                if (existingUser) {
                    let existUser = true;
                    done(err, existingUser, profile, existUser)
                }
                if (!existingUser) {
                    let existUser = false
                    done(err, null, profile, existUser)
                }
            })
        },
        function(existingUser, profile, existUser, done) {
            if (existUser == true) {
                var query_name_email = checkUpdateProfile(existingUser, profile);
                var query_avatar = {
                    'avatar.path_social': profile.picture
                }
                User.correctUser({ _id: existingUser._id }, Object.assign(query_name_email, query_avatar), function(err, result) {
                    var newToken = jwt.sign(existingUser, configDatabase.secret, { expiresIn: 604800 });
                    return res.send({
                        success: true,
                        token: 'JWT ' + newToken,
                        user: {
                            _id: existingUser._id,
                            name: profile.name,
                            email: profile.email,
                            role: existingUser.role
                        }
                    });
                })
            }
            if (existUser == false) {
                let newUser = {
                    username: 'temp',
                    name: profile.name,
                    email: profile.email,
                    password: 'temp',
                    role: 'Normal User'
                }
                done(null, newUser, profile);
            }
        },
        function(newUser, profile, done) {
            auth.updatePermission(newUser, (user) => {
                var _user = new User(user);
                var finalUser = {
                    name: _user.name,
                    email: _user.email,
                    role: 'Normal User',
                    permission: _user.permission,
                    google: {
                        id: profile.sub
                    },
                    avatar: {
                        path_social: profile.picture,
                        local: {
                            image: [{
                                path_local: 'uploads/default.jpg',
                                typeImage: 'image/jpeg'
                            }],
                            displayImageID: ''
                        },
                        displayImageType: 'social'
                    }
                }
                done(null, finalUser)
            })
        },
        function(finalUser) {
            User.saveUser(new User(finalUser), (err, users) => {
                User.correctUser({ _id: users._id }, { 'avatar.local.displayImageID': users.avatar.local.image[0]._id }, (err) => {
                    if (err) throw err;
                    var newToken = jwt.sign(users, configDatabase.secret, {
                        expiresIn: 604800 // 1 week
                    });
                    res.send({
                        success: true,
                        token: 'JWT ' + newToken,
                        user: {
                            username: users.username,
                            name: users.name,
                            email: users.email,
                            role: users.role,
                            permission: users.permission
                        }
                    });
                })

            })
        }
    ])
})

function checkUpdateProfile(localUser, profile) {
    if (localUser.name == profile.name && localUser.email == profile.email) {
        return {
            name: profile.name,
            email: profile.email
        }
    } else {
        return {}
    }
}
module.exports = router;