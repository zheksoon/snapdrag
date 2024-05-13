import React, { useState, useCallback, useEffect } from "react";
import { partition } from "lodash";
import { IColumn, IProject, ITask, initialTasks } from "./data";

type AddTask = (task: Partial<ITask>) => void;

type RemoveTask = (task: ITask) => void;

type UpdateTask = (task: ITask, data: Partial<ITask>) => void;

export const TasksContext = React.createContext({
  tasks: [] as ITask[],
  addTask: (() => {}) as AddTask,
  removeTask: (() => {}) as RemoveTask,
  updateTask: (() => {}) as UpdateTask,
});

const updateOrder = (tasks: ITask[], project: IProject["id"], status: IColumn["status"]) => {
  const [projectTasks, otherTasks] = partition(
    tasks,
    (t) => t.project === project && t.status === status
  );

  const orderedTasks = projectTasks
    .sort((a, b) => a.order - b.order)
    .map((t, i) => ({ ...t, order: i + 1 }));

  return [...otherTasks, ...orderedTasks];
};

export const TasksProvider = ({ children }: { children: React.ReactElement | React.ReactElement[] }) => {
  const [tasks, setTasks] = useState<ITask[]>(() => {
    const storageTasks = localStorage.getItem("tasks");

    return storageTasks ? JSON.parse(storageTasks) : initialTasks;
  });

  const addTask = useCallback<AddTask>((task) => {
    setTasks((tasks) => {
      const newTask = { ...task, id: (Math.random() * 1e15) | 0 } as ITask;

      return updateOrder([...tasks, newTask], newTask.project, newTask.status);
    });
  }, []);

  const removeTask = useCallback<RemoveTask>((task) => {
    setTasks((tasks) => tasks.filter((_task) => _task.id !== task.id));
  }, []);

  const updateTask = useCallback<UpdateTask>((task, data) => {
    setTasks((tasks) => {
      const newTasks = tasks.map((_task) =>
        task.id === _task.id ? { ..._task, ...data } : _task
      );

      return updateOrder(newTasks, task.project, task.status);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <TasksContext.Provider value={{ tasks, addTask, removeTask, updateTask }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => React.useContext(TasksContext);
