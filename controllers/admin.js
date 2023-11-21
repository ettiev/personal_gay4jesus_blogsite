const bcrypt = require("bcrypt");

const Blog = require("../models/blog");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.getAdminDashboard = (req, res, next) => {
    let loveTotal = 0;
    let viewTotal = 0;
    let postDraftTotal = 0;
    let commentDraftTotal = 0;
    Blog.aggregate([{
        $group : {
            _id: null,
            loveCount : { $sum : "$love" },
            viewCount : { $sum : "$views"}
        }
    }])
    .then(result => {
        loveTotal = result[0].loveCount;
        viewTotal = result[0].viewCount;
    })
    .then(() => {  
        Blog.countDocuments({published : false})
        .then(result => {
            postDraftTotal = result;
        });
        Comment.countDocuments({approved : false})
        .then(result => {
            commentDraftTotal = result;
        });
    }).then(() => {  
        Blog.countDocuments({})
            .then (blogCount => {
                User.countDocuments({})
                .then(userCount => {
                    Comment.countDocuments({})
                    .then(commentCount => {
                        res.render("admin/admin_dashboard", {
                            user: req.session.user,
                            isLoggedIn: req.session.isLoggedIn,
                            page: 'admin_dash',
                            allPosts: blogCount,
                            allUsers: userCount,
                            allLoves: loveTotal,
                            allViews: viewTotal,
                            allComments: commentCount,
                            allPostDrafts: postDraftTotal,
                            allCommentDrafts: commentDraftTotal
                        })
                    })        
                })
            })  
            .catch (err => console.log(err));
        })   
}

exports.getAdminAllPosts = (req, res, next) => {
    Blog.find({}).then(function(blogs){
        let reverseBlogs = [];
        blogs.forEach((blog) => {
            reverseBlogs = [blog, ...reverseBlogs];
        });
        res.render("admin/admin_all_posts", {
            blogs: reverseBlogs,
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'admin_posts'
        });
    });
}

exports.getEditPost = (req, res, next) => {
    const blogId = req.params.postId;
    Blog.findOne({_id: blogId})
    .then( blog => {
        res.render("admin/edit_post", {
            blog: blog,
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'admin_posts'
        });    
    }).catch(
        err => console.log(err)
    )
}

exports.postEditPost = (req, res, next) => {
    const blogId = req.body.blogId;
    const location = req.body.authorLocation;
    const title = req.body.blogTitle;
    const content = req.body.blogContent;
    Blog.findOneAndUpdate({
        _id: blogId
    },{
        title: title,
        location: location,
        content: content,
    }).then(result => {
        res.redirect("/admin/admin_all_posts");
    }).catch(
        err => console.log(err)
    )    
}

exports.getUnapprovePost = (req, res, next) => {       // [not working]
    const postId = req.params.postId;
    Blog.findOneAndUpdate({ 
        _id : postId
    }, { 
        published : false 
    }).then(result => {
        res.redirect("/admin/admin_all_posts");    
    }).catch(
        err => console.log(err)
    )
}

exports.getApproved = (req, res, next) => {       // [not working]
    const postId = req.params.postId;
    Blog.findOneAndUpdate({ 
        _id : postId 
    }, { 
        published : true 
    }).then(result => {
        res.redirect("/admin/admin_all_posts");    
    }).catch(
        err => console.log(err)
    )
}

exports.getDeletePost = (req, res, next) => {       // [not working]
    const postId = req.params.postId;
    Blog.findOneAndDelete({ 
        _id : postId
    }).then(deletedBlog => {
        Comment.deleteMany({blogpost: postId})
        .then(result => {console.log("Comments deleted")})
        .catch((err => {console.log(err)}));
        User.findOne({username: deletedBlog.author})
        .then(userUpdated => {
            const result = userUpdated.posts.filter((post) => {
                return post != postId
            })
            userUpdated.posts = result;
            userUpdated.save();
        })
        res.redirect("/admin/admin_all_posts");    
    }).catch(
        err => console.log(err)
    )
}

