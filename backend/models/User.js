const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const saltRounds = 10
const jwt = require('jsonwebtoken');

const imageSchema = new mongoose.Schema({
    width : Number,
    height : Number,
  });

  const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    birthday : {
        type : Date,
        required : true
    },
    phonenumber : {
        type : Number,
        required : true,
        unique : true
    },
    password : {
        type: String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    friends : {
        type : Array
    },
    image : imageSchema
    , 
    d_day : {
        type : Number
    },
    token: {
        type: String
    },
    tokenExp : {
        type : Number,
    },
});

userSchema.pre('save',function(next){
    var user = this;
    if(user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function(err,salt){
            if(err) return next(err)
            bcrypt.hash(user.password,salt,function(err,hash){
                if (err) return next(err)
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
})

userSchema.methods.comparePassword = function(plainPassword,cb) {
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch)
    })
}
userSchema.statics.findByToken = function(token, cb) {
    var user = this;

    jwt.verify(token, 'secretToken', function(err, decoded) {
        // 유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id": decoded, "token": token}, function(err, user) {
            if(err) return cb(err);
            cb(null, user)
        })
    })
}
userSchema.methods.generateToken = function(cb){
    var user = this;
    //토큰 생성하기
    var token = jwt.sign(user._id.toHexString(),'secretToken')
    //user._id + 'secretToken' = token
    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })

}

const User = mongoose.model('User', userSchema);
module.exports = {User};
