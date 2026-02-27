import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SensorData } from '../types';
import { Wifi, Thermometer, Droplets, Database, Activity, MapPin } from 'lucide-react';
import { Figure1 } from './dashboard/Figure1';
import { Figure2 } from './dashboard/Figure2';
import { Figure3 } from './dashboard/Figure3';
import { Figure4 } from './dashboard/Figure4';
import { Figure5 } from './dashboard/Figure5';
import { Figure6 } from './dashboard/Figure6';
import { Figure7 } from './dashboard/Figure7';
import { Figure8 } from './dashboard/Figure8';
import { Figure9 } from './dashboard/Figure9';
import { Figure10 } from './dashboard/Figure10';
import { DRLLearningCurve } from './dashboard/DRLLearningCurve';

const Dashboard: React.FC = () => {
  const [streamData, setStreamData] = useState<SensorData[]>([]);
  const [currentReading, setCurrentReading] = useState<SensorData | null>(null);

  // Simulate MQTT Subscription
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();
      
      const newReading: SensorData = {
        timestamp: timeStr,
        moisture: 28 + Math.random() * 4 - 2, // Fluctuates around 28%
        temp: 18 + Math.random() * 2 - 1,
        soc: 26.2, // Static for this demo
        residue: 450 + Math.random() * 10
      };

      setCurrentReading(newReading);
      setStreamData(prev => {
        const next = [...prev, newReading];
        return next.length > 20 ? next.slice(next.length - 20) : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-500 text-xs font-bold uppercase">Field Status</span>
            <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              <Wifi size={10} /> Live
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-800">Field A-04</div>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
             <MapPin size={10} /> Yangtze River Basin
          </div>
        </div>

        <SensorCard 
          label="Soil Moisture" 
          value={currentReading?.moisture.toFixed(1) + '%'} 
          subval="Target: 20-25%"
          icon={<Droplets className="text-blue-500" size={18} />}
        />
        <SensorCard 
          label="Soil Temp" 
          value={currentReading?.temp.toFixed(1) + '°C'} 
          subval="Optimal for decomposition"
          icon={<Thermometer className="text-red-500" size={18} />}
        />
        <SensorCard 
          label="Residue Load" 
          value={currentReading?.residue.toFixed(0) + ' kg/mu'} 
          subval="High Load"
          icon={<Database className="text-yellow-600" size={18} />}
        />
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Real-time Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Activity className="text-agri-700" size={20} /> Field Real Time Data
            </h3>
            <div className="text-xs font-mono text-gray-400">topic: sensors/field_04/telemetry</div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={streamData}>
                <defs>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="timestamp" tick={{fontSize: 10}} tickMargin={10} />
                <YAxis yAxisId="left" domain={[20, 35]} orientation="left" tick={{fontSize: 10}} label={{ value: 'Moisture %', angle: -90, position: 'insideLeft', style: {fontSize: 10} }} />
                <YAxis yAxisId="right" domain={[10, 25]} orientation="right" tick={{fontSize: 10}} label={{ value: 'Temp °C', angle: 90, position: 'insideRight', style: {fontSize: 10} }} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                <Area yAxisId="left" type="monotone" dataKey="moisture" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMoisture)" strokeWidth={2} name="Moisture" />
                <Area yAxisId="right" type="monotone" dataKey="temp" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} name="Temperature" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="font-bold text-gray-800 mb-4">Microservice Health</h3>
           <div className="space-y-4">
              <HealthItem name="User Mgmt Service" status="operational" latency="24ms" />
              <HealthItem name="IoT Ingestion (MQTT)" status="operational" latency="12ms" />
              <HealthItem name="Advisory Engine" status="operational" latency="85ms" />
              <HealthItem name="DEM Data Service" status="degraded" latency="340ms" />
              <HealthItem name="Model Registry (MLflow)" status="operational" latency="45ms" />
           </div>

           <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Recent Alerts</h4>
              <div className="space-y-3">
                <AlertItem time="10:42 AM" msg="High soil moisture detected in Sector 4" type="warning" />
                <AlertItem time="09:15 AM" msg="Advisory model updated to v2.4.1" type="info" />
              </div>
           </div>
        </div>
      </div>

      {/* Analysis Figures */}
      <div className="flex flex-col gap-6 mt-4">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Analysis & Performance Metrics</h2>
        <DRLLearningCurve />
        <Figure10 />
        <Figure1 />
        <Figure2 />
        <Figure3 />
        <Figure4 />
        <Figure5 />
        <Figure6 />
        <Figure7 />
        <Figure8 />
        <Figure9 />
      </div>
    </div>
  );
};

const SensorCard = ({ label, value, subval, icon }: any) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
    <div className="flex justify-between items-start mb-2">
      <span className="text-gray-500 text-xs font-bold uppercase">{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-xs text-gray-400 mt-1">{subval}</div>
  </div>
);

const HealthItem = ({ name, status, latency }: any) => (
  <div className="flex justify-between items-center text-sm">
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${status === 'operational' ? 'bg-green-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
      <span className="text-gray-700">{name}</span>
    </div>
    <span className={`text-xs font-mono ${status === 'operational' ? 'text-green-600' : 'text-yellow-600'}`}>{latency}</span>
  </div>
);

const AlertItem = ({ time, msg, type }: any) => (
  <div className="flex gap-2 items-start">
    <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap mt-0.5">{time}</span>
    <span className={`text-xs leading-tight ${type === 'warning' ? 'text-orange-600' : 'text-blue-600'}`}>{msg}</span>
  </div>
);

export default Dashboard;