import React, { useMemo, useState } from "react";




import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,  
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column } from "./Column";



const initialData = {
  tasks: {
    "task-1": { id: "task-1", content: "Design UI mockup" },
    "task-2": { id: "task-2", content: "Implement authentication" },
    "task-3": { id: "task-3", content: "Write unit tests" },
    "task-4": { id: "task-4", content: "Fix bugs" },
  },
  columns: {
    "to-do": {
      id: "to-do",
      title: "To Do",
      taskIds: ["task-1", "task-2"],
    },
    "in-progress": {
      id: "in-progress",
      title: "In Progress",
      taskIds: ["task-3"],
    },
    "in-review": {
      id: "in-review",
      title: "In Review",
      taskIds: [],
    },
    done: {
      id: "done",
      title: "Done",
      taskIds: ["task-4"],
    },
  },
  columnOrder: ["to-do", "in-progress", "in-review", "done"],
};

export const KanbanMain = () => {
  const [data, setData] = useState(initialData);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(sortableKeyboardCoordinates)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the source and destination columns
    const sourceColumnId = Object.keys(data.columns).find((colId) =>
      data.columns[colId].taskIds.includes(activeId)
    );
    const destColumnId = Object.keys(data.columns).find(
      (colId) =>
        data.columns[colId].taskIds.includes(overId) || colId === overId
    );

    if (!sourceColumnId || !destColumnId) return;

    const sourceColumn = data.columns[sourceColumnId];
    const destColumn = data.columns[destColumnId];

    // Moving within the same column
    if (sourceColumnId === destColumnId) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      const activeIndex = newTaskIds.indexOf(activeId);
      const overIndex = newTaskIds.indexOf(overId);

      if (activeIndex !== overIndex) {
        newTaskIds.splice(activeIndex, 1);
        newTaskIds.splice(overIndex, 0, activeId);

        const newColumn = {
          ...sourceColumn,
          taskIds: newTaskIds,
        };

        setData({
          ...data,
          columns: {
            ...data.columns,
            [sourceColumnId]: newColumn,
          },
        });
      }
    } else {
      // Moving to a different column
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      const destTaskIds = Array.from(destColumn.taskIds);
      const activeIndex = sourceTaskIds.indexOf(activeId);

      sourceTaskIds.splice(activeIndex, 1);

      // If dropped on a column (not a task), append to the end
      if (overId === destColumnId) {
        destTaskIds.push(activeId);
      } else {
        const overIndex = destTaskIds.indexOf(overId);
        destTaskIds.splice(overIndex, 0, activeId);
      }

      const newSourceColumn = {
        ...sourceColumn,
        taskIds: sourceTaskIds,
      };
      const newDestColumn = {
        ...destColumn,
        taskIds: destTaskIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [sourceColumnId]: newSourceColumn,
          [destColumnId]: newDestColumn,
        },
      });
    }
  };

  const sortableColumnIds = useMemo(() => data.columnOrder, [data.columnOrder]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortableColumnIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex justify-center p-4">
          {data?.columnOrder?.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column?.taskIds.map((taskId) => data.tasks[taskId]);
            console.log(tasks)

            return <Column key={column.id} column={column} tasks={tasks} />;
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};
