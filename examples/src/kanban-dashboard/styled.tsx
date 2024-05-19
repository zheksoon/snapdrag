import styled from "styled-components";

export const theme = {
  colors: {
    primary: "#42a5f5",
    background: {
      gradient: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      light: "rgba(255, 255, 255, 0.8)",
      placeholder: "#f0f0f0",
    },
    text: {
      default: "#333",
      muted: "#888",
    },
    border: "#eee",
    shadow: "rgba(0, 0, 0, 0.1)",
    hover: "#e3f2fd",
    success: "green",
    danger: "#f44336",
  },
};

export const DashboardColumns = styled.div`
  display: flex;
  background: ${theme.colors.background.gradient};
  font-family: "Roboto", sans-serif;
  color: ${theme.colors.text.default};
  height: 100vh;
`;


export const Column = styled.div`
  flex: 1;
  padding: 16px;
  background-color: ${theme.colors.background.light};
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 8px ${theme.colors.shadow};
  overflow: scroll;
`;


export const ColumnHeader = styled.h1``;


export const TaskGroup = styled.div<{ $hovered: boolean }>`
  position: relative;
  margin: 16px 0;
  padding: 10px;
  background: ${theme.colors.background.light};
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  box-shadow: 0 2px 4px ${theme.colors.shadow};

  &:hover {
    background-color: ${theme.colors.hover};
  }

  ${(props) => props.$hovered && `background-color: ${theme.colors.hover}`}
`;


export const TaskGroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
`;


export const TaskGroupTitle = styled.h2`
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid ${theme.colors.border};
  font-size: 1.2em;
`;


export const NoTasksPlaceholder = styled.div`
  color: ${theme.colors.text.muted};
  font-style: italic;
  margin-top: 10px;
`;


export const Button = styled.button`
  font-size: 14px;
  line-height: 14px;
  background-color: ${theme.colors.background.light};
  padding-left: 4px;
  padding-right: 4px;
  padding-top: 6px;
  padding-bottom: 3px;
  border: 1px solid ${theme.colors.border};
  border-radius: 4px;
  box-shadow: 0 2px 4px ${theme.colors.shadow};
`;


export const NewTask = styled.div`
  position: relative;
  margin: 10px 0;
  padding: 8px;
  background-color: ${theme.colors.background.placeholder};
  display: flex;
  align-items: center;
  border-radius: 4px;
  box-shadow: 0 1px 3px ${theme.colors.shadow};
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
  color: ${theme.colors.success};
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
    border: 1px solid ${theme.colors.danger};
  }
`;


export const Task = styled.div`
  padding: 8px;
  background-color: ${theme.colors.background.placeholder};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  box-shadow: 0 1px 3px ${theme.colors.shadow};
`;


export const TaskTitle = styled.div`
  flex: 1;
`;


export const TaskWrapper = styled.div.attrs({
  // @ts-expect-error
  "data-drag-source": "false",
})<{ $isDragging: boolean }>`
  position: relative;
  margin: 10px 0;

  ${(props) => props.$isDragging && `opacity: 0.8; width: 300px;`}
`;


export const DragHandle = styled.div.attrs({
  // @ts-expect-error
  "data-drag-source": "true",
})`
  cursor: move;
  padding: 4px 8px;
  user-select: none;
  margin-right: 10px;
  color: ${theme.colors.primary};
  touch-action: none;
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
