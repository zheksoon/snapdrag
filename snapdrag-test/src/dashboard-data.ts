export const columns = [
  { name: "Todo", status: "todo" },
  { name: "In Progress", status: "in-progress" },
  { name: "Done", status: "done" },
];

export const projects = ["Project 1", "Project 2"];

export const tasks = [
  { id: 1, title: "Implement login functionality", project: "Project 1", status: "todo", order: 0 },
  { id: 2, title: "Refactor API integration", project: "Project 2", status: "todo", order: 2 },
  {
    id: 3,
    title: "Fix bug in data validation",
    project: "Project 1",
    status: "in-progress",
    order: 2,
  },
  { id: 4, title: "Add new feature", project: "Project 2", status: "in-progress", order: 1 },
  { id: 5, title: "Write unit tests", project: "Project 1", status: "done", order: 0 },
  { id: 6, title: "Optimize performance", project: "Project 2", status: "done", order: 1 },
  { id: 7, title: "Design user interface", project: "Project 1", status: "todo", order: 1 },
  { id: 8, title: "Implement data caching", project: "Project 2", status: "in-progress", order: 0 },
  {
    id: 9,
    title: "Deploy application to production",
    project: "Project 1",
    status: "done",
    order: 2,
  },
  // Add more tasks here
  { id: 10, title: "Write documentation", project: "Project 2", status: "todo", order: 0 },
  { id: 11, title: "Fix styling issues", project: "Project 1", status: "in-progress", order: 1 },
  {
    id: 12,
    title: "Add internationalization support",
    project: "Project 2",
    status: "done",
    order: 2,
  },
];
