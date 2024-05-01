import styled from "styled-components";

export const DashboardColumns = styled.div`
  display: flex;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  font-family: "Roboto", sans-serif;
  color: #333;
  height: 100vh;
`;

export const Column = styled.div`
  flex: 1;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.8);
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: scroll;
`;

export const ColumnHeader = styled.h1``;

export const TaskGroup = styled.div`
  position: relative;
  margin: 16px 0;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #eee;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #e3f2fd;
  }

  ${(props) => props.$hovered && `background-color: #e3f2fd`}
`;

export const TaskGroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
`;

export const TaskGroupTitle = styled.h2`
  margin: 0;
  padding-bottom: 10px; /* Spacing below the header */
  border-bottom: 1px solid #eee; /* Separator for the title */
  font-size: 1.2em; /* Larger, more readable titles */
`;

export const NoTasksPlaceholder = styled.div`
  color: #888; /* Light gray text color */
  font-style: italic; /* Italicize placeholder text */
  margin-top: 10px; /* Spacing above placeholder text */
`;

export const Button = styled.button`
  font-size: 14px;
  line-height: 14px;
  background-color: #f5f7fa;
  padding-left: 4px;
  padding-right: 4px;
  padding-top: 6px;
  padding-bottom: 3px;
  border: 1px solid #e1edff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const NewTask = styled.div`
  position: relative;
  margin: 10px 0;
  padding: 8px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const NewTaskInput = styled.input.attrs({
  type: "text",
})`
  flex: 1;
  border: none;
  padding: 4px;
  border-radius: 4px;
  min-width: 100px;
`;

export const AddTaskButton = styled(Button)`
  color: green;
  border: none;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  width: 40px;
  flex: 0;
  margin-left: 8px;
`;

export const RemoveTaskButton = styled(Button)`
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  width: 40px;
  flex: 0;
  margin-left: 8px;
  border: 1px solid transparent;
  &:hover {
    border: 1px solid #f44336;
  }
`;

export const Task = styled.div`
  padding: 8px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const TaskTitle = styled.div`
  flex: 1;
`;

export const TaskWrapper = styled.div.attrs({
  "data-drag-source": "false",
})`
  position: relative;
  margin: 10px 0;

  ${(props) => props.$isDragging && `opacity: 0.8; width: 300px;`}
`;

export const DragHandle = styled.div.attrs({
  "data-drag-source": "true",
})`
  cursor: move;
  padding: 4px 8px;
  user-select: none;
  margin-right: 10px;
  color: #42a5f5;
`;

export const TaskDropLine = styled.div<{
  $active: boolean;
  $stopAnimation?: boolean;
}>`
  height: 0px;
  transition: height 0.25s ease-out;

  ${(props) => props.$active && `height: 36px;`}

  ${(props) => props.$stopAnimation && `transition: none;`}
`;
