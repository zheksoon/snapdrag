export interface ITask {
  id: number;
  title: string;
  project: number;
  status: string;
  order: number;
}

export interface IProject {
  id: number;
  title: string;
}

export interface IColumn {
  name: string;
  status: string;
}

export const columns: IColumn[] = [
  { name: "Todo", status: "todo" },
  { name: "In Progress", status: "in-progress" },
  { name: "Done", status: "done" },
];

export const projects: IProject[] = [
  { id: 1, title: "Website Redesign" },
  { id: 2, title: "Mobile App Development" },
];

export const initialTasks: ITask[] = [
  {
    id: 1,
    title: "Implement login functionality",
    project: 1,
    status: "todo",
    order: 0,
  },
  {
    id: 2,
    title: "Refactor API integration",
    project: 2,
    status: "todo",
    order: 2,
  },
  {
    id: 3,
    title: "Fix bug in data validation",
    project: 1,
    status: "in-progress",
    order: 2,
  },
  {
    id: 4,
    title: "Add new feature",
    project: 2,
    status: "in-progress",
    order: 1,
  },
  {
    id: 5,
    title: "Write unit tests",
    project: 1,
    status: "done",
    order: 0,
  },
  {
    id: 6,
    title: "Optimize performance",
    project: 2,
    status: "done",
    order: 1,
  },
  {
    id: 7,
    title: "Design user interface",
    project: 1,
    status: "todo",
    order: 1,
  },
  {
    id: 8,
    title: "Implement data caching",
    project: 2,
    status: "in-progress",
    order: 0,
  },
  {
    id: 9,
    title: "Deploy application to production",
    project: 1,
    status: "done",
    order: 2,
  },
  {
    id: 10,
    title: "Write documentation",
    project: 2,
    status: "todo",
    order: 0,
  },
  {
    id: 11,
    title: "Fix styling issues",
    project: 1,
    status: "in-progress",
    order: 1,
  },
  {
    id: 12,
    title: "Add internationalization support",
    project: 2,
    status: "done",
    order: 2,
  },
];
