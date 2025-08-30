import React from 'react';
function Legend() {
  const legendItems = [
    { label: 'High Priority', color: '#1f2937' },
    { label: 'Medium Priority', color: '#6b7280' },
    { label: 'Low Priority', color: '#9ca3af' },
    { label: 'Meeting', color: '#3b82f6' },
    { label: 'Milestone', color: '#10b981' }
  ]

  return (
    <div className="legend">
      <span className="legend-title">Legend</span>
      <div className="legend-items">
        {legendItems.map((item, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Legend