import mongoose from "mongoose";
import BlogPost from "./models/blogspot.mjs";
import connectDB from "./db.mjs";

// Connect to database
await connectDB();

// Clear existing posts
await BlogPost.deleteMany({});
console.log("✅ Cleared existing posts");

// Create two educational posts
const posts = [
  {
    title: "first post",
    body: "This is the body of the first post. It serves as an introduction to our blog platform. Here, we will explore various features of Mongoose, including virtual properties and instance methods. Stay tuned for more updates!",
  },
  {
    title: "second post",
    body: "This is the body of the second post. In this post, we will delve deeper into Mongoose schemas and how to effectively use them in your applications. We will also look at best practices for structuring your data and optimizing queries.",
  },
];

const createdPosts = await BlogPost.insertMany(posts);
console.log(`✅ Created ${createdPosts.length} posts:`);
createdPosts.forEach((post) => {
  console.log(`   - ${post.title}`);
  console.log(`     Virtual URL: ${post.url}`);
  console.log(`     Summary: ${post.getSummary(50)}`);
});

// Close connection
await mongoose.connection.close();
console.log("\n✅ Database populated successfully!");
