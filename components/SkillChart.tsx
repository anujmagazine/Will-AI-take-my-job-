
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SkillImpact } from '../types';

interface SkillChartProps {
  skills: SkillImpact[];
}

const SkillChart: React.FC<SkillChartProps> = ({ skills }) => {
  return (
    <div className="w-full mt-4">
      <div className="h-64">
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
              tick={{ fill: '#475569', fontWeight: 600 }}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              formatter={(value: number) => [`${value}% Automation Potential`, 'Impact']}
            />
            <Bar dataKey="automationPotential" radius={[0, 6, 6, 0]} barSize={24}>
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

      {/* Color Legend */}
      <div className="mt-6 flex flex-wrap gap-4 px-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Automation Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Moderate Risk (Augmentation)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Automation Potential</span>
        </div>
      </div>
    </div>
  );
};

export default SkillChart;
