import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../../models/user";
import { Todo } from "../../models/todo";
import { createTodoSchema } from "../../validatiors/TodoValidator";

export const todoController = {
  getAllTodos: async (req: Request, res: Response): Promise<any> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const search = (req.query.search as string) || "";
      const searchRegex = new RegExp(search, "i");

      const sortTypeRaw = ((req.query.sortType as string) || "").toLowerCase();
      const sortType =
        sortTypeRaw === "asc" ? 1 : sortTypeRaw === "desc" ? -1 : undefined;
      const sortColumn = (req.query.sortColumn as string) || "";

      const filter = {
        isDelete: false,
        ...(search && { message: { $regex: searchRegex } }),
      };

      const total = await Todo.countDocuments(filter);

      let query = Todo.find(filter);

      if (sortColumn && sortType) {
        query = query.sort({ [sortColumn]: sortType });
      }

      const isFinishTaskCount = await Todo.countDocuments({
        isDelete: false,
        isFinish: true,
      });

      const todos = await query.skip((page - 1) * limit).limit(limit);

      // console.log(sortType, sortColumn, todos);

      // console.log(Todos, page, limit, search, filter);

      const filterTodos = todos.map((todo) => {
        const { _id, ...rest } = todo.toObject();

        return {
          id: _id.toString?.() ?? _id,
          ...rest,
        };
      });

      res.json({
        data: filterTodos,
        pagination: {
          page,
          limit,
          total,
          totalFinish: isFinishTaskCount,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  getTodoById: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;

      const todo = await Todo.findOne({ _id: id, isDelete: false });

      if (!todo) {
        return res.status(404).json(`Todo with id: ${id} not found`);
      }

      const { _id, ...rest } = todo.toObject();

      const filterTodos = { id: _id, ...rest };

      return res.status(200).json(filterTodos);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  createTodo: async (req: Request, res: Response): Promise<any> => {
    try {
      const { message } = req.body;

      const { error } = createTodoSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const messages = error.details.map((message) => message.message);
        return res.status(400).json({
          message: messages,
        });
      }

      const newTodo = new Todo({
        message,
      });

      const todo = await newTodo.save();

      const { _id, ...rest } = todo.toObject();

      const filterTodos = { id: _id, ...rest };

      return res
        .status(200)
        .json({ data: filterTodos, message: ["Todo created successfully"] });
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  updateTodoStatus: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;

      const todo = await Todo.findById(id);

      if (!todo) {
        return res.status(404).json(`Todo with id: ${id} not found`);
      }

      const updateTodo = await Todo.findOneAndUpdate(
        { _id: id, isDelete: false },
        { isFinish: !todo.isFinish },
        { new: true }
      );

      if (!updateTodo) {
        return res.status(404).json(`Todo with id: ${id} not found`);
      }

      const { _id, ...rest } = updateTodo.toObject();

      const filterTodos = { id: _id, ...rest };

      return res.status(200).json({
        updateTodo: filterTodos,
        message: ["Todo updated successfully"],
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  updateTodo: async (req: Request, res: Response): Promise<any> => {
    try {
      const { message } = req.body;
      const { id } = req.params;

      const { error } = createTodoSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const messages = error.details.map((message) => message.message);

        return res.status(400).json({
          message: messages,
        });
      }

      const updateTodo = await Todo.findOneAndUpdate(
        { _id: id, isDelete: false },
        { message },
        { new: true }
      );

      if (!updateTodo) {
        return res.status(404).json(`Todo with id: ${id} not found`);
      }

      const { _id, ...rest } = updateTodo.toObject();

      const filterTodos = { id: _id, ...rest };

      return res.status(200).json({
        updateTodo: filterTodos,
        message: ["Todo updated successfully"],
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  deleteTodo: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;

      const updateTodo = await Todo.findByIdAndUpdate(
        { _id: id, isDelete: false },
        { isDelete: true },
        { new: true }
      );

      if (!updateTodo) {
        return res.status(404).json(`Todo with id: ${id} not found`);
      }

      const { _id, ...rest } = updateTodo.toObject();

      const filterTodos = { id: _id, ...rest };

      return res.status(200).json({
        updateTodo: filterTodos,
        message: ["Todo deleted successfully"],
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};
