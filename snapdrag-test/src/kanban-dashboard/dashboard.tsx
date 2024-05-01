import { useState } from "react";
import {
  Overlay,
  useDraggable,
  useDroppable,
} from "../../../react/src/react-new";

import { columns, projects } from "./data";
import "../App.css";

import * as Styled from "./dashboard.styled";
import { TasksProvider, useTasks } from "./store";

const Task = ({ task }) => {
  const { updateTask, removeTask } = useTasks();

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
      console.log("drop task");
      setStopAnimation(true);
      updateTask(data.task, { status: task.status, order: task.order - 0.5 });

      setTimeout(() => {
        setStopAnimation(false);
      }, 200);
    },
  });

  return droppable(
    draggable(
      <Styled.TaskWrapper $isDragging={isDragging}>
        <Styled.TaskDropLine
          $active={!isDragging && hoveredBy}
          $stopAnimation={stopAnimation}
        />
        <Styled.Task>
          <Styled.DragHandle>☰</Styled.DragHandle>
          <Styled.TaskTitle>{task.title}</Styled.TaskTitle>
          <Styled.RemoveTaskButton onClick={() => removeTask(task)}>
            ❌
          </Styled.RemoveTaskButton>
        </Styled.Task>
      </Styled.TaskWrapper>
    )
  );
};

// new task with input and add button that reacts to Enter and escape
const NewTask = ({ status, project, onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (title) {
      onSubmit({ title, status, project });
      setTitle("");
    }
  };

  return (
    <Styled.NewTask>
      <Styled.NewTaskInput
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
      <Styled.AddTaskButton onClick={handleSubmit}>✔</Styled.AddTaskButton>
    </Styled.NewTask>
  );
};

const TaskGroup = ({ status, project, tasks }) => {
  const { addTask, updateTask } = useTasks();

  const { droppable, hoveredBy } = useDroppable({
    accepts: ({ kind, data }) =>
      kind === "TASK" && data.task.project === project.id,
    onDrop({ data, dropTargets }) {
      // we are the only drop target
      if (dropTargets.length === 1) {
        updateTask(data.task, { status, order: 1e10 });
      }
    },
  });

  const [newTaskVisible, setNewTaskVisible] = useState(false);

  const showNewTask = () => {
    setNewTaskVisible(true);
  };

  const submitNewTask = (task) => {
    addTask({ ...task, order: 1e10 });
    setNewTaskVisible(false);
  };

  const cancelNewTask = () => {
    setNewTaskVisible(false);
  };

  return droppable(
    <Styled.TaskGroup $hovered={!!hoveredBy}>
      <Styled.TaskGroupHeader>
        <Styled.TaskGroupTitle>{project.title}</Styled.TaskGroupTitle>
        <Styled.AddTaskButton onClick={showNewTask}>➕</Styled.AddTaskButton>
      </Styled.TaskGroupHeader>
      {tasks.length > 0 &&
        tasks.map((task, idx) => <Task key={task.id} task={task} />)}
      {tasks.length === 0 && !newTaskVisible && (
        <Styled.NoTasksPlaceholder>No tasks</Styled.NoTasksPlaceholder>
      )}
      {newTaskVisible && (
        <NewTask
          status={status}
          project={project}
          onSubmit={submitNewTask}
          onCancel={cancelNewTask}
        />
      )}
    </Styled.TaskGroup>
  );
};

const Column = ({ name, status, tasks }) => {
  return (
    <Styled.Column>
      <Styled.ColumnHeader>{name}</Styled.ColumnHeader>
      {projects.map((project) => (
        <TaskGroup
          key={project.id}
          status={status}
          project={project}
          tasks={tasks
            .filter((task) => task.project === project.id)
            .sort((a, b) => a.order - b.order)}
        />
      ))}
    </Styled.Column>
  );
};

const Dashboard = () => {
  const { tasks } = useTasks();

  return (
    <Styled.DashboardColumns>
      {columns.map((column) => (
        <Column
          key={column.status}
          name={column.name}
          status={column.status}
          tasks={tasks.filter((task) => task.status === column.status)}
        />
      ))}
    </Styled.DashboardColumns>
  );
};

export default function App() {
  return (
    <TasksProvider>
      <Dashboard />
      <Overlay />
    </TasksProvider>
  );
}
