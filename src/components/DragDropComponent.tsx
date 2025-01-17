import { useState } from 'react';
import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DragStart } from 'react-beautiful-dnd';
import './DragDropComponent.css';
import { log } from 'console';


interface Item {
  id: string;
  name: string;
  depth: number;
  children?: Item[];
}



const DragDropComponent: React.FC = () => {
  const [items, setItems] = useState<Item[] | null>([
    {
      id: 'league1',
      name: 'Premier League',
      depth: 1,
      children: [
        {
          id: 'team1',
          name: 'Manchester United',
          depth: 2,
          children: [
            {
              id: 'player1',
              name: 'Cristiano Ronaldo',
              depth: 3,
            },
            {
              id: 'player2',
              name: 'Bruno Fernandes',
              depth: 3,
            },
          ],
        },
        {
          id: 'team2',
          name: 'Liverpool',
          depth: 2,
          children: [
            {
              id: 'player3',
              name: 'Mohamed Salah',
              depth: 3,
            },
            {
              id: 'player4',
              name: 'Virgil van Dijk',
              depth: 3,
            },
          ],
        },
      ],
    },
    {
      id: 'league2',
      name: 'La Liga',
      depth: 1,
      children: [
        {
          id: 'team3',
          name: 'Barcelona',
          depth: 2,
          children: [
            {
              id: 'player5',
              name: 'Lionel Messi',
              depth: 3,
            },
            {
              id: 'player6',
              name: 'Antoine Griezmann',
              depth: 3,
            },
          ],
        },
        {
          id: 'team4',
          name: 'Real Madrid',
          depth: 2,
          children: [
            {
              id: 'player7',
              name: 'Karim Benzema',
              depth: 3,
            },
            {
              id: 'player8',
              name: 'Sergio Ramos',
              depth: 3,
            },
          ],
        },
      ],
    },
  ]);
  const [ActiveDepthLevel, setActiveDepthLevel] = useState<number>(0);

  const onBeforeDragStart = (dragStart: DragStart) => {
    const newItems = [...(items || [])];
    const item = getItemById(newItems, dragStart.draggableId);
    console.log('drag',dragStart, item);
    setActiveDepthLevel(item?.depth ?? 0);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return; // Return if dropped outside a droppable area



    const { source, destination } = result;
    const newItems = [...(items || [])];
    const draggedItem = getItemById(newItems, source.droppableId, source.index);
    const targetParent = getItemById(newItems, destination.droppableId);
    const targetIndex = destination.index;

    if (draggedItem && targetParent && draggedItem.depth === (targetParent.depth + 1)) {
      if (source.droppableId === destination.droppableId) {
        // Reorder items within the same parent
        const parent = getItemById(newItems, source.droppableId);
        if (parent && parent.children) {
          parent.children.splice(source.index, 1);
          parent.children.splice(destination.index, 0, draggedItem);
        }
      } else {
        // Move item to a different parent
        const sourceParent = getItemById(newItems, source.droppableId);
        if (sourceParent && sourceParent.children && targetParent.children) {
          sourceParent.children.splice(source.index, 1);
          targetParent.children.splice(targetIndex, 0, draggedItem);
        }
      }
    }


    setActiveDepthLevel(0);
    setItems(newItems);
  };



  const getItemById = (items: Item[] | null, id: string, index: number | null = null): Item | null => {
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === id) {
          if (index !== null && item.children) {
            return item.children[index];
          } else {
            return item;
          }
        }
        if (item.children) {
          const nestedItem = getItemById(item.children, id, index);
          if (nestedItem) return nestedItem;
        }
      }
    }
    return null;
  };


  const renderList = (items: Item[] | null | undefined): JSX.Element[] => {
    if (items) {
      return items.map((item, index) => {
        const style = {
          paddingLeft: `${item.depth * 5}rem`,
          fontSize: `${24 + (3 - item.depth) * 6}px`,
          textAlign: 'left' as const,
          backgroundColor: ActiveDepthLevel === item.depth ? 'rgba(20,45,67,30)':`rgba(0, 0, 0, ${(item.depth / 10)})`, // Rectangle color based on depth level
        };
        console.log('rendering');

        return (
          <>
            <Draggable key={item.id} draggableId={item.id} isDragDisabled={ActiveDepthLevel === item.depth} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                >
                  <div style={style} className="rectangle">
                    <div className="drag-handle" {...provided.dragHandleProps}>
                      {/* Drag handle icon */}
                    </div>
                    <div>{item.name} {index}</div>
                    {item.children &&
                      <Droppable droppableId={item.id} isDropDisabled={(ActiveDepthLevel -1) !== item.depth }>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps}>
                            {renderList(item.children)}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    }
                  </div>
                </div>
              )}
            </Draggable>
          </>
        )
      });
    }
    return [];
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} onBeforeDragStart={onBeforeDragStart} >
      <Droppable droppableId="root" mode="virtual" renderClone={(provided, snapshot, rubric) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="rectangle">
            <div className="drag-handle" {...provided.dragHandleProps}>
              {/* Drag handle icon */}
            </div>
            <div>{items && items[rubric.source.index].name}</div>
            {items && items[rubric.source.index].children && (
              <Droppable droppableId={items[rubric.source.index].id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {renderList(items[rubric.source.index].children)}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        </div>
      )}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {renderList(items)}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragDropComponent;