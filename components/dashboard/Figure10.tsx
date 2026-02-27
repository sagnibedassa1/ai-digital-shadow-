import React from 'react';

export const Figure10 = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="font-bold text-gray-800 mb-6 text-center text-xl">Integrated System Architecture</h3>
      
      <div className="flex flex-col gap-8 max-w-4xl mx-auto relative">
        
        {/* Layer 4 */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 relative z-10">
          <div className="text-center font-bold text-red-800 mb-4">4. AI ASSISTANT LAYER</div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">DRL Agent<br/>(DDPG)</div>
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">GPT-5.0<br/>Conversational AI</div>
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">Multi-Objective<br/>Optimizer</div>
          </div>
        </div>

        {/* Arrow */}
        <div className="absolute left-1/2 top-[100px] -translate-x-1/2 w-0.5 h-8 bg-gray-400 z-0"></div>

        {/* Layer 3 */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 relative z-10">
          <div className="text-center font-bold text-purple-800 mb-4">3. DIGITAL SHADOW LAYER</div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">DEM Simulations<br/>(EDEM™ 2024)</div>
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">Deep Neural Operator<br/>(DNO) Ensemble</div>
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">Uncertainty<br/>Quantification</div>
          </div>
        </div>

        {/* Arrow */}
        <div className="absolute left-1/2 top-[240px] -translate-x-1/2 w-0.5 h-8 bg-gray-400 z-0"></div>

        {/* Layer 2 */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 relative z-10">
          <div className="text-center font-bold text-yellow-800 mb-4">2. COMMUNICATION LAYER</div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">Edge Computing<br/>(NVIDIA Jetson)</div>
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">5G / LoRaWAN<br/>&lt;20ms latency</div>
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">Cloud Platform<br/>(Azure/AWS)</div>
          </div>
        </div>

        {/* Arrow */}
        <div className="absolute left-1/2 top-[380px] -translate-x-1/2 w-0.5 h-8 bg-gray-400 z-0"></div>

        {/* Layer 1 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 relative z-10">
          <div className="text-center font-bold text-blue-800 mb-4">1. PHYSICAL LAYER</div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">TG-500 Tractor<br/>45 HP</div>
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium">1GKN-180 Tiller<br/>IT225 Blades</div>
            <div className="bg-white p-3 rounded shadow-sm border border-gray-200 text-center text-sm font-medium text-left">
              Sensor Suite:<br/>
              • CAN Bus<br/>
              • GPS<br/>
              • IMU<br/>
              • Soil Moisture
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
