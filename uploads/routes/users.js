const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const User = require('../models/user');
const auth = require('../models/auth');
const async = require('async');
const authorization = require('./authorization');
const multer = require('multer');
const fs = require('fs');

//<!-- chinh sua profile ca nhan -->
router.put('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if ((req.body.role != null || undefined) || (req.body.username != null || undefined)) return res.json({ success: false, msg: 'Cannot edit your role or username!' });
    if (req.body.editType == 'password') {
        async.waterfall([
                function(done) {
                    User.getUser({ _id: req.user._id }, (err, user) => {
                        if (err || !user) return res.json({ success: false, msg: 'Errors have occurred!' });
                        if (user) {
                            done(err, user)
                        }
                    })
                },
                function(user, done) {
                    User.comparePassword(req.body.old_password, user.password, (err, isMatch) => {
                        if (isMatch) {
                            if (req.body.new_password == req.body.re_password) done(null, user);
                            else res.json({ success: false, msg: 'Password does not match the confirm password !' })
                        }
                        if (!isMatch) {
                            return res.json({ success: false, msg: 'Incorrect password !' });
                        }
                    })
                },
                function(user, done) {
                    bcrypt.genSalt(10, (err, salt) => {
                        done(err, salt, user);
                    });
                },
                function(salt, user, done) {
                    bcrypt.hash(req.body.new_password, salt, (err, hash) => {
                        var newPass = {
                            password: hash || user.password
                        }
                        done(null, newPass);
                    });

                }
            ],
            function(err, newPass) {
                User.correctUser({ _id: req.user._id }, newPass, (err) => {
                    if (err) {
                        res.json({ success: false, msg: 'Failed to update user !' });
                    } else {
                        res.json({ success: true, msg: 'Password has been changed , re-login now !' });
                    }
                })

            }
        );

    }

    if (req.body.editType == 'profile') {
        async.waterfall([
            function(done) {
                User.getUser({ _id: req.user._id }, (err, user) => {
                    if (err || !user) return res.json({ success: false, msg: 'Errors have occurred!' });
                    if (user) {
                        done(err, user)
                    }
                })
            },
            function(user, done) {
                User.getUser({ email: req.body.email, username: { $nin: [req.user.username] } }, (err, result) => {
                    if (result) return res.json({ success: false, msg: 'Exist email , try another one !' });
                    else {
                        var newUser = {
                            name: req.body.name || user.name,
                            email: req.body.email || user.email
                        }
                        done(err, newUser);
                    }
                })
            },
            function(newUser, done) {
                User.correctUser({ _id: req.user._id }, newUser, (err) => {
                    if (err) {
                        res.json({ success: false, msg: 'Failed to update user !' });
                    } else {
                        res.json({ success: true, msg: 'User has been updated !' });
                    }
                })
            }
        ])
    }
    if(req.body.editType === 'notification'){
        let query = {$push: { notification: {emitUser: req.body.emitUser, editedUser: req.body.editedUser, action: req.body.action} }}
        User.correctUser({_id: req.user._id},query,(err,docs) => {
            if(err) throw err;
            else {
                console.log('ggggtt: '+ docs.notification[0]);
                res.json({success: true, notification: docs.notification});
            }
        })
    }

})


//update user by id
router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var auth = authorization.authorUser(req.user, 'update', 'Normal User');
    if (auth.containAction && auth.containAppliedTo) return next();
    else return res.json({ success: false, msg: 'Unauthorized !' });
}, (req, res) => {
    let id = req.params.id;
    if (req.body.password != undefined || null || '') res.json({ success: false, msg: 'Cannot change password !' })
    async.waterfall([
        function(done) {
            let correctUser = {
                username: req.body.username,
                name: req.body.name,
                email: req.body.email, 
                role: req.body.role 
            };
            var query = {
                _id: id,
                role: {
                    $in: authorization.getAppliedToByAction(req.user, 'update')
                }
            }
            auth.updatePermission(correctUser, (user) => {
                let auth = authorization.authorUser(req.user, 'update', user.role)
                if (!auth.containAppliedTo) {
                    return res.json({ success: false, msg: 'Unauthorized !' });
                }
                if (auth.containAppliedTo) {
                    done(null, query, user);
                }
            })
        },
        function(query, user, done) {
            console.log('rfff: '+user.email)
            User.getUser({ email: user.email,username: {$nin: [user.username]}}, (err, docs) => {
                if(err) throw err
                if (docs) return res.json({ success: false, msg: 'Exist email , try another one !' });
                if (!docs) {
                    done(err, query, user);
                }
            })
        },
        function(query, user, done) {
            User.correctUser(query, user, (err) => {   
                if (err) {
                    res.json({ success: false, msg: 'Failed to update user !' });
                } else {
                   
                    res.json({ success: true, msg: 'User has been updated !' });
                }
            })
        }
    ])
});

