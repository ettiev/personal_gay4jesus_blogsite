const bcrypt = require("bcrypt");

const Blog = require("../models/blog");
const User = require("../models/user");
const Comment = require("../models/comment");

exports.getHome = (req, res, next) => {
    res.render("home", {
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn,
        page: 'home'
    });
}

exports.getAbout = (req, res, next) => {
    res.render("about", {
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn,
        page: 'about'
    });
}

exports.getBlogs = (req, res, next) => {
    Blog.find({}).then(function(blogs){
        //console.log(blogs);
        let reverseBlogs = [];
        blogs.forEach((blog) => {
            reverseBlogs = [blog, ...reverseBlogs];
        });
        res.render("blogposts", {
            blogs: reverseBlogs,
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'posts'
        });
    });
}

exports.getPost = (req, res, next) => {
    const requestedBlog = req.params.blogId;
    let comments = [];
    Comment.find({blogpost: requestedBlog})
    .then(foundComments => {
        if (!foundComments) {
            comments = []
        } else {
            comments = foundComments
        }
    }).then(() => {    
        Blog.findOne({_id: requestedBlog})
        .then((foundBlog) => {
            if (!foundBlog){
                res.redirect("/error");
            } else {
                foundBlog.views = foundBlog.views + 1;
                foundBlog.save();
            }    
        return foundBlog;     
        }).then((foundBlog) => {        
                console.log(foundBlog);
                User.findOne({username: foundBlog.author})
                .then(author => {
                    console.log(author);
                    res.render("post", {
                        blog: foundBlog,
                        user: req.session.user,
                        isLoggedIn: req.session.isLoggedIn,
                        page: 'posts',
                        comments: comments,
                        authorId: author._id
                    });    
                })
         
        }).catch(err => console.log(err))
    })
}

exports.postSubmitComment = (req, res, next) => {
    const author = req.body.user;
    const comment = req.body.comment;
    const blogpost = req.body.blogpost;
    const blogpost_title = req.body.blogpost_title;
    const day = new Date().toLocaleDateString('en-us', { day:"numeric"});
    const month = new Date().toLocaleDateString('en-us', { month:"long"});
    const year = new Date().toLocaleDateString('en-us', { year:"numeric"});
    const dateComment = day + " " + month + " " + year;        
    if (req.session.isLoggedIn) {
        const newComment = new Comment({
            author: author,
            date: dateComment,
            comment: comment,
            blogpost: blogpost,
            blogpost_title: blogpost_title, 
            approved: false
        });
        newComment.save();
        res.redirect("/success_comment");
    }
}

exports.getAuthorBio = (req, res, next) => {
    const authorId = req.params.authId;
    User.findOne({_id: authorId})
    .then(author => {
        Blog.find({author: author.username, published: true})
        .then(blogs => {
            let reverseBlogs = [];
            blogs.forEach((blog) => {
                reverseBlogs = [blog, ...reverseBlogs];
            });
            res.render("author_bio", {
                user: req.session.user,
                isLoggedIn: req.session.isLoggedIn,
                page: 'posts',
                blogs: reverseBlogs,
                author: author
            });
        })
    })
}

exports.getSuccessComment = (req, res, next) => {
    res.render("success_comment", {
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn,
        page: 'posts'
    });
}

exports.getTest = (req, res, next) => {
    res.render("test", {
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn,
        page: 'test'
    });
}

exports.getContact = (req, res, next) => {
    res.render("contact", {
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn,
        page: 'contact'
    });
}

exports.getLogin = (req, res, next) => {
    res.render("login", {
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn,
        page: 'login',
        error: ''
    });
}

exports.postLogin = (req, res, next) => { 
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    User.findOne({email: userEmail}
    ).then(foundUser => {
        if (!foundUser){
            return (
                res.render("login", {
                    user: req.session.user,
                    isLoggedIn: req.session.isLoggedIn,
                    page: 'login',
                    error: 'The email you entered was not found!'
                })
            )
        } else {
            const dbPassword = foundUser.password
            bcrypt.compare(userPassword, dbPassword, function(err, result) {
                if (err) {
                    console.log(err)
                } 
                if (result) {
                    req.session.isLoggedIn = true;
                    req.session.user = foundUser;
                    return req.session.save((err) => {
                        if (err){console.log(err)};
                        res.redirect("/admin/dashboard");
                    })
                } else {
                    return (
                        res.render("login", {
                            user: req.session.user,
                            isLoggedIn: req.session.isLoggedIn,
                            page: 'login',
                            error: 'The email and password does not match!'
                        })
                    )    
                }
            });
        }
    }).catch(
        err => console.log(err)
    );
}

exports.getRegister = (req, res, next) => {
    res.render("register", {
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn,
        page: 'register',
        errors: [],
            oldData: {
                email: '',
                confirmEmail: '',
                firstName: '',
                lastName: '',
                username: ''
            }
    });
}

exports.postRegister = (req, res) => {
    const validationErrors = [];
    const userEmail = req.body.email;
    const confirmEmail = req.body.confirmEmail;
    const userPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;

    User.find({email: userEmail})
        .then(result => {
            if (result > 0) {
                validationErrors.push("Email address already used! Login with this email with a valid password!");    
            }
        })
    User.find({username: username})
        .then(result => {
            if (result > 0) {
                validationErrors.push("Username already used! Please choose another username!");    
            }
        })
    
    if (userEmail.length < 10) {
        validationErrors.push("Enter a valid email address!");
    }
    
    if (userEmail != confirmEmail) {
        validationErrors.push("Email addresses entered do not match!");
    } 
    
    if (userPassword != confirmPassword) {
        validationErrors.push("Passwords entered do not match!");
    }

    if (userPassword.length < 7) {
        validationErrors.push("Use a longer password!");
    }

    if (firstName.length < 2) {
        validationErrors.push("Enter a valid first name!");
    }

    if (lastName.length < 2) {
        validationErrors.push("Enter a valid last name!");
    }

    if (username.length < 5) {
        validationErrors.push("Enter a valid username! Needs to be at least 5 characters long!");
    }
    
    if (validationErrors.length != 0) {
        res.render("register", {
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn,
            page: 'register',
            errors: validationErrors,
            oldData: {
                email: userEmail,
                confirmEmail: confirmEmail,
                firstName: firstName,
                lastName: lastName,
                username: username
            }
        });    
    } else {
        if (userEmail === confirmEmail && userPassword === confirmPassword) {
            bcrypt.hash(userPassword, 12, function(err, hashedPassword) {
                if (err) {
                    console.log(err);
                } else {
                    newUser = new User({
                        email: userEmail,
                        password: hashedPassword,
                        firstName: firstName,
                        lastName: lastName,
                        role: "subscriber",
                        username: username,
                        posts: []
                    });
                    newUser.save();
                    res.redirect("/login");
                }
            })
        }
    }
}

exports.postLove = (req, res, next) => {
    const likedBlog = req.body.love_btn;
    Blog.findOneAndUpdate({_id: likedBlog}, { $inc: {love: 1}})
    .catch(err => console.log(err))
    res.redirect("/blogs")
}