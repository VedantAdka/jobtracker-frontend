import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import ApplicationCard from './ApplicationCard'

const COLUMNS = [
  { key: 'APPLIED', label: 'Applied', dot: '#3B82F6' },
  { key: 'INTERVIEW', label: 'Interview', dot: '#F59E0B' },
  { key: 'OFFER', label: 'Offer', dot: '#10B981' },
  { key: 'REJECTED', label: 'Rejected', dot: '#F43F5E' },
]

export default function KanbanBoard({ applications, onDragEnd, onCardClick }) {
  const byStatus = (status) => applications.filter((app) => app.status === status)

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">
        {COLUMNS.map((column) => (
          <Droppable droppableId={column.key} key={column.key}>
            {(provided) => (
              <div
                className={`board-column col-${column.key.toLowerCase()}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div className={`column-header column-${column.key.toLowerCase()}`}>
                  <span className="column-header-label">
                    <span className="column-dot" style={{ background: column.dot }} />
                    {column.label}
                  </span>
                  <span className="column-count">{byStatus(column.key).length}</span>
                </div>

                <div className="column-cards">
                  {byStatus(column.key).map((app, index) => (
                    <Draggable draggableId={String(app.id)} index={index} key={app.id}>
                      {(dragProvided, snapshot) => (
                        <ApplicationCard
                          application={app}
                          innerRef={dragProvided.innerRef}
                          draggableProps={dragProvided.draggableProps}
                          dragHandleProps={dragProvided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                          onClick={() => onCardClick(app)}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}