//Add
router.post('/add', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var auth = authorization.authorUser(req.user, 'create', 'Normal User');
    if (auth.containAction && auth.containAppliedTo) return next();
    else return res.json({ success: false, msg: 'Unauthorized !' });
}, (req, res) => {
    async.waterfall([
        function(done) {
            auth.updatePermission(req.body, (user) => {
                var newUser = new User(user);
                if (!User.validateUser(newUser)) {
                    return res.json({ success: false, msg: 'Invalid user !' })
                } else {
                    done(null, newUser);
                }
            })
        },
        function(newUser, done) {
            User.getUser({ $or: [{ username: newUser.username }, { email: newUser.username }] },
                (err, user) => {
                    if (err) {
                        return res.json({ success: false, msg: 'Username has special character!' });
                    }
                    if (user) {
                        return res.json({ success: false, msg: 'Username or Email existed, please enter another one !' });
                    }
                    if (!user) {
                        let auth = authorization.authorUser(req.user, 'update', newUser.role)
                        if (!auth.containAppliedTo) {
                            return res.json({ success: false, msg: 'Unauthorized !' });
                        }
                        if (auth.containAppliedTo) {
                            done(err, newUser);
                        }
                    }
                })
        },
        function(newUser, done) {
            User.createUser(newUser, (err, user) => {
                if (err) {
                    res.json({ success: false, msg: 'Failed to add new user !' });
                } else {
                    res.json({ success: true, addedUser: newUser, msg: 'User has been added !' });
                }
            });
        }
    ])
})
// CHINH SUA, XOA AVATAR PROFILE
router.put('/profile/avatar', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.body.editType == 'EDIT_CURRENT_AVATAR') {
        let query;
        if (req.body.displayImageType == 'social') {
            query = { 'avatar.displayImageType': req.body.displayImageType }
        }
        if (req.body.displayImageType == 'local') {
            query = { 'avatar.displayImageType': req.body.displayImageType, 'avatar.local.displayImageID': req.body.displayImageID };
        }
        User.correctUser({ _id: req.user._id }, query, function(err) {
            if (err) throw err;
            return res.json({ success: true, msg: 'successfully' });
        })
    }

    if (req.body.editType == 'DELETE_AVATAR') {
        let deleteImageID = req.body.deleteImageID
        User.correctUser({ _id: req.user._id }, { $pull: { 'avatar.local.image': { _id: deleteImageID } } }, (err, docs) => {
            console.log('result: ' + JSON.stringify(docs))
            if (err) throw err;
            return res.json({ success: true, msg: 'successfully' });
        })
    }
})
//GET PROFILE , COPY ROUTE NAY
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    var avatar;
    let path_social = req.user.avatar.path_social;
    let arr_img = req.user.avatar.local.image
    let displayImageID = req.user.avatar.local.displayImageID;
    let displayImageType = req.user.avatar.displayImageType;
    for (let i = 0; i < arr_img.length; i++) {
        let path_local = arr_img[i].path_local;
        let typeImage = req.user.avatar.local.image[i].typeImage;
        let newPath = path_local.slice(0, 8) + path_local.slice(8, path_local.length);
        var base64Code = new Buffer(fs.readFileSync(newPath)).toString('base64');
        var prefix = 'data:' + typeImage + ';base64,';
        arr_img.splice(i, 1, { path_local: prefix + base64Code, typeImage: typeImage, _id: req.user.avatar.local.image[i]._id });
    }

    let profileUser = {
        username: req.user.username,
        name: req.user.name,
        role: req.user.role,
        email: req.user.email,
        permissions: req.user.permissions,
        avatar: {
            path_social: path_social,
            local: {
                image: arr_img,
                displayImageID: displayImageID
            },
            displayImageType: displayImageType
        },
        notification: req.user.notification
    }
    if(req.user.facebook){
        Object.assign(profileUser,{facebook: req.user.facebook})
    }
    if(req.user.google){
        Object.assign(profileUser,{google: req.user.google})
    }
    res.json(profileUser);
});


//respond list user on dashboard
router.get('/dashboard', passport.authenticate('jwt', { session: false }), (req, res) => {
    var query = {
        role: {
            $in: authorization.getAppliedToByAction(req.user, 'view')
        }
    }
    User.getAllUser(query, (err, docs) => {
        if (err) {
            res.json({ success: false, msg: 'Failed to load all users !' })
        } else {
            res.json({ success: true, all: docs });
        }
    })
})

