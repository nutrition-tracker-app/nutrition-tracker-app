/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
/* eslint-enable no-unused-vars */
import { useSettings } from '../context/settingsContext';
import PropTypes from 'prop-types';

const EditableContent = ({ 
  value, 
  onChange, 
  type = 'text',
  className = '', 
  placeholder = 'Click to edit',
  onSave = null,
  disabled = false
}) => {
  const { editMode } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const inputRef = useRef(null);
  
  // Update editedValue when value changes
  useEffect(() => {
    setEditedValue(value);
  }, [value]);
  
  // Automatically focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleClick = () => {
    if (editMode && !disabled) {
      // Force editing mode to be active when clicked in edit mode
      setIsEditing(true);
    }
  };
  
  const handleChange = (e) => {
    // If it's a number input, convert to number
    if (type === 'number') {
      setEditedValue(e.target.value === '' ? '' : Number(e.target.value));
    } else {
      setEditedValue(e.target.value);
    }
  };
  
  const handleBlur = () => {
    setIsEditing(false);
    
    // Only call onChange if the value actually changed
    if (editedValue !== value) {
      onChange(editedValue);
      
      // Call onSave if provided (for saving to database, etc.)
      if (onSave) {
        onSave(editedValue);
      }
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // This will trigger the blur event handler
    } else if (e.key === 'Escape') {
      setEditedValue(value); // Reset to original value
      setIsEditing(false);
    }
  };
  
  // Set the correct input type props
  const inputProps = {
    type: type === 'number' ? 'number' : 'text',
    className: `w-full px-1 py-0.5 themed-input rounded ${className}`,
    value: editedValue,
    onChange: handleChange,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    ref: inputRef,
    placeholder: placeholder
  };
  
  // Add any extra props for number inputs
  if (type === 'number') {
    inputProps.step = '0.1';
    inputProps.min = '0';
  }
  
  if (isEditing) {
    return <input {...inputProps} />;
  }
  
  return (
    <div 
      className={`editable-content ${editMode && !disabled ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      {value || placeholder}
    </div>
  );
};

EditableContent.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  onSave: PropTypes.func,
  disabled: PropTypes.bool
};

export default EditableContent;