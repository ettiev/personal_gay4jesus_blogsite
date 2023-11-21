const express = require("express");

const router = express.Router();

const isAuth = require("../middleware/is_auth");
const isAdmin = require("../middleware/is_admin");
const adminControllers = require("../controllers/admin")

router.get("/admin_dashboard", isAdmin, adminControllers.getAdminDashboard);

router.get("/admin_all_posts", isAdmin, adminControllers.getAdminAllPosts);
router.get("/edit_post/:postId", isAdmin, adminControllers.getEditPost);
router.post("/edit_post", isAdmin, adminControllers.postEditPost);
router.get("/unapprove_post/:postId", isAdmin, adminControllers.getUnapprovePost);
router.get("/approve_post/:postId", isAdmin, adminControllers.getApproved);
router.get("/delete_post/:postId", isAdmin, adminControllers.getDeletePost);

router.get("/admin_all_comments", isAdmin, adminControllers.getAdminAllComments);
router.get("/edit_comment/:commentId", isAdmin, adminControllers.getEditComment);
router.post("/edit_comment/", isAdmin, adminControllers.postEditComment);
router.get("/unapprove_comment/:commentId", isAdmin, adminControllers.getUnapproveComment);
router.get("/approve_comment/:commentId", isAdmin, adminControllers.getApproveComment);
router.get("/delete_comment/:commentId", isAdmin, adminControllers.getDeleteComment);

router.get("/admin_all_users", isAdmin, adminControllers.getAdminAllUsers);
router.get("/edit_user/:userId", isAdmin, adminControllers.getEditUser)
router.post("/edit_user", isAdmin, adminControllers.postEditUser);
router.get("/delete_user/:userId", isAdmin, adminControllers.getDeleteUser);

router.get("/dashboard", isAuth, adminControllers.getDashboard);   

router.get("/comments", isAuth, adminControllers.getComments);
router.get("/unapprove_comment_ownpost/:commentId", isAuth, adminControllers.getUnapproveCommentOwnPost);
router.get("/approve_comment_ownpost/:commentId", isAuth, adminControllers.getApproveCommentOwnPost);
router.get("/delete_comment_ownpost/:commentId", isAuth, adminControllers.getDeleteCommentOwnPost);

router.get("/posts", isAuth, adminControllers.getPosts);
router.get("/edit_ownpost/:postId", isAuth, adminControllers.getEditOwnPost);
router.post("/edit_ownpost/", isAuth, adminControllers.postEditOwnPost);
router.get("/delete_ownpost/:postId", isAuth, adminControllers.getDeleteOwnPost);

router.get("/submit", isAuth, adminControllers.getSubmit);
router.post("/submit", isAuth, adminControllers.postSubmit);
router.get("/success", isAuth, adminControllers.getSuccess);

router.get("/profile", isAuth, adminControllers.getProfile);
router.post("/edit_profile", isAuth, adminControllers.postEditProfile);

router.post("/logout", isAuth, adminControllers.postLogout);

module.exports = router;