import "./styles.css";

import React, { useState, useEffect } from "react";
import { useDraggable, useDroppable, Overlay } from "./concept";

const DraggableSquare = ({ color }) => {
  const { draggable, isDragging } = useDraggable({
    type: "SQUARE",
    data: { color: "red" },
  });

  const opacity = isDragging ? 0.5 : 1;

  return draggable(
    <div className="square" style={{ backgroundColor: color, opacity }}>
      {isDragging ? "Dragging" : "Drag me"}
    </div>
  );
};

const DroppableSquare = ({ color: initialColor }) => {
  const [color, setColor] = React.useState(initialColor);
  const [text, setText] = React.useState("Drop here");

  const { droppable } = useDroppable({
    sourceTypes: ["SQUARE"],
    onDragIn({ data }) {
      setColor(data.color);
      setText("Dragged in");
    },
    onDragOut() {
      setColor(initialColor);
      setText("Drop here");
    },
    onDrop({ data }) {
      setText("Dropped");
    },
  });

  return droppable(
    <div className="square" style={{ backgroundColor: color }}>
      {text}
    </div>
  );
};

export default App = () => {
  return (
    <>
      <div style={{ position: "relative" }}>
        <DraggableSquare top={100} left={100} color="red" />
        <DroppableSquare top={100} left={300} color="green" />
      </div>
      <Overlay />
    </>
  );
};

// accepts: ({ kind, data }) => boolean;

const [tasks, setTasks] = observable([
  { id: 1, title: "Task 1", project: "Project 1", status: "todo", order: 0 },
  { id: 2, title: "Task 2", project: "Project 2", status: "todo", order: 2 },
  { id: 3, title: "Task 3", project: "Project 1", status: "in-progress", order: 2 },
  { id: 4, title: "Task 4", project: "Project 2", status: "in-progress", order: 1 },
  { id: 5, title: "Task 5", project: "Project 1", status: "done", order: 0 },
  { id: 6, title: "Task 6", project: "Project 2", status: "done", order: 1 },
]);

const updateTask = (_task, data) => {
  setTasks((tasks) => {
    return tasks.map((task) => (task.id === _task.id ? { ...task, ...data } : task));
  });
};

const Task = ({ task }) => {
  const { draggable } = useDraggable({
    type: "TASK",
    data: { task },
  });

  const { droppable, hoveredBy } = useDroppable({
    accepts: ["TASK"],
    data: { kind: "TASK_DROPPABLE" },
  });

  return droppable(
    draggable(
      <>
        <div className="task">{task.title}</div>
      </>
    )
  );
};

const TaskGroup = ({ status, project, tasks }) => {
  const { droppable, hovered } = useDroppable({
    accepts: ({ kind, data }) => kind === "TASK" && data.task.project === project,
    onDrop({ data, acceptedBy }) {
      updateTask(data.task, { status });
    },
  });

  return droppable(
    <div className={cx("task-group", hovered && "hovered")}>
      <h2>{project}</h2>
      {tasks.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </div>
  );
};

const Column = ({ name, status, tasks }) => {
  const tasksForStatus = tasks.filter((task) => task.status === status);

  const tasksByProject = groupBy(tasksForStatus, (task) => task.project);

  return (
    <div className="column">
      <h1>{name}</h1>
      {Object.entries(tasksByProject()).map(([project, tasks]) => (
        <TaskGroup key={project} status={status} project={project} tasks={tasks} />
      ))}
    </div>
  );
};

const KanbanDashboard = () => {
  return;
};