router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    var id = req.params.id;
    var query = {
        _id: id,
        role: {
            $in: authorization.getAppliedToByAction(req.user, 'view')
        }
    }
    User.getUser(query, (err, user) => {
        if (err) {
            res.json({ success: false, msg: 'Invalid request !' })
        } else {
            if (!user) {
                res.json({ success: false, msg: 'User not exist !' });
            } else {
                res.json(user);
            }
        }
    })
});

//Delete user by id
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    var auth = authorization.authorUser(req.user, 'delete', 'Normal User');
    if (auth.containAction && auth.containAppliedTo) return next();
    else return res.json({ success: false, msg: 'Unauthorized !' });
}, (req, res) => {
    var query = {
        _id: req.params.id,
        role: {
            $in: authorization.getAppliedToByAction(req.user, 'delete')
        }
    }
    User.getUser(query, (err, user) => {
        if (err) {
            res.json({ success: false, msg: 'Invalid request !' })
        }
        if (!user) {
            res.json({ success: false, msg: 'User not exist !' });
        }
        if (user) {
            User.deleteUser({ _id: req.params.id }, (err) => {
                if (err) {
                    res.json({ success: false, msg: 'Failed to delete user !' });
                } else {
                    res.json({ success: true, msg: 'User has been removed !' });
                }
            })
        }
    })
});

//check login by token and respond new token
router.post('/checklogin', (req, res, next) => {
    var token = req.body.token;
    token = token.slice(4, token.length);
    try {
        var decoded = jwt.verify(token, config.secret);
        var expireTime = decoded.exp;
        if (expireTime * 1000 <= Date.now()) {
            console.log(Date.now());
            console.log(expireTime * 1000);
            res.json({ success: false, msg: "Token Expired !" })
        } else {
            var id = decoded._doc._id;
            User.getUser({ _id: id }, (err, user) => {
                if (err) throw err;
                if (!user) {
                    res.json({ success: false, msg: 'Invalid token !' });
                } else {
                    const newToken = jwt.sign(user, config.secret, {
                        expiresIn: 3600 // 1 hour
                    });
                    res.json({ success: true, token: 'JWT ' + newToken });
                }
            });
        }
    } catch (err) {
        res.json({ success: false, msg: "Invalid Token !" });
    }
});

router.put('/updatepermission/alluser', passport.authenticate('jwt', { session: false }), (req, res, next) => {
        if (req.user.role == 'Admin') return next();
        else return res.json({ success: false, msg: 'Unauthorized' });
    }, (req, res) => {
        User.getAllUser({}, (err, docs) => {
            for (let i in docs) {
                auth.updatePermission(docs[i], (user) => {
                    console.log('up: '+JSON.stringify(user))
                    User.correctUser({ username: user.username }, user, (err, result) => {
                        if (err) throw err;
                        if (!err && i == docs.length - 1) {
                            return res.json({ success: true, msg: 'Update permissions of all users successfully !' });
                        }
                    });
                })
            }
        })
    }

)
//UPLOAD IMAGE
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
})


router.post('/upload/image', passport.authenticate('jwt', { session: false }),
    function(req, res, next) {
        //config storage and image type
        var upload = multer({
            storage: storage,
            fileFilter: function(req, file, callback) {
                var ext = path.extname(file.originalname);
                if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                    res.send({ success: false, msg: 'Only images are allowed' })
                    return callback(null, false);
                }
                callback(null, true)
            },
            limits: {
                fileSize: 1024000
            }
        }).any();

        //upload image to uploads folder
        upload(req, res, function(err) {
            if (err) {
                if (err.code == 'LIMIT_FILE_SIZE') {
                    res.send({ success: false, msg: 'Max size of image is 2 MB' });
                }
            }
            if (req.files[0] != undefined || null) {
                let editAvatarInfo = {
                    'avatar.displayImageType': 'local',
                    $push: { 'avatar.local.image': { path_local: req.files[0].path, typeImage: req.files[0].mimetype } }
                }
                User.correctUser({ _id: req.user._id }, editAvatarInfo, (err, user) => {
                    let length = user.avatar.local.image.length;
                    User.correctUser({ _id: req.user._id }, { 'avatar.local.displayImageID': user.avatar.local.image[length - 1]._id }, (err, re) => {
                        var base64Code = new Buffer(fs.readFileSync(req.files[0].path)).toString('base64');
                        let prefix = 'data:' + req.files[0].mimetype + ';base64,';
                        res.json({ success: true, base64ImageData: prefix + base64Code, imageID: re.avatar.local.displayImageID });
                    })
                    if (err) throw err;

                })
            }

        })

    })

module.exports = router;