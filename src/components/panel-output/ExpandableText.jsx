import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const ExpandableTextBox = ({ content, collapsedHeight = 200 }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(prev => !prev);

  const containerStyle = {
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    wordWrap: 'break-word',
    maxHeight: expanded ? 'none' : collapsedHeight,
    overflowY: 'hidden',
    transition: 'max-height 0.3s ease'
  };

  return (
    <div>
        <button onClick={toggleExpand}>
        {expanded ? 'Show Less' : 'Show More'}
      </button>
      <div style={containerStyle}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      
    </div>
  );
};

export default ExpandableTextBox;
