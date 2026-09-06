// Presentational only - KanbanBoard hands it the drag props from
// @hello-pangea/dnd so this component doesn't need to know about
// drag-and-drop at all, just how to render a card.
export default function ApplicationCard({
  application,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging,
  onClick,
}) {
  const formattedDate = application.appliedDate
    ? new Date(application.appliedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={onClick}
      className={`app-card${isDragging ? ' dragging' : ''}`}
    >
      <p className="app-card-company">{application.company}</p>
      <p className="app-card-role">{application.jobTitle}</p>
      {formattedDate && <p className="app-card-date">{formattedDate}</p>}
    </div>
  )
}
