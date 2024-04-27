import cx from "classnames";
import { useObserver } from "onek/react";
import { groupBy, mapValues, partition } from "lodash";
import { Overlay, useDraggable, useDroppable } from "../../react/src/react-new";

import { columns, projects, tasks, setTasks } from "./dashboard-data";
import "./Kanban.styles.css";

const updateTask = (task, data) => {
  setTasks((tasks) => {
    const newTasks = tasks.map((_task) => (task.id === _task.id ? { ..._task, ...data } : _task));

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
  const { draggable, isDragging } = useDraggable({
    kind: "TASK",
    data: { task },
    move: true,
  });

  const { droppable, hoveredBy } = useDroppable({
    accepts: ({ kind, data }) => kind === "TASK" && data.task.project === task.project,
    onDrop({ sourceData }) {
      updateTask(sourceData.task, { status: task.status, order: task.order - 0.5 });
    },
  });

  return droppable(
    draggable(
      <div className={cx("task-wrapper", isDragging && "dragging")}>
        {!isDragging && hoveredBy && <div className="task-drop-line" />}
        <div className="task">{task.title}</div>
      </div>
    )
  );
};

const TaskGroup = ({ status, project, tasks }) => {
  const { droppable, hoveredBy } = useDroppable({
    accepts: ({ kind, data }) => kind === "TASK" && data.task.project === project,
    onDrop({ sourceData, dropTargets }) {
      // we are the only drop target here, so task does not accept the drop
      if (dropTargets.size === 1) {
        updateTask(sourceData.task, { status, order: tasks.length + 1 });
      }
    },
  });

  return droppable(
    <div className={cx("task-group", hoveredBy && "hovered")}>
      <h2>{project}</h2>
      {tasks.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </div>
  );
};

const Column = ({ name, status, tasks }) => {
  return useObserver()(() => {
    const tasksForStatus = tasks().filter((task) => task.status === status);
    const tasksByProject = mapValues(
      groupBy(tasksForStatus, (task) => task.project),
      (tasks) => tasks.sort((a, b) => a.order - b.order)
    );

    return (
      <div className="column">
        <h1>{name}</h1>
        {projects.map((project) => (
          <TaskGroup
            key={project}
            status={status}
            project={project}
            tasks={tasksByProject[project] || []}
          />
        ))}
      </div>
    );
  });
};

const KanbanDashboard = () => {
  return (
    <div className="dashboard">
      {columns.map((column) => (
        <Column key={column.status} {...column} tasks={tasks} />
      ))}
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
