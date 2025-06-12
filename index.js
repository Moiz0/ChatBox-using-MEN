// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError");

// Initialize Express app
const app = express();
const port = 8080;

// Import Mongoose model
const Chat = require("./models/chat.js");
const { asyncWrapProviders } = require("async_hooks");

// Middleware setup
app.set("views", path.join(__dirname, "views")); // Set views directory
app.set("view engine", "ejs"); // Set view engine to EJS
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(methodOverride("_method")); // Enable method override for PUT & DELETE

// Start Express server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

function asyncWrap(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}

// Database connection
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/whatsapp");
  console.log("Connected to MongoDB");
}
main().catch((err) => console.log(err));

/* ========== CRUD OPERATIONS ========== */

// 1. CREATE - Add a new chat
app.post(
  "/chats",
  asyncWrap(async (req, res) => {
    let { form, msg, to } = req.body;

    // Create new chat object
    let newData = new Chat({
      form: form,
      to: to,
      msg: msg,
      created_at: new Date(),
    });

    // Save chat to database
    await newData.save();

    // Redirect to chats page
    res.redirect("/chats");
  })
);

// 2. READ - Display all chats
app.get(
  "/chats",
  asyncWrap(async (req, res) => {
    let chats = await Chat.find(); // Fetch all chat messages
    res.render("index.ejs", { chats }); // Render chats in index.ejs
  })
);

// 3. READ - Show form to create a new chat
app.get("/chats/new", (req, res) => {
  res.render("new.ejs"); // Render form to create new chat
});

// 4. UPDATE - Show edit form for a specific chat
app.get(
  "/chats/:id/edit",
  asyncWrap(async (req, res, next) => {
    try {
      let { id } = req.params;
      let chat = await Chat.findById(id); // Fetch chat by ID

      res.render("edit.ejs", { chat }); // Render edit form}
    } catch (err) {
      next(err);
    }
  })
);

// 5. UPDATE - Edit an existing chat message
app.put(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let { msg: newData } = req.body;

    let updateChat = await Chat.findByIdAndUpdate(
      id,
      { msg: newData }, // Update only the message field
      { runValidators: true, new: true }
    );

    console.log(updateChat);
    res.redirect("/chats");
  })
);

// 6. DELETE - Remove a chat message
app.delete(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let deleteChat = await Chat.findByIdAndDelete(id); // Delete chat by ID
    console.log(deleteChat);
    res.redirect("/chats");
  })
);

app.use((err, req, res, next) => {
  console.log(err.name);

  if (err.name === "ValidationError") {
    return res.status(400).send("Validation error:" + err.message);
  }

  if (err.name === "CasteError") {
    return res.status(400).send("Invalid ID format");
  }

  next(err);
});

//Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).send("Some error oocur!");
});

