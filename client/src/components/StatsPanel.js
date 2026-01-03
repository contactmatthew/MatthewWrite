import React from 'react';
import './StatsPanel.css';

function StatsPanel({ wpm, accuracy, rawWpm, characters, consistency, testType, testDuration, time, errors }) {
  return (
    <div className="stats-panel">
      <div className="stat-item">
        <div className="stat-label">wpm</div>
        <div className="stat-value">{wpm}</div>
      </div>
      
      <div className="stat-item">
        <div className="stat-label">acc</div>
        <div className="stat-value">{accuracy}%</div>
      </div>

      <div className="stat-item">
        <div className="stat-label">test type</div>
        <div className="stat-details">
          <div className="stat-detail-value">time {testDuration}</div>
          <div className="stat-detail-value">{testType}</div>
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">raw</div>
        <div className="stat-value">{rawWpm}</div>
      </div>

      <div className="stat-item">
        <div className="stat-label">characters</div>
        <div className="stat-value">
          {characters.typed}/{characters.incorrect}/{characters.extra}/{characters.missed}
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">error letter count</div>
        <div className="stat-value">{errors || 0}</div>
      </div>

      <div className="stat-item">
        <div className="stat-label">consistency</div>
        <div className="stat-value">{consistency}%</div>
      </div>

      <div className="stat-item">
        <div className="stat-label">time</div>
        <div className="stat-value">{time}s</div>
        <div className="stat-subtext">
          {formatTime(time)} session
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default StatsPanel;

