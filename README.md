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
