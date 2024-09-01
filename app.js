const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require("express-session");
const mongojs = require("mongojs");

const app = express();

// MongoDB 연결 설정
const db = mongojs('user', ['users']);

app.set('port', 3000);
app.set("views", "views");
app.set("view engine", "ejs");

// 외부 정적 파일 경로 설정
app.use(express.static("public"));
app.use('/uploads', express.static("uploads"));

// POST 방식으로 파라미터 전달 받기 위한 설정
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// 쿠키 및 세션 설정
app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

const router = express.Router();

app.get('/', (req, res) => {
    if (db) {
        db.users.find((err, result) => { 
            if (err) {
                throw err;
            }
            const memberList = result.map(data => ({
                id: data.id,
                password: data.pw,
                name: data.name,
            }));

            res.render('index', { members: memberList });
        });
    } else {
        res.end("DB가 연결되지 않았습니다!");
    }
});


router.route("/home").get((req, res) => {
    req.app.render("home/Home", {}, (err, html) => {
        res.end(html);
    });
});

router.route("/login").get((req, res) => {
    req.app.render("member/Login", {}, (err, html) => {
        res.end(html);
    });
});

router.route("/login").post((req, res) => {
    const { id, pw} = req.body;
    
    db.users.findOne({ id }, (err, user) => {
        if (err) throw err;

        if (user && user.pw === pw) {
            console.log("로그인 성공!"); 

            req.session.user = {
                id: user.id,
                name: user.name,
                pw: user.pw
            };

            res.redirect("/index.html");
        } else {
            console.log("로그인 실패! 계정이 없거나 패스워드가 맞지 않습니다.");
            res.redirect("/login");
        }
    });
});

router.route("/logout").get((req, res) => {
    console.log("GET - /logout 호출 ...");
    
    if(req.session.user) {
        req.session.destroy((err) => {
            if(err) throw err;
            console.log("로그아웃 성공!");
            res.redirect("/login");
        });
    } else {
        console.log("아직 로그인 전 상태입니다.");
        res.redirect("/login");
    }
});

router.route("/joinus").get((req, res) => {
    req.app.render("member/Joinus", {}, (err, html) => {
        res.end(html);
    });
});

router.route("/joinus").post((req, res) => {
    const { id, pw, name} = req.body;
    
    db.users.insertOne({ id: id, pw : pw, name : name}, (err, user) => {
        if (user){console.log("회원가입 성공")} ;
        if (err) throw err;
        res.redirect("/index.html");
    });
});

app.use('/', router);

// 404 오류 처리
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// 서버 생성 및 실행
const server = http.createServer(app);
server.listen(app.get('port'), () => {
    console.log(`Run on server >>> http://localhost:${app.get('port')}`);
});
