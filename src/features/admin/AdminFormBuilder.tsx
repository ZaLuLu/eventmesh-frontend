import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Settings2, Eye } from 'lucide-react'
import { FormField, FormFieldType } from '@/api'
import { Field } from '@/design-system/primitives/Field'
import { FormRenderer } from '../registration/FormRenderer'

interface SortableFieldItemProps {
  field: FormField
  onUpdate: (updated: FormField) => void
  onDelete: (id: string) => void
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  onUpdate,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const [expanded, setExpanded] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3.5 bg-surface border border-line rounded-panel space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-text-3 hover:text-text"
            aria-label="Drag to reorder field"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex items-baseline gap-2 truncate">
            <span className="text-small font-medium text-text truncate">
              {field.label || 'Untitled Field'}
            </span>
            <span className="text-caption bg-subtle text-text-2 px-1.5 py-0.5 rounded capitalize">
              {field.type}
            </span>
            {field.required && (
              <span className="text-caption text-danger font-semibold">
                *Required
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-text-3 hover:text-text rounded-btn transition-colors"
            title="Configure Field"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(field.id)}
            className="p-1.5 text-text-3 hover:text-danger rounded-btn transition-colors"
            title="Delete Field"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pt-3 border-t border-line space-y-3 text-small">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              surface="admin"
              label="Field label"
              value={field.label}
              onChange={(e) => onUpdate({ ...field, label: e.target.value })}
            />
            <Field
              surface="admin"
              label="Placeholder (optional)"
              value={field.placeholder || ''}
              onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
            />
          </div>

          <Field
            surface="admin"
            label="Help text (optional)"
            value={field.helpText || ''}
            onChange={(e) => onUpdate({ ...field, helpText: e.target.value })}
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-small text-text">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
                className="h-4 w-4 rounded text-accent"
              />
              <span>Mandatory / required field</span>
            </label>

            {field.type === 'select' && (
              <div className="flex-1 max-w-xs ml-4">
                <Field
                  surface="admin"
                  label="Options (comma-separated)"
                  value={(field.options || []).join(', ')}
                  onChange={(e) =>
                    onUpdate({
                      ...field,
                      options: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export interface AdminFormBuilderProps {
  fields: FormField[]
  onChange: (newFields: FormField[]) => void
}

export const AdminFormBuilder: React.FC<AdminFormBuilderProps> = ({
  fields,
  onChange,
}) => {
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({})
  const [showPreview, setShowPreview] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)
      onChange(arrayMove(fields, oldIndex, newIndex))
    }
  }

  const handleAddField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      options: type === 'select' ? ['Option A', 'Option B'] : undefined,
    }
    onChange([...fields, newField])
  }

  const handleUpdateField = (updated: FormField) => {
    onChange(fields.map((f) => (f.id === updated.id ? updated : f)))
  }

  const handleDeleteField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
        <div>
          <h3 className="text-h3 font-semibold text-text">
            Registration Form Schema Builder
          </h3>
          <p className="text-caption text-text-2">
            Drag to reorder questions. Fields automatically validate and render in the public registration flow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-line rounded-btn text-small font-medium hover:bg-subtle text-text transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span>{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Builder Pane */}
        <div className={showPreview ? 'lg:col-span-7 space-y-3' : 'lg:col-span-12 space-y-3'}>
          {/* Quick Add Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-3 bg-surface border border-line rounded-panel">
            <span className="text-caption font-semibold text-text mr-1">
              + Add Field:
            </span>
            {(['text', 'select', 'checkbox', 'longtext', 'email', 'phone', 'number'] as FormFieldType[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAddField(type)}
                  className="px-2.5 py-1 bg-subtle hover:bg-accent hover:text-on-accent text-caption rounded-btn font-medium transition-colors capitalize"
                >
                  +{type}
                </button>
              )
            )}
          </div>

          {/* Sortable List */}
          {fields.length === 0 ? (
            <div className="p-8 border border-dashed border-line rounded-panel text-center text-small text-text-3">
              No custom questionnaire fields defined. Click a button above to append fields.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2.5">
                  {fields.map((f) => (
                    <SortableFieldItem
                      key={f.id}
                      field={f}
                      onUpdate={handleUpdateField}
                      onDelete={handleDeleteField}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Right Live Preview Pane */}
        {showPreview && (
          <div className="lg:col-span-5 border border-line rounded-panel p-5 bg-surface space-y-3">
            <span className="text-caption font-semibold text-accent block border-b border-line pb-2">
              Attendee perspective (live preview)
            </span>
            <FormRenderer
              fields={fields}
              values={previewValues}
              onChange={(k, v) => setPreviewValues((prev) => ({ ...prev, [k]: v }))}
            />
          </div>
        )}
      </div>
    </div>
  )
}
