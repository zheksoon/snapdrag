import React, { useState, useCallback, useEffect } from "react";
import { partition } from "lodash";
import { initialTasks } from "./data";

export const TasksContext = React.createContext({});

const updateOrder = (tasks, project, status) => {
  const [projectTasks, otherTasks] = partition(
    tasks,
    (t) => t.project === project && t.status === status
  );

  const orderedTasks = projectTasks
    .sort((a, b) => a.order - b.order)
    .map((t, i) => ({ ...t, order: i + 1 }));

  return [...otherTasks, ...orderedTasks];
};

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    const storageTasks = localStorage.getItem("tasks");

    return storageTasks ? JSON.parse(storageTasks) : initialTasks;
  });

  const addTask = useCallback((task) => {
    setTasks((tasks) => {
      const newTask = { ...task, id: (Math.random() * 1e16) | 0 };

      return updateOrder([...tasks, newTask], newTask.project, newTask.status);
    });
  }, []);

  const removeTask = useCallback((task) => {
    setTasks((tasks) => tasks.filter((_task) => _task.id !== task.id));
  }, []);

  const updateTask = useCallback((task, data) => {
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
