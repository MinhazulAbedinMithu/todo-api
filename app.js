// app.js
// const express = require("express");
// const mongoose = require("mongoose");
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(`${process.env.MONGO_URL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Check MongoDB connection
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Todo Schema
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "done"],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const Todo = mongoose.model("Todo", todoSchema);

// Create Todo
app.post("/todos", async (req, res) => {
  try {
    const newTodo = new Todo(req.body);
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Todos
app.get("/todos", async (req, res) => {
  try {
    let query = {};

    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    const todos = await Todo.find(query);
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Todo by ID
app.get("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (todo) {
      res.status(200).json(todo);
    } else {
      res.status(404).json({ message: "Todo not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Todo by ID
app.patch("/todos/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (updatedTodo) {
      res.status(200).json(updatedTodo);
    } else {
      res.status(404).json({ message: "Todo not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Todo by ID
app.delete("/todos/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (deletedTodo) {
      res.status(200).json({ message: "Todo deleted successfully" });
    } else {
      res.status(404).json({ message: "Todo not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
