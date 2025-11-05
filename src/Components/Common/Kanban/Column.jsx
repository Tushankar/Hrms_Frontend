import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { Task } from "./Task";
import {DndContext, closestCenter, useSensor, useSensors, PointerSensor} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'


    // const { CSS } = dndKitUtilities;

export const Column = ({ column, tasks }) => {
    console.log(column,tasks)
    const { setNodeRef } = useSortable({ id: column.id });
    
  return (
    <div ref={setNodeRef} className="bg-gray-100 p-4 rounded w-64 mx-2">
      <h2 className="text-lg font-bold mb-4">{column.title}</h2>
      <SortableContext
        items={column.taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[200px]">
          {tasks?.map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
