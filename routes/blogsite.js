const express = require("express");

const router = express.Router();

const blogsiteControllers = require("../controllers/blogsite");
const isAuth = require("../middleware/is_auth");


router.get("/", blogsiteControllers.getHome);

router.get("/about", blogsiteControllers.getAbout);

router.get("/blogs", blogsiteControllers.getBlogs);

router.get("/post/:blogId", blogsiteControllers.getPost);
router.get("/test", isAuth, blogsiteControllers.getTest);

router.get("/author_bio/:authId", blogsiteControllers.getAuthorBio);

router.post("/submit_comment", isAuth, blogsiteControllers.postSubmitComment);
router.get("/success_comment",  isAuth, blogsiteControllers.getSuccessComment);

router.get("/contact",  blogsiteControllers.getContact);

router.get("/login", blogsiteControllers.getLogin);
router.post("/login", blogsiteControllers.postLogin)

router.get("/register", blogsiteControllers.getRegister);
router.post("/register", blogsiteControllers.postRegister);

router.post("/love", blogsiteControllers.postLove);

module.exports = router;
