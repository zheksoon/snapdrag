import cx from "classnames";
import React, { useEffect, useState } from "react";
import { partition } from "lodash";
import { Overlay, useDraggable, useDroppable } from "../../react/src/react-new";

import { columns, projects, tasks } from "./dashboard-data";
import "./Kanban.styles.css";

let setTasks = null;

const addTask = (task) => {
  setTasks((tasks) => {
    const newTask = { ...task, id: tasks.length + 1 };

    return [...tasks, newTask];
  });

  updateTask(task, { order: +Infinity });
};

const removeTask = (task) => {
  setTasks((tasks) => tasks.filter((_task) => _task.id !== task.id));
};

const updateTask = (task, data) => {
  setTasks((tasks) => {
    const newTasks = tasks.map((_task) =>
      task.id === _task.id ? { ..._task, ...data } : _task
    );

    const [projectTasks, otherTasks] = partition(
      newTasks,
      (t) => t.project === task.project && t.status === task.status
    );

    const orderedTasks = projectTasks
      .sort((a, b) => a.order - b.order)
      .map((t, i) => ({ ...t, order: i + 1 }));

    return [...otherTasks, ...orderedTasks];
  });
};

const Task = ({ task }) => {
  const [stopAnimation, setStopAnimation] = useState(false);

  const { draggable, isDragging } = useDraggable({
    kind: "TASK",
    data: { task },
    move: true,
  });

  const { droppable, hoveredBy } = useDroppable({
    accepts: ({ kind, data }) =>
      kind === "TASK" && data.task.project === task.project,
    onDrop({ data }) {
      setStopAnimation(true);
      updateTask(data.task, { status: task.status, order: task.order - 0.5 });

      setTimeout(() => {
        setStopAnimation(false);
      }, 200);
    },
  });

  return droppable(
    draggable(
      <div
        className={cx("task-wrapper", isDragging && "dragging")}
        data-drag-source="false"
      >
        <div
          className={cx(
            "task-drop-line",
            !isDragging && hoveredBy && "active",
            stopAnimation && "stop-animation"
          )}
        />
        <div className="task">
          <div className="drag-handle" data-drag-source="true">
            ☰
          </div>
          <span className="task-title">{task.title}</span>
          <button className="remove-task" onClick={() => removeTask(task)}>
            ❌
          </button>
        </div>
      </div>
    )
  );
};

// new task with input and add button that reacts to Enter and escape
const NewTask = ({ status, project, onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title) {
      onSubmit({
        title,
        status,
        project,
        id: Math.floor(Math.random() * 1e10),
      });
      setTitle("");
    }
  };

  return (
    <div className="task-wrapper new-task">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
      />
      <button className="add-task" onClick={handleSubmit}>
        ✔
      </button>
    </div>
  );
};

const TaskGroup = ({ status, project, tasks }) => {
  const { droppable, hoveredBy } = useDroppable({
    accepts: ({ kind, data }) =>
      kind === "TASK" && data.task.project === project,
    onDrop({ data, dropTargets }) {
      // we are the only drop target
      if (dropTargets.length === 1) {
        updateTask(data.task, { status, order: tasks.length + 1 });
      }
    },
  });

  const [newTaskVisible, setNewTaskVisible] = useState(false);

  const showNewTask = () => {
    setNewTaskVisible(true);
  };

  return droppable(
    <div className={cx("task-group", hoveredBy && "hovered")}>
      <div className="task-group-header">
        <h2>{project}</h2>
        <button className="add-group-task" onClick={showNewTask}>
          ➕
        </button>
      </div>
      {tasks.length
        ? tasks.map((task) => <Task key={task.id} task={task} />)
        : !newTaskVisible && (
            <div className="no-tasks-placeholder">No tasks</div>
          )}
      {newTaskVisible && (
        <NewTask
          status={status}
          project={project}
          onSubmit={(task) => {
            addTask(task);
            setNewTaskVisible(false);
          }}
          onCancel={() => setNewTaskVisible(false)}
        />
      )}
    </div>
  );
};

const Column = ({ name, status, tasks }) => {
  return (
    <div className="column">
      <h1>{name}</h1>
      {projects.map((project) => (
        <TaskGroup
          key={project}
          status={status}
          project={project}
          tasks={tasks
            .filter((task) => task.project === project)
            .sort((a, b) => a.order - b.order)}
        />
      ))}
    </div>
  );
};

const KanbanDashboard = () => {
  const [dashboardTasks, _setTasks] = useState(() => {
    const storageTasks = localStorage.getItem("tasks");

    return storageTasks ? JSON.parse(storageTasks) : tasks;
  });

  useEffect(() => {
    setTasks = _setTasks;

    return () => {
      setTasks = null;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(dashboardTasks));
  }, [dashboardTasks]);

  return (
    <div className="dashboard">
      {columns.map((column) => {
        const tasksForStatus = dashboardTasks.filter(
          (task) => task.status === column.status
        );

        return (
          <Column
            key={column.status}
            name={column.name}
            status={column.status}
            tasks={tasksForStatus}
          />
        );
      })}
    </div>
  );
};

export default function App() {
  return (
    <>
      <KanbanDashboard />
      <Overlay />
    </>
  );
}
