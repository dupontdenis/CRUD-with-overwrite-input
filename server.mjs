import express from "express";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDatabase } from "./db.mjs";
import postRoutes from "./routes/postRoutes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Enable method-override for REST verbs via _method field in forms or query param
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

 app.use(methodOverride("_method"));

app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Connect to database
await connectToDatabase();

// Routes
app.use("/posts", postRoutes);
app.get("/", (req, res) => res.redirect("/posts"));

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Educational routes:`);
  console.log(`   - http://localhost:${PORT}/ (List all posts)`);
});
