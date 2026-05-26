'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button, Card } from '@chaiforms/ui';
import { Trash2, Copy, Settings, Plus } from 'lucide-react';

export interface Field {
  id: string;
  formId: string;
  fieldType: 'text' | 'email' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
}

interface FieldEditorProps {
  fields: Field[];
  formId: string;
  onFieldAdd: (fieldType: string) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<Field>) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldReorder: (fields: Field[]) => void;
  onFieldDuplicate: (fieldId: string) => void;
  selectedFieldId?: string;
  onSelectField: (fieldId: string) => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'email', label: 'Email' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Button' },
];

export const FieldEditor: React.FC<FieldEditorProps> = ({
  fields,
  formId: _formId,
  onFieldAdd,
  onFieldUpdate: _onFieldUpdate,
  onFieldDelete,
  onFieldReorder,
  onFieldDuplicate,
  selectedFieldId,
  onSelectField,
}) => {
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.index === destination.index) return;

    const newFields = Array.from(fields);
    const [movedField] = newFields.splice(source.index, 1);
    newFields.splice(destination.index, 0, movedField);

    // Update order numbers
    const updatedFields = newFields.map((field, idx) => ({
      ...field,
      order: idx,
    }));

    onFieldReorder(updatedFields);
  };

  return (
    <div className="space-y-4">
      {/* Add Field Buttons */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h3 className="text-sm font-medium text-slate-900 mb-3">Add Field</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {FIELD_TYPES.map((type) => (
            <Button
              key={type.value}
              variant="outline"
              size="sm"
              onClick={() => onFieldAdd(type.value)}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Draggable Fields List */}
      {fields.length === 0 ? (
        <Card className="p-8 text-center bg-slate-50">
          <p className="text-slate-500">No fields yet. Add one to get started!</p>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields-list">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-2 p-2 rounded-lg border-2 transition ${
                  snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200'
                }`}
              >
                {fields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition ${
                          snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                        }`}
                      >
                        <Card
                          onClick={() => onSelectField(field.id)}
                          className={`p-4 cursor-pointer transition ${
                            selectedFieldId === field.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded">
                                  {index + 1}
                                </span>
                                <h4 className="font-medium text-slate-900 truncate">
                                  {field.label || 'Untitled Field'}
                                </h4>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Type: <span className="font-mono">{field.fieldType}</span>
                                {field.required && (
                                  <span className="ml-2 text-red-500">• Required</span>
                                )}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  onFieldDuplicate(field.id);
                                }}
                                className="text-slate-500 hover:text-slate-700"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  onSelectField(field.id);
                                }}
                                className="text-slate-500 hover:text-blue-600"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                  e.stopPropagation();
                                  onFieldDelete(field.id);
                                }}
                                className="text-slate-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};
