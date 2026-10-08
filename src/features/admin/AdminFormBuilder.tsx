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
import { GripVertical, Plus, Trash2, Settings2, Eye } from 'lucide-react'
import { FormField, FormFieldType } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { Select } from '@/design-system/primitives/Select'
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
      className="p-4 bg-paper border border-[#C9D0D4] space-y-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-ink-60 hover:text-ink"
            aria-label="Drag to reorder field"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex items-baseline gap-2 truncate">
            <span className="font-body text-sm font-bold uppercase text-ink truncate">
              {field.label || 'Untitled Field'}
            </span>
            <span className="font-mono text-[10px] uppercase text-ink-60 bg-[#E6EAEC] px-1.5 py-0.5">
              {field.type}
            </span>
            {field.required && (
              <span className="font-mono text-[10px] uppercase text-[#A32828] font-bold">
                *Required
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-ink-60 hover:text-ink"
            title="Configure Field"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(field.id)}
            className="p-1 text-ink-60 hover:text-[#A32828]"
            title="Delete Field"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="pt-3 border-t border-[#C9D0D4] space-y-3 font-body text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              surface="admin"
              label="Field Label"
              value={field.label}
              onChange={(e) => onUpdate({ ...field, label: e.target.value })}
            />
            <Field
              surface="admin"
              label="Placeholder (Optional)"
              value={field.placeholder || ''}
              onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
            />
          </div>

          <Field
            surface="admin"
            label="Help Text (Optional)"
            value={field.helpText || ''}
            onChange={(e) => onUpdate({ ...field, helpText: e.target.value })}
          />

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-mono text-xs uppercase text-ink">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
                className="h-4 w-4 rounded-none border border-ink text-admin-accent focus:ring-0"
              />
              <span>Mandatory / Required Field</span>
            </label>

            {field.type === 'select' && (
              <div className="flex-1 max-w-xs ml-4">
                <Field
                  surface="admin"
                  label="Options (Comma-separated)"
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
      label: `New ${type.toUpperCase()} Field`,
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#C9D0D4]">
        <div>
          <h3 className="font-display text-xl uppercase text-ink">
            Registration Form Schema Builder
          </h3>
          <p className="font-body text-xs text-ink-60">
            Drag to reorder questions. Fields automatically validate and render in the public registration flow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#C9D0D4] font-mono text-xs uppercase hover:bg-black/5"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Builder Pane */}
        <div className={showPreview ? 'lg:col-span-7 space-y-4' : 'lg:col-span-12 space-y-4'}>
          {/* Quick Add Buttons */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-paper border border-[#C9D0D4]">
            <span className="font-mono text-[10px] uppercase text-ink-60 mr-2 font-bold">
              + Add Field:
            </span>
            {(['text', 'select', 'checkbox', 'longtext', 'email', 'phone', 'number'] as FormFieldType[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAddField(type)}
                  className="px-2 py-1 bg-[#E6EAEC] hover:bg-admin-accent hover:text-white font-mono text-[10px] uppercase transition-colors"
                >
                  +{type}
                </button>
              )
            )}
          </div>

          {/* Sortable List */}
          {fields.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-[#C9D0D4] text-center font-mono text-xs uppercase text-ink-60">
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
                <div className="space-y-3">
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
          <div className="lg:col-span-5 border-2 border-ink p-6 bg-paper space-y-4">
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block border-b border-ink-15 pb-2">
              Attendee Perspective (Live Preview)
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
