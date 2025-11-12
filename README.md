# Why HTML Forms Need method-override for REST Verbs

## Using method-override with Input Forms

To support REST verbs (such as PUT and DELETE) in HTML forms, you need to use the `method-override` middleware. In addition to the default usage, you should add the following code to your Express app to enable method overriding via the `_method` field in form input bodies:

```js
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
```

This allows you to use a hidden input named `_method` in your forms to specify the HTTP method (e.g., PUT or DELETE) for the request.

## The Problem

HTML forms only support GET and POST methods. This means you cannot natively send PUT or DELETE requests from a browser form. In RESTful APIs, updating and deleting resources should use PUT and DELETE verbs, but browsers do not support these in forms.

**Example:**

```html
<!-- This form can only send POST, not PUT or DELETE -->
<form action="/posts/123" method="post">
  <!-- ...fields... -->
  <button type="submit">Save</button>
</form>
```

## How method-override Solves It

`method-override` is Express middleware that lets you fake HTTP verbs by sending a POST request with a special field (usually `_method`) or a query string. The server reads this and treats the request as a PUT or DELETE.

**How it works:**

1. Add a hidden field to your form:
   ```html
   <input type="hidden" name="_method" value="PUT" />
   ```
   Or use a query string in the action:
   ```html
   <form action="/posts/123?_method=DELETE" method="post"></form>
   ```
2. The form submits as POST, but Express (with method-override) treats it as a PUT or DELETE.

**Server setup:**

```js
import methodOverride from "method-override";
app.use(methodOverride("_method"));
```

**Router example:**

```js
router
  .route("/posts/:id")
  .get(postController.getPostById)
  .put(postController.updatePost)
  .delete(postController.deletePost);
```

## Why This Project Used POST Endpoints

For teaching, this project originally used explicit POST endpoints for update and delete (e.g., `/posts/:id/update`, `/posts/:id/delete`). This keeps things simple:

- No hidden fields or middleware required
- Easy to follow for beginners
- Works with plain HTML forms

## Migrating to RESTful Verbs

If you want to use RESTful routes:

1. Install method-override: `npm install method-override`
2. Enable the middleware in `server.mjs`
3. Change router handlers to use `.put()` and `.delete()` on `/:id`
4. Update forms to include the `_method` hidden field **or** use the query string approach (`action="...?_method=PUT"`)

## Summary

- Browsers only support GET/POST in forms
- method-override lets you use PUT/DELETE by faking the verb
- This project started with POST endpoints for clarity
- You can migrate to RESTful verbs with method-override for a more standard API
  Simple Express + Mongoose CRUD (EJS)

A small, student-friendly CRUD demo using Express, Mongoose and EJS.
This repository is organized to make it easy to read a single view and follow the full request/response flow.

Key points

- Views are self-contained: `new.ejs` and `edit.ejs` contain the full form HTML (no partial form include).
- We avoid browser PUT/DELETE form issues by using POST endpoints for update/delete. This keeps forms and fetch calls simple for learning.

Project layout

- `server.mjs` — starts Express, mounts the router at `/posts`, serves static assets and sets EJS as the view engine.
- `routes/postRoutes.mjs` — defines the routes for list/create/read/update/delete (router mounted at `/posts`).
- `controllers/postController.mjs` — controller logic: validation, rendering and redirects.
- `models/blogspot.mjs` — Mongoose schema with a `url` virtual and an instance `getSummary()` method.
- `views/` — EJS templates (`index.ejs`, `new.ejs`, `edit.ejs`, `detail.ejs`).
- `public/js/posts.js` — client helper that submits forms with fetch and follows redirects.
- `populate.mjs` — script to seed demo posts.

Prerequisites

- Node 18+ (ES modules enabled)
- MongoDB running locally or a `MONGODB_URI` environment variable

Install and run

```bash
npm install
npm run dev   # starts server.mjs with nodemon
# or
npm start
```

Open http://localhost:3000/ — it redirects to `/posts/`.

Routes (final simplified layout)

- GET /posts/ — list all posts (renders `index.ejs`)
- GET /posts/new — show create form (renders `new.ejs`)
- POST /posts/new — create post
- GET /posts/:id — show a single post (renders `detail.ejs`)
- GET /posts/:id/edit — show edit form (renders `edit.ejs`)
- POST /posts/:id/update — update post
- POST /posts/:id/delete — delete post

Forms & client behavior

- `new.ejs` and `edit.ejs` contain the full form markup and explicit action URLs so students can read and understand the HTML in one file.
- The client-side script (`public/js/posts.js`) intercepts the form submit event, sends form data as `application/x-www-form-urlencoded` via `fetch`, and navigates to the redirected URL returned by the server.
- Controllers validate inputs; on validation failure they return status 400 and re-render the same EJS view with an `errors` array and any previously entered `title`/`body` so the form shows the messages and keeps input.

Populating demo content

```bash
npm run populate
```

This clears the collection and seeds two example posts.

Developer notes

- If later you want true RESTful PUT/DELETE behavior for APIs, you can add `method-override` and change the routes back to use PUT/DELETE handlers; for teaching HTML forms and basic fetch usage the POST-based approach is easier.
- The Mongoose model includes a `url` virtual returning `/posts/:id`; controllers and views use it where convenient.

## Why these routes are explicit (/:id/edit, /:id/update, /:id/delete)