exports.getAdminAllComments = (req, res, next) => {
    Comment.find()
    .then(comments => {
            res.render("admin/admin_all_comments", {
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'admin_comments',
            comments: comments,
            show_modal: false
        });
    }).catch(
        err => console.log(err)
    );
}

exports.getUnapproveComment = (req, res, next) => {       // [not working]
    const commentId = req.params.commentId;
    Comment.findOneAndUpdate({ 
        _id : commentId 
    }, { 
        approved : false 
    }).then(result => {
        res.redirect("/admin/admin_all_comments");    
    }).catch(
        err => console.log(err)
    )
}

exports.getApproveComment = function(req, res, next){       // [not working]
    const commentId = req.params.commentId;
    Comment.findOneAndUpdate({ 
        _id : commentId 
    }, { 
        approved : true 
    }).then(result => {
        res.redirect("/admin/admin_all_comments");    
    }).catch(
        err => console.log(err)
    )
}

exports.getEditComment = (req, res, next) => {
    const commentId = req.params.commentId;
    Comment.findOne({_id: commentId})
    .then(comment =>{
        res.render("admin/edit_comment", {
            comment: comment,
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'admin_comments'
        });    
    }).catch(
        err => console.log(err)
    )
}

exports.postEditComment = (req, res, next) => {
    const commentId = req.body.commentId;
    const comment = req.body.comment;
    Comment.findOneAndUpdate({_id: commentId}, {comment: comment})
    .then(result => {
        res.redirect("/admin/admin_all_comments");    
    }).catch(
        err => console.log(err)
    )            
}

exports.getDeleteComment = (req, res, next) => {       // [not working]
    const commentId = req.params.commentId;
    Comment.findOneAndDelete({ 
        _id : commentId 
    }).then(result => {
        res.redirect("/admin/admin_all_comments");    
    }).catch(
        err => console.log(err)
    )
}

exports.getAdminAllUsers = (req, res, next) => {
    User.find({})
    .then( result => {
        const users = result;
        res.render("admin/admin_all_users", {
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'admin_users',
            users: users
        });
    })
}

exports.getEditUser = (req, res, next) => {
    const userId = req.params.userId;
    User.findOne({_id: userId})
    .then(user => {
        res.render("admin/edit_user", {
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'admin_users',
            user_edit: user
        });    
    })
}

exports.postEditUser = (req, res, next) => {
    const userId = req.body.userId;
    const username = req.body.username;
    const firstName = req.body.userFirstName;
    const lastName = req.body.userLastName;
    const role = req.body.userRole
    const email = req.body.userEmail;
    const location = req.body.userLocation;
    const bio = req.body.userBio;
    const password = req.body.password;
    if (password.length > 0) {
        bcrypt.hash(password, 12, function(err, hashedPassword) {    
            if (err) {
                console.log(err)
            } else {
                User.findOneAndUpdate({
                    _id: userId
                },{
                    password: hashedPassword
                })    
            }
        })    
    } 
    User.findOneAndUpdate({
        _id: userId
    },{
        username: username,
        firstName: firstName,
        lastName: lastName,
        role: role,
        email: email,
        location: location,
        bio: bio
    }).then(result => {
        res.redirect("/admin/admin_all_users");
    }).catch(
        err => console.log(err)
    )
}

exports.getDeleteUser = (req, res, next) => {
    const userId = req.params.userId;
    User.findOneAndDelete({ 
        _id : userId 
    }).then(result => {
        res.redirect("/admin/admin_all_users");    
    }).catch(
        err => console.log(err)
    )    
}

