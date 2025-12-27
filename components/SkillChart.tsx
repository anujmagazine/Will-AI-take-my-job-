
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SkillImpact } from '../types';

interface SkillChartProps {
  skills: SkillImpact[];
}

const SkillChart: React.FC<SkillChartProps> = ({ skills }) => {
  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={skills}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis 
            dataKey="skill" 
            type="category" 
            width={120} 
            fontSize={12} 
            tick={{ fill: '#475569' }}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="automationPotential" radius={[0, 4, 4, 0]} barSize={20}>
            {skills.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.automationPotential > 70 ? '#ef4444' : entry.automationPotential > 40 ? '#f59e0b' : '#3b82f6'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillChart;
