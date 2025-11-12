import BlogPost from "../models/blogspot.mjs";

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find();

    // Demonstrate virtuals and methods
    const postsWithExtras = posts.map((post) => ({
      id: post._id,
      title: post.title,
      body: post.body,
      url: post.url, // Virtual property
      summary: post.getSummary(50), // Instance method
    }));

    res.render("index", { posts: postsWithExtras });
  } catch (error) {
    res.status(500).send("Error fetching posts: " + error.message);
  }
};

// Get single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.render("detail", {
      post: {
        id: post._id,
        title: post.title,
        body: post.body,
        url: post.url, // Virtual
      },
    });
  } catch (error) {
    res.status(500).send("Error fetching post: " + error.message);
  }
};

// Show form to create a new post
export const showNewPostForm = (req, res) => {
  // Render the self-contained `new.ejs` view. The view uses static labels and form action.
  return res.render("new");
};

// Handle creation of a new post
export const createPost = async (req, res) => {
  try {
    // Pull and sanitize inputs
    const rawTitle =
      typeof req.body.title === "string" ? req.body.title.trim() : "";
    const rawBody =
      typeof req.body.body === "string" ? req.body.body.trim() : "";

    const errors = [];

    // Validation rules
    if (!rawTitle) errors.push("Title is required.");
    if (!rawBody) errors.push("Body is required.");
    if (rawTitle && rawTitle.length > 200)
      errors.push("Title must be 200 characters or fewer.");
    if (rawBody && rawBody.length > 10000) errors.push("Body is too long.");

    if (errors.length > 0) {
      // Render the form again with error messages and previously entered values.
      // The view is self-contained, so only pass the values needed to prefill fields and show errors.
      return res.status(400).render("new", {
        errors,
        title: rawTitle,
        body: rawBody,
      });
    }

    const newPost = new BlogPost({ title: rawTitle, body: rawBody });
    const saved = await newPost.save();

    // Redirect to the newly created post detail
    return res.redirect(`/posts/${saved._id}`);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).send("Error creating post: " + error.message);
  }
};

// Delete a post by ID
export const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await BlogPost.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).send("Post not found");
    }
    // Redirect to list after deletion
    return res.redirect("/posts/");
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).send("Error deleting post: " + error.message);
  }
};

// Show edit form (reuses new.ejs)
export const showEditForm = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    // The view contains static labels and computes the form action from post.id.
    return res.render("edit", {
      post: { id: post._id, title: post.title, body: post.body },
    });
  } catch (error) {
    console.error("Error showing edit form:", error);
    return res.status(500).send("Error: " + error.message);
  }
};

// Handle edit submission (POST)
export const updatePost = async (req, res) => {
  console.log("req.method:", req.method);

  try {
    const rawTitle =
      typeof req.body.title === "string" ? req.body.title.trim() : "";
    const rawBody =
      typeof req.body.body === "string" ? req.body.body.trim() : "";

    const errors = [];
    if (!rawTitle) errors.push("Title is required.");
    if (!rawBody) errors.push("Body is required.");
    if (rawTitle && rawTitle.length > 200)
      errors.push("Title must be 200 characters or fewer.");

    if (errors.length > 0) {
      // On validation error, re-render the edit view with errors and prefills.
      return res.status(400).render("edit", {
        errors,
        post: { id: req.params.id, title: rawTitle, body: rawBody },
      });
    }

    const updated = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { title: rawTitle, body: rawBody },
      { new: true }
    );
    if (!updated) return res.status(404).send("Post not found");
    return res.redirect(`/posts/${updated._id}`);
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).send("Error updating post: " + error.message);
  }
};
