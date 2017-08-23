const mongoose = require('mongoose');
const async = require('async');

const Auth_itemSchema = mongoose.Schema({
  id : Number,
  name : String,
  appliedTo : String
})

const Auth_assignSchema = mongoose.Schema({
  parent : Number,
  child : Number,
})

const Auth_item = mongoose.model('Auth_item', Auth_itemSchema,'Auth_item');
const Auth_assign = mongoose.model('Auth_assign', Auth_assignSchema,'Auth_assign');

module.exports.updatePermission = function(user,callback){
  var roleName = null;
  if(user.role == undefined){
    roleName = 'Normal User';
  } else {
    roleName = user.role;
  }
  async.waterfall([
    function(done){
      Auth_item.find({name : roleName},'id',function(err,result_1){
        done(err,result_1);
      })
    },
    function(result_1,done){
      Auth_assign.find({parent : result_1[0].id},'-_id child',function(err,result_2){
        var arr_firstChild = [];
        for(let i in result_2){
          arr_firstChild.push(result_2[i].child);
        }   
        done(err,arr_firstChild);     
      })
    },
    function(arr_firstChild,done){
      Auth_assign.find({parent: {$in: arr_firstChild}}, function(err,result_3){
        var arr_secondChild = [];
        for(let i in result_3){
          arr_secondChild.push(result_3[i].child);
        }
        let query = {id: {$in: arr_secondChild}};
        if(arr_secondChild.length == 0){ query = {id: {$in: arr_firstChild}}};  
        done(err,query);
      })   
    },
    function(query,done){
      Auth_item.find( query, function(err,result_4){
        if(err) throw err;
        let arr_perm = [];

        for(let i in result_4){
          let objPerm = {
              action: null,
              appliedTo: null
          }
          objPerm.action = result_4[i].name;
          objPerm.appliedTo = result_4[i].appliedTo;
          arr_perm.push(objPerm);
        }

        var newUser = {
          name : user.name,
          username : user.username,
          email: user.email,
          password : user.password,
          role: user.role,
          permission: arr_perm
        }

        done(err,newUser);   
      })
    }],function(err,newUser){
      if(err) throw err;
      return callback(newUser);
    }
  )
}