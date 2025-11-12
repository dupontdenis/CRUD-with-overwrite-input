import mongoose from "mongoose";

const { Schema } = mongoose;

const BlogPostSchema = new Schema({
  title: String,
  body: String,
});

// ==============================================
// VIRTUAL PROPERTY - url
// ==============================================
// A virtual is a property that is NOT stored in MongoDB
// but is computed on-the-fly when you access it.
// This is useful for derived data that you don't want to duplicate in DB.

BlogPostSchema.virtual("url").get(function () {
  // Use a regular function (not arrow) to access 'this'
  return `/posts/${this._id}`;
});

// ==============================================
// INSTANCE METHOD - getSummary()
// ==============================================
// Instance methods are functions you can call on a document instance.
// They have access to 'this', which refers to the document.

BlogPostSchema.methods.getSummary = function (maxLength = 100) {
  if (!this.body) return "No content available";

  if (this.body.length <= maxLength) {
    return this.body;
  }

  // Truncate and add ellipsis
  return this.body.substring(0, maxLength) + "...";
};

// IMPORTANT: To use virtuals in JSON output, you need to set this option
BlogPostSchema.set("toJSON", { virtuals: true });
BlogPostSchema.set("toObject", { virtuals: true });

const BlogPost = mongoose.model("BlogPost", BlogPostSchema);

export { BlogPost };
export default BlogPost;
