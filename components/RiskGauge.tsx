
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { RiskLevel } from '../types';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level }) => {
  const data = [
    { name: 'Risk', value: score },
    { name: 'Safety', value: 100 - score },
  ];

  const getColor = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'Low': return '#22c55e'; // green-500
      case 'Medium': return '#eab308'; // yellow-500
      case 'High': return '#ef4444'; // red-500
      default: return '#6366f1';
    }
  };

  return (
    <div className="relative w-full h-48 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={getColor(level)} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-2 text-center">
        <span className="text-3xl font-bold block" style={{ color: getColor(level) }}>{level}</span>
        <span className="text-sm text-slate-500 font-medium">Risk Score: {score}/100</span>
      </div>
    </div>
  );
};

export default RiskGauge;