exports.getDashboard = (req, res, next) => {
    let loveTotal
    let viewTotal
    let postDraftTotal = 0;
    const currentUser = req.session.user.username;
    Blog.aggregate([{
        $match: {
            author: currentUser
        }}, {
        $group : {
            _id: null,
            loveCount : { $sum : "$love" },
            viewCount : { $sum : "$views"}
        }
    }])
    .then(result => {
        if (result.length <= 0) {
            loveTotal = 0
            viewTotal = 0    
        } else {
            loveTotal = result[0].loveCount;
            viewTotal = result[0].viewCount;
        }
    })
    .then(() => {   
        Blog.countDocuments({author: currentUser, published: false})
        .then(result => {
            if (!result) {
                postDraftTotal = 0
            } else {
                return postDraftTotal = result;    
            }
        })
    }).then(() => {  
        Blog.countDocuments({author: req.session.user.username})
            .then (blogCount => {
                res.render("admin/dashboard", {
                    user: req.session.user,
                    isLoggedIn: req.session.isLoggedIn,
                    page: 'dashboard',
                    allPosts: blogCount,
                    allLoves: loveTotal,
                        allViews: viewTotal,
                        allPostDrafts: postDraftTotal,
                });
            })  
            .catch (err => console.log(err));
    })   
}

exports.getComments = (req, res, next) => {
    const currentUser = req.session.user.username;
    let blogList = [];
    User.findOne({username: currentUser})
    .then(user => {
        return blogList = user.posts;
    }).then(() => {
        Comment.find({ blogpost : {"$in": blogList} })
        .then(comments => {
            //console.log(comments)
            res.render("admin/comments", {
                user: req.session.user,
                isLoggedIn: req.session.isLoggedIn,
                page: 'comments',
                comments: comments,
                show_modal: false             
            })
        })
    })
    .catch(
        (err) => {console.log(err)}
    )    
}

exports.getUnapproveCommentOwnPost = (req, res, next) => {       // [not working]
    const commentId = req.params.commentId;
    Comment.findOneAndUpdate({ 
        _id : commentId 
    }, { 
        approved : false 
    }).then(result => {
        res.redirect("/admin/comments");    
    }).catch(
        err => console.log(err)
    )
}

exports.getApproveCommentOwnPost = function(req, res, next){       // [not working]
    const commentId = req.params.commentId;
    Comment.findOneAndUpdate({ 
        _id : commentId 
    }, { 
        approved : true 
    }).then(result => {
        res.redirect("/admin/comments");    
    }).catch(
        err => console.log(err)
    )
}

exports.getDeleteCommentOwnPost = (req, res, next) => {       // [not working]
    const commentId = req.params.commentId;
    Comment.findOneAndDelete({ 
        _id : commentId 
    }).then(result => {
        res.redirect("/admin/comments");    
    }).catch(
        err => console.log(err)
    )
}

exports.getPosts = (req, res, next) => {
    const currentUser = req.session.user.username
    Blog.find({author: currentUser}).then(function(blogs){
        let reverseBlogs = [];
        blogs.forEach((blog) => {
            reverseBlogs = [blog, ...reverseBlogs];
        });
        res.render("admin/user_posts", {
            blogs: reverseBlogs,
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'posts'
        });
    });
}

exports.getEditOwnPost = (req, res, next) => {
    const blogId = req.params.postId;
    Blog.findOne({_id: blogId})
    .then( blog => {
        res.render("admin/edit_own_post", {
            blog: blog,
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'posts'
        });    
    }).catch(
        err => console.log(err)
    )
}

exports.postEditOwnPost = (req, res, next) => {
    const blogId = req.body.blogId;
    const location = req.body.authorLocation;
    const title = req.body.blogTitle;
    const content = req.body.blogContent;
    Blog.findOneAndUpdate({
        _id: blogId
    },{
        title: title,
        location: location,
        content: content,
    }).then(result => {
        res.redirect("/admin/posts");
    }).catch(
        err => console.log(err)
    )    
}

