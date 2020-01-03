// Install body-parser, mongoose, express, ejs, method-override (needs to be POST req), and express-sanitzer

var bodyParser       = require("body-parser"),
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer");
    mongoose         = require("mongoose"),
    express          = require("express"),
    app              = express();


// App config
// The part after the localhost is what the db is
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public")); // serves custom style sheet
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); // has to be after bodyParser. Use in create and update
app.use(methodOverride("_method"));

// Mongoose/model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: {type: String, default: "placeholderimage.jpg"},
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "test blog",
//     image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
//     body: "Hello this is a blog post"
// });

// RESTful routes

// INDEX ROUTE
app.get("/", function(req, res){
    res.redirect("/blogs");
});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
    // Create blog then redirect to the index
    // req.body gets input from a form and req.params is for items after a colon
    // Gets rid of any script tags
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err) {
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.get("/blogs", function(req, res){
    // blogs is what comes back from the search
    Blog.find({}, function(err, blogs){
        if (err) {
            console.log("error");
        } else {
            // blogs (first one) is the var name for the ejs file
            res.render("index", {blogs: blogs});
        }
    });
});

app.listen(3000, function() {
    console.log("Server is running");
});