You might wonder why the router declares separate paths like:

```js
router.route("/:id/edit").get(postController.showEditForm);
router.route("/:id/update").post(postController.updatePost);
router.route("/:id/delete").post(postController.deletePost);
```

instead of grouping everything under `/posts/:id` with different HTTP verbs (for example `.get(...).put(...).delete(...)`).

Short answer: it's intentional and chosen for clarity and compatibility when teaching HTML forms and simple fetch usage.

Longer explanation and trade-offs:

- HTML forms only support GET and POST. If you want browser-native forms to submit edits or deletions without JavaScript, you need a POST endpoint (or use `method-override` to fake PUT/DELETE). Avoiding `method-override` keeps the example simple.
- Even when using `fetch()`, many beginners use the same POST-backed form flow (or prefer to keep server-side handlers simple). Using explicit POST endpoints (`/:id/update`, `/:id/delete`) avoids students needing to understand non-standard workarounds.
- Having an `/:id/edit` GET path is a common, explicit convention: it separates the _form page_ (GET `/posts/:id/edit`) from the _resource URL_ (GET `/posts/:id`). This makes the app easier to explain to learners — the form has its own route and action.
- You can absolutely write RESTful routes using `.route('/:id').get(...).put(...).delete(...)` for APIs and advanced apps. That pattern is often preferable for JSON APIs and production REST services. In this teaching app we intentionally favor explicit, easy-to-read routes that map naturally to the HTML students will write.
- Security and middleware: when you use PUT/DELETE (or `method-override`), you often need additional middleware (or client-side setup). Keeping explicit POST handlers reduces the number of moving parts for a demo.

If later you want to migrate to RESTful verbs, the change is straightforward:

1. Add `method-override` or switch your fetch calls to use PUT/DELETE.
2. Change the router to use `.put(...)` and `.delete(...)` on `/:id` and adapt the controller method names.

For now the explicit `/edit`, `/update`, `/delete` pattern is the simplest for teaching traditional HTML forms together with a small fetch helper.

Want help?

- I can add a short section showing the exact HTML used in `new.ejs` and `edit.ejs` so students can copy/paste or add minimal integration tests (supertest) to exercise the CRUD flows.

---

That's it — the project is organized for clarity and teaching. Open the views and follow the controller code to see the full flow.

# Simple Express + Mongoose CRUD (EJS)

A small, student-friendly CRUD demo using Express, Mongoose and EJS.
This repository is organized to make it easy to read a single view and follow the full request/response flow.

Key points

- Views are self-contained: `new.ejs` and `edit.ejs` contain the full form HTML (no partial form include).
- We avoid browser PUT/DELETE form issues by using POST endpoints for update/delete. This keeps forms and fetch calls simple for learning.

Project layout

- `server.mjs` — starts Express, mounts the router at `/posts`, serves static assets and sets EJS as the view engine.
- `routes/postRoutes.mjs` — defines the routes for list/create/read/update/delete (router mounted at `/posts`).
- `controllers/postController.mjs` — controller logic: validation, rendering and redirects.
- `models/blogspot.mjs` — Mongoose schema with a `url` virtual and an instance `getSummary()` method.
- `views/` — EJS templates (`index.ejs`, `new.ejs`, `edit.ejs`, `detail.ejs`).
- `public/js/posts.js` — client helper that submits forms with fetch and follows redirects.
- `populate.mjs` — script to seed demo posts.

Prerequisites

- Node 18+ (ES modules enabled)
- MongoDB running locally or a `MONGODB_URI` environment variable

Install and run

```bash
npm install
npm run dev   # starts server.mjs with nodemon
# or
npm start
```

Open http://localhost:3000/ — it redirects to `/posts/`.

Routes (final simplified layout)

- GET /posts/ — list all posts (renders `index.ejs`)
- GET /posts/new — show create form (renders `new.ejs`)
- POST /posts/new — create post
- GET /posts/:id — show a single post (renders `detail.ejs`)
- GET /posts/:id/edit — show edit form (renders `edit.ejs`)
- POST /posts/:id/update — update post
- POST /posts/:id/delete — delete post

Forms & client behavior

- `new.ejs` and `edit.ejs` contain the full form markup and explicit action URLs so students can read and understand the HTML in one file.
- The client-side script (`public/js/posts.js`) intercepts the form submit event, sends form data as `application/x-www-form-urlencoded` via `fetch`, and navigates to the redirected URL returned by the server.
- Controllers validate inputs; on validation failure they return status 400 and re-render the same EJS view with an `errors` array and any previously entered `title`/`body` so the form shows the messages and keeps input.

Populating demo content

```bash
npm run populate
```

This clears the collection and seeds two example posts.

Developer notes

- If later you want true RESTful PUT/DELETE behavior for APIs, you can add `method-override` and change the routes back to use PUT/DELETE handlers; for teaching HTML forms and basic fetch usage the POST-based approach is easier.
- The Mongoose model includes a `url` virtual returning `/posts/:id`; controllers and views use it where convenient.

Want help?

- I can add a short section showing the exact HTML used in `new.ejs` and `edit.ejs` so students can copy/paste or add minimal integration tests (supertest) to exercise the CRUD flows.

---

That's it — the project is organized for clarity and teaching. Open the views and follow the controller code to see the full flow.
