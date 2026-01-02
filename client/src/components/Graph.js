import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Graph.css';

function Graph({ wpmHistory, errorHistory, timeHistory, testDuration }) {
  // Prepare data for the graph
  const data = [];
  for (let i = 0; i < testDuration; i++) {
    data.push({
      time: i + 1,
      wpm: wpmHistory[i] || 0,
      errors: errorHistory[i] || 0
    });
  }

  return (
    <div className="graph-container">
      <h3>Performance Graph</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
            stroke="#888888"
          />
          <YAxis 
            yAxisId="left"
            label={{ 
              value: 'Words per Minute', 
              angle: -90, 
              position: 'insideLeft',
              offset: 0,
              style: { textAnchor: 'middle' }
            }}
            stroke="#ffd700"
            domain={[0, 'dataMax + 20']}
            width={60}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            label={{ value: 'Errors', angle: 90, position: 'insideRight' }}
            stroke="#888888"
            domain={[0, 'dataMax + 1']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#2a2a2a', 
              border: '1px solid #4a4a4a',
              color: '#ffffff'
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="wpm" 
            stroke="#ffd700" 
            strokeWidth={2}
            dot={false}
            name="WPM"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="errors" 
            stroke="#888888" 
            strokeWidth={1.5}
            dot={{ fill: '#f87171', r: 3 }}
            name="Errors"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Graph;

