import { Request, Response } from "express";
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
        ...(search && { title: { $regex: searchRegex } }),
      };

      const total = await Todo.countDocuments(filter);
      const isFinishTaskCount = await Todo.countDocuments({
        isDelete: false,
        status: "done",
      });

      let query = Todo.find(filter);

      if (sortColumn && sortType) {
        query = query.sort({ [sortColumn]: sortType });
      }

      const todos = await query.skip((page - 1) * limit).limit(limit);

      const filterTodos = todos.map((todo) => {
        const { _id, isDelete, __v, ...rest } = todo.toObject();
        return { id: _id?.toString?.() ?? _id, ...rest };
      });

      return res.status(200).json({
        data: filterTodos,
        pagination: {
          page,
          limit,
          total,
          totalFinish: isFinishTaskCount,
          totalPages: Math.ceil(total / limit),
          sortType,
          sortColumn,
        },
        message: ["get all todos successfully"],
        error: false,
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        pagination: null,
        message: ["Internal server error"],
        error: true,
      });
    }
  },

  getTotalAndTotalFinishTodos: async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const total = await Todo.countDocuments({ isDelete: false });
      const totalFinish = await Todo.countDocuments({
        isDelete: false,
        status: "done",
      });

      return res.status(200).json({
        totalTodos: total,
        totalFinishTodos: totalFinish,
        message: ["get total and total finish todos successfully"],
        error: false,
      });
    } catch (error) {
      return res.status(500).json({
        totalTodos: null,
        totalFinishTodos: null,
        message: ["Internal server error"],
        error: true,
      });
    }
  },

  getTodoById: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const todo = await Todo.findOne({ _id: id, isDelete: false });

      if (!todo) {
        return res
          .status(404)
          .json({ data: null, message: ["Todo not found"], error: true });
      }

      const { _id, isDelete, __v, ...rest } = todo.toObject();

      return res.status(200).json({ data: { id: _id, ...rest }, error: false });
    } catch (error) {
      return res
        .status(500)
        .json({ data: null, message: ["Internal server error"], error: true });
    }
  },

  createTodo: async (req: Request, res: Response): Promise<any> => {
    try {
      const { error } = createTodoSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const messages = error.details.map((m) => m.message);
        return res
          .status(400)
          .json({ data: null, message: messages, error: true });
      }

      const newTodo = new Todo(req.body);
      const todo = await newTodo.save();
      const { _id, isDelete, __v, ...rest } = todo.toObject();

      return res.status(201).json({
        data: { id: _id, ...rest },
        message: ["Todo created successfully"],
        error: false,
      });
    } catch (error) {
      console.log(error);
      
      return res
        .status(500)
        .json({ data: null, message: ["Internal server error"], error: true });
    }
  },

  updateTodoStatus: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["todo", "in-progress", "done"];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          data: null,
          message: ["Status must be one of: todo, in-progress, done"],
          error: true,
        });
      }

      const updateTodo = await Todo.findOneAndUpdate(
        { _id: id, isDelete: false },
        { status },
        { new: true }
      );

      if (!updateTodo) {
        return res
          .status(404)
          .json({ data: null, message: ["Todo not found"], error: true });
      }

      const { _id, isDelete, __v, ...rest } = updateTodo.toObject();

      return res.status(200).json({
        data: { id: _id, ...rest },
        message: ["Todo status updated successfully"],
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ data: null, message: ["Internal server error"], error: true });
    }
  },

  updateTodo: async (req: Request, res: Response): Promise<any> => {
    try {
      const { error } = createTodoSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const messages = error.details.map((m) => m.message);
        return res
          .status(400)
          .json({ data: null, message: messages, error: true });
      }

      const { id } = req.params;
      const updateTodo = await Todo.findOneAndUpdate(
        { _id: id, isDelete: false },
        req.body,
        { new: true }
      );

      if (!updateTodo) {
        return res
          .status(404)
          .json({ data: null, message: ["Todo not found"], error: true });
      }

      const { _id, isDelete, __v, ...rest } = updateTodo.toObject();

      return res.status(200).json({
        data: { id: _id, ...rest },
        message: ["Todo updated successfully"],
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ data: null, message: ["Internal server error"], error: true });
    }
  },

  deleteTodo: async (req: Request, res: Response): Promise<any> => {
    try {
      const { id } = req.params;
      const deleteTodo = await Todo.findByIdAndUpdate(
        { _id: id, isDelete: false },
        { isDelete: true },
        { new: true }
      );

      if (!deleteTodo) {
        return res
          .status(404)
          .json({ data: null, message: ["Todo not found"], error: true });
      }

      const { _id, isDelete, __v, ...rest } = deleteTodo.toObject();

      return res.status(200).json({
        data: { id: _id, ...rest },
        message: ["Todo deleted successfully"],
        error: false,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ data: null, message: ["Internal server error"], error: true });
    }
  },
};