exports.getDeleteOwnPost = (req, res, next) => {       
    const postId = req.params.postId;
    Blog.findOneAndDelete({ 
        _id : postId
    }).then(result => {
        Comment.deleteMany({blogpost: postId})
        .then(result => {console.log("Comments deleted")})
        .catch((err => {console.log(err)}));
        User.findOne({username: deletedBlog.author})
        .then(userUpdated => {
            const result = userUpdated.posts.filter((post) => {
                return post != postId
            })
            userUpdated.posts = result;
            userUpdated.save();
        })        
        res.redirect("/admin/posts");    
    }).catch(
        err => console.log(err)
    )
}

exports.getSubmit = (req, res, next) => {
    res.render("admin/submit", {
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn,
        page: 'submit',
        errors: '',
        oldData: {
            title: "",
            location: "",
            content: ""       
        }
    });
}

exports.postSubmit = (req, res, next) => {
    const validationErrors = [];
    const currentUser = req.session.user.username;
    const currentUserRole = req.session.user.role;
    const authorBlog = req.body.blogAuthor;
    const titleBlog = req.body.blogTitle;
    const contentBlog = req.body.blogContent;
    const locationBlog = req.body.authorLocation;
    const day = new Date().toLocaleDateString('en-us', { day:"numeric"});
    const month = new Date().toLocaleDateString('en-us', { month:"long"});
    const year = new Date().toLocaleDateString('en-us', { year:"numeric"});
    const dateBlog = day + " " + month + " " + year;
    const newBlogpost = new Blog ({
        title: titleBlog,
        author: authorBlog,
        location: locationBlog,
        date: dateBlog,
        content: contentBlog,
        views: 0, 
        love: 0,
        published: false
    });

    if (titleBlog.length < 3) {
        validationErrors.push("Please enter a valid title!")
    }

    if (locationBlog.length < 2) {
        validationErrors.push("Please enter a valid location!")
    }
    
    if (contentBlog.length < 50) {
        validationErrors.push("Your blogpost is too short!")
    }  

    if (validationErrors.length != 0) {
        res.render("admin/submit", {
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'submit',
            errors: validationErrors,
            oldData: {
                title: titleBlog,
                location: locationBlog,
                content: contentBlog       
            }
        });    
    } else {
        User.findOne({username: currentUser})
        .then(user => {
            if (currentUserRole === "subscriber") {
                user.role = "contributor"
                req.session.user.role = "contributor"
                req.session.save();
            }
            user.posts.push(newBlogpost._id);
            user.markModified(user.posts);
            user.save();
        })
        newBlogpost.save();
        res.redirect("/admin/success");    
    }
}

exports.getSuccess = (req, res, next) => {
    res.render("admin/success", {
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn,
        page: 'submit'
    });
}

exports.getProfile = (req, res, next) => {
    res.render("admin/profile", {
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn,
        page: 'profile'
    });
}

exports.postEditProfile = (req, res, next) => {
    const username = req.body.username;
    const firstName = req.body.userFirstName;
    const lastName = req.body.userLastName;
    const email = req.body.userEmail;
    const location = req.body.userLocation;
    const bio = req.body.userBio;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (password.length > 0) {
        if (password === confirmPassword) {
            bcrypt.hash(password, 12, function(err, hashedPassword) {
                if (err) {
                    console.log(err);
                } else {
                    User.findOneAndUpdate({
                        username: username
                    },{
                        password: hashedPassword
                    }).then(result => {
                        console.log("Password changed!")
                    }).catch(err => {
                        console.log(err)
                    })
                } 
            })
        } else {
            throw new Error("The passwords you entered do not match!")
        }
    }    
    User.findOneAndUpdate({
        username: username
    },{
        firstName: firstName,
        lastName: lastName,
        email: email,
        location: location,
        bio: bio
    }).then( result => {
        req.session.user.firstName = firstName;
        req.session.user.lastName = lastName;
        req.session.user.email = email;
        req.session.user.location = location;
        req.session.user.bio = bio;
        req.session.save();
        res.redirect("/admin/dashboard");
    }).catch(
        err => console.log(err)
    )
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {console.log(err)};
        res.redirect("/");
    })
}
