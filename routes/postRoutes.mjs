import express from "express";
import * as postController from "../controllers/postController.mjs";

const router = express.Router();

// List all posts
router.route("/").get(postController.getAllPosts);

// Show the form to create a post, and handle creation
router
  .route("/new")
  .get(postController.showNewPostForm)
  .post(postController.createPost);

// Show single post, update, delete, and fallback POST for method-override
router
  .route("/:id")
  .get(postController.getPostById)
  .put(postController.updatePost)
  .delete(postController.deletePost)
  .post((req, res, next) => {
    // Debug log for troubleshooting method-override
    console.log("[DEBUG] POST /posts/:id fallback");
    console.log("req.body:", req.body);
    console.log("req.body._method:", req.body && req.body._method);
    // If method-override did not convert POST to PUT/DELETE, return 405
    res
      .status(405)
      .send("Method Not Allowed. Use method-override for PUT/DELETE.");
  });

// Edit form (GET)
router.route("/:id/edit").get(postController.showEditForm);

export default router;
