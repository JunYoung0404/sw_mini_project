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

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

const router = express.Router();

// 영화 데이터와 리뷰를 저장할 배열
const movies = [
    { id: 1, title: 'movie1', image: '/images/movie1.png' },
    { id: 2, title: 'movie2', image: '/images/movie2.png' },
    { id: 3, title: 'movie3', image: '/images/movie3.png' },
];

const reviews = [];

// 홈 페이지
router.get('/', (req, res) => {
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

            res.render('index', { movies, members: memberList });
        });
    } else {
        res.end("DB가 연결되지 않았습니다!");
    }
});

// 영화 리뷰 페이지 (리뷰 폼 포함)
router.get('/movies/:id', (req, res) => {
    const movieId = req.params.id;
    const movie = movies.find(m => m.id == movieId);
    const movieReviews = reviews.filter(r => r.movieId == movieId);

    if (movie) {
        res.render('review', { movie, movieReviews });
    } else {
        res.status(404).send('Movie not found');
    }
});

// 리뷰 작성 처리
router.post('/movies/:id/reviews', (req, res) => {
    const movieId = req.params.id;
    const { rating, comment, details } = req.body;

    const newReview = {
        id: reviews.length + 1,
        movieId: parseInt(movieId),
        rating,
        comment,
        details
    };

    reviews.push(newReview);
    res.redirect(`/movies/${movieId}`);
});

// 리뷰 삭제
router.post('/movies/:movieId/reviews/:reviewId/delete', (req, res) => {
    const { movieId, reviewId } = req.params;
    const reviewIndex = reviews.findIndex(r => r.id == reviewId && r.movieId == movieId);

    if (reviewIndex !== -1) {
        reviews.splice(reviewIndex, 1);
    }
    res.redirect(`/movies/${movieId}`);
});

// 리뷰 수정
router.post('/movies/:movieId/reviews/:reviewId/edit', (req, res) => {
    const { movieId, reviewId } = req.params;
    const { rating, comment, details } = req.body;

    const review = reviews.find(r => r.id == reviewId && r.movieId == movieId);

    if (review) {
        review.rating = rating;
        review.comment = comment;
        review.details = details;
    }

    res.redirect(`/movies/${movieId}`);
});

// 로그인, 로그아웃, 회원가입 관련 라우트
router.route("/login").get((req, res) => {
    req.app.render("member/Login", {}, (err, html) => {
        res.end(html);
    });
});

router.route("/login").post((req, res) => {
    const { id, pw } = req.body;

    db.users.findOne({ id }, (err, user) => {
        if (err) throw err;

        if (user && user.pw === pw) {
            console.log("로그인 성공!");

            req.session.user = {
                id: user.id,
                name: user.name,
                pw: user.pw
            };

            res.redirect("/member");
        } else {
            console.log("로그인 실패! 계정이 없거나 패스워드가 맞지 않습니다.");
            res.redirect("/login");
        }
    });
});

router.route("/logout").get((req, res) => {
    console.log("GET - /logout 호출 ...");

    if (req.session.user) {
        req.session.destroy((err) => {
            if (err) throw err;
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
    const { id, pw, name } = req.body;

    db.users.insertOne({ id: id, pw: pw, name: name }, (err, user) => {
        if (user) {
            console.log("회원가입 성공");
        };
        if (err) throw err;
        res.redirect("/member");
    });
});

// 멤버 페이지 (회원 목록)
router.route("/member").get((req, res) => {
    if (req.session.user) {
        const user = req.session.user;

        db.users.find((err, result) => {
            if (err) {
                throw err;
            }

            const members = result.map(data => ({
                id: data.id,
                password: data.pw,
                name: data.name,
            }));

            req.app.render("member/Member", { members, user }, (err, html) => {
                if (err) {
                    throw err;
                }
                res.end(html);
            });
        });
    } else {
        res.redirect("/login");
    }
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
