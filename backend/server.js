const express = require("express");
const app = express(); 
const mongoose = require("mongoose"); // mongoose 모듈을 불러온다.
const port = 8000;
const bodyParser = require("body-parser"); //bodyparser 다운받기
const cookieParser = require('cookie-parser');
const {User} = require("./models/User");
const cors = require("cors");
const db = require("./config/db");

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.set('strictQuery',true)
mongoose.connect(db.mongoURI,{dbName:"wish"})
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => console.log(err))
app.post('/register',(req,res) => {
    const user = new User(req.body)
    user.save((err,doc) => {
        if(err) return res.json({success : false, err})
        return res.status(200).json({
            success : true
        })
    })
})

app.post('/login', (req, res) => {
    User.findOne({email:req.body.email}, (err,user) =>{
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        user.comparePassword(req.body.password, (err,isMatch) => {
            if(!isMatch)
                return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
            //토큰 생성하기 위해 npm install jsonwebtoken --save 다운받기
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
                
                //토큰 저장 - 쿠키(쿠키 or local storage)
                //npm install cookie-parser --save 쿠키parser 다운받기
                res.cookie("x_auth",user.token)
                .status(200)
                .json({loginSuccess: true, userId: user.email})
            })         

        })
    })
})

app.get('/getFriendsList', (req, res) => {
    User.findOne({email: req.params.email}, (err, user) => {
        if(!user) {
            return
        }
        return res.json({
            "code": 200,
            "friendsList": user.friendsList
        })
    })
})
app.get('/getUserInfo', (req, res) => {
    User.findOne({email: req.params.email}, (err, user) => {
        if(!user) {
            return
        }
        return res.json({
            "code": 200,
            "username" : user.name,
            "profile_img": user.image,
            "d_day": user.d_day
        })
    })
})
app.get('/addFriend', (req, res) => {
    User.findOne({email: req.params.email}, (err, user) => {
        if(!user) {
            return
        }
        user.friends.push(req.params.newFriendemail)
        return res.json({
            "code": 200,
            "result": success
        })
    })
});


app.listen(port,() => console.log('listening on port ${port}!'))