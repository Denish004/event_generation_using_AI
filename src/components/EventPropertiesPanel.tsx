// import { UserFlow } from '../App';
// import { Plus, Settings, BarChart3 } from 'lucide-react';

// interface EventPropertiesPanelProps {
//   userFlow: UserFlow;
//   onFlowUpdate: (flow: UserFlow) => void;
// }

// function EventPropertiesPanel({ userFlow, onFlowUpdate }: EventPropertiesPanelProps) {
//   return (
//     <div className="p-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Properties</h2>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 Configure and manage event properties for your user journey
//               </p>
//             </div>
            
//             <div className="flex space-x-3">
//               <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
//                 <Plus className="h-4 w-4" />
//                 <span>Add Event</span>
//               </button>
//             </div>
//           </div>

//           {/* Events List */}
//           {userFlow.events.length > 0 ? (
//             <div className="space-y-4">
//               {userFlow.events.map((event) => (
//                 <div key={event.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <h3 className="font-medium text-gray-900 dark:text-white">{event.name}</h3>
//                     <div className="flex items-center space-x-2">
//                       <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
//                         {event.category}
//                       </span>
//                       <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
//                         <Settings className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                       <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Triggers:</p>
//                       <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
//                         {event.triggers.map((trigger, idx) => (
//                           <li key={idx}>• {trigger}</li>
//                         ))}
//                       </ul>
//                     </div>
                    
//                     <div>
//                       <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sources:</p>
//                       <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
//                         {event.sources.map((source, idx) => (
//                           <li key={idx}>• {source}</li>
//                         ))}
//                       </ul>
//                     </div>
                    
//                     <div>
//                       <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Properties ({event.properties.length}):
//                       </p>
//                       <div className="space-y-1">
//                         {event.properties.slice(0, 3).map((prop) => (
//                           <div key={prop.name} className="text-sm text-gray-600 dark:text-gray-400">
//                             <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
//                               {prop.name}
//                             </span>
//                             <span className="ml-2 text-xs text-gray-500">
//                               ({prop.type})
//                             </span>
//                           </div>
//                         ))}
//                         {event.properties.length > 3 && (
//                           <p className="text-xs text-gray-500">
//                             +{event.properties.length - 3} more...
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
//                 No Events Yet
//               </h3>
//               <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
//                 Capture your drawing and run AI analysis to automatically identify events and their properties.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EventPropertiesPanel;
