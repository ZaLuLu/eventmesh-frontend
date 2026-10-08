import { z } from 'zod'

export const FormFieldTypeSchema = z.enum([
  'text',
  'email',
  'phone',
  'select',
  'multiselect',
  'checkbox',
  'file',
  'number',
  'date',
  'longtext',
])

export type FormFieldType = z.infer<typeof FormFieldTypeSchema>

export const FormFieldSchema = z.object({
  id: z.string(),
  type: FormFieldTypeSchema,
  label: z.string().min(1, 'Label is required'),
  helpText: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
})

export type FormField = z.infer<typeof FormFieldSchema>

export const FormSchemaDefinition = z.array(FormFieldSchema)
export type FormSchema = z.infer<typeof FormSchemaDefinition>
