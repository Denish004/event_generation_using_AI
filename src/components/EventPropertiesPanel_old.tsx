// import React, { useState, useEffect } from 'react';
// import { Plus, Trash2, ChevronDown, ChevronRight, Eye, EyeOff, Save, Wand2 } from 'lucide-react';
// import { Screenshot, Event, EventProperty } from '../App';

// interface EventPropertiesPanelProps {
//   screenshot: Screenshot;
//   screenshots: Screenshot[];
//   onEventUpdate: (events: Event[]) => void;
// }

// const EventPropertiesPanel: React.FC<EventPropertiesPanelProps> = ({
//   screenshot,
//   screenshots,
//   onEventUpdate
// }) => {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
//   const [newEventName, setNewEventName] = useState('');
//   const [selectedPropertyType, setSelectedPropertyType] = useState<'string' | 'number' | 'boolean' | 'object' | 'array'>('string');
//   const [selectedPropertySource, setSelectedPropertySource] = useState<'on-screen' | 'carried-forward' | 'global'>('on-screen');

//   const screenIndex = screenshots.findIndex(s => s.id === screenshot.id);

//   const addEvent = () => {
//     if (!newEventName.trim()) return;

//     const newEvent: Event = {
//       id: Math.random().toString(36).substr(2, 9),
//       name: newEventName.toLowerCase().replace(/\s+/g, '_'),
//       properties: [],
//       screen: screenshot.name,
//       description: `Event triggered on ${screenshot.name}`,
//       example: {}
//     };

//     setEvents(prev => [...prev, newEvent]);
//     setExpandedEvents(prev => new Set([...prev, newEvent.id]));
//     setNewEventName('');
//   };

//   const addProperty = (eventId: string) => {
//     const newProperty: EventProperty = {
//       name: 'new_property',
//       type: selectedPropertyType,
//       source: selectedPropertySource,
//       required: true,
//       description: 'Property description',
//       example: selectedPropertyType === 'number' ? 100 : selectedPropertyType === 'boolean' ? true : 'example_value'
//     };

//     setEvents(prev => prev.map(event => 
//       event.id === eventId 
//         ? { ...event, properties: [...event.properties, newProperty] }
//         : event
//     ));
//   };

//   const updateProperty = (eventId: string, propertyIndex: number, updates: Partial<EventProperty>) => {
//     setEvents(prev => prev.map(event => 
//       event.id === eventId 
//         ? {
//             ...event,
//             properties: event.properties.map((prop, idx) => 
//               idx === propertyIndex ? { ...prop, ...updates } : prop
//             )
//           }
//         : event
//     ));
//   };

//   const deleteProperty = (eventId: string, propertyIndex: number) => {
//     setEvents(prev => prev.map(event => 
//       event.id === eventId 
//         ? {
//             ...event,
//             properties: event.properties.filter((_, idx) => idx !== propertyIndex)
//           }
//         : event
//     ));
//   };

//   const deleteEvent = (eventId: string) => {
//     setEvents(prev => prev.filter(event => event.id !== eventId));
//     setExpandedEvents(prev => {
//       const newSet = new Set(prev);
//       newSet.delete(eventId);
//       return newSet;
//     });
//   };

//   const toggleEventExpansion = (eventId: string) => {
//     setExpandedEvents(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(eventId)) {
//         newSet.delete(eventId);
//       } else {
//         newSet.add(eventId);
//       }
//       return newSet;
//     });
//   };

//   const generateAIProperties = async (eventId: string) => {
//     // AI-powered property generation logic
//     const event = events.find(e => e.id === eventId);
//     if (!event) return;

//     // Simulate AI processing
//     const aiProperties: EventProperty[] = [
//       {
//         name: 'user_id',
//         type: 'string',
//         source: 'global',
//         required: true,
//         description: 'Unique identifier for the user',
//         example: 'user_12345'
//       },
//       {
//         name: 'screen_name',
//         type: 'string',
//         source: 'on-screen',
//         required: true,
//         description: 'Name of the current screen',
//         example: screenshot.name
//       }
//     ];

//     // Add context-specific properties based on annotations
//     screenshot.annotations?.forEach(annotation => {
//       if (annotation.type === 'button' && annotation.label.toLowerCase().includes('entry')) {
//         aiProperties.push({
//           name: 'entry_fee',
//           type: 'number',
//           source: 'on-screen',
//           required: true,
//           description: 'Contest entry fee amount',
//           example: 50
//         });
//       }
//       if (annotation.type === 'text' && annotation.label.toLowerCase().includes('contest')) {
//         aiProperties.push({
//           name: 'contest_type',
//           type: 'string',
//           source: 'on-screen',
//           required: true,
//           description: 'Type of contest being joined',
//           example: 'cricket_match'
//         });
//       }
//     });

//     setEvents(prev => prev.map(e => 
//       e.id === eventId 
//         ? { ...e, properties: [...e.properties, ...aiProperties] }
//         : e
//     ));
//   };

//   useEffect(() => {
//     onEventUpdate(events);
//   }, [events, onEventUpdate]);

//   return (
//     <div className="space-y-4">
//       {/* Screen Info */}
//       <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
//         <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
//           Screen {screenIndex + 1}: {screenshot.name}
//         </h3>
//         <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
//           <div>Annotations: {screenshot.annotations?.length || 0}</div>
//           <div>Events: {events.length}</div>
//         </div>
//       </div>

//       {/* Add New Event */}
//       <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
//         <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Add Event</h4>
//         <div className="space-y-3">
//           <input
//             type="text"
//             value={newEventName}
//             onChange={(e) => setNewEventName(e.target.value)}
//             placeholder="e.g., Contest Joined, Button Clicked"
//             className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
//             onKeyPress={(e) => e.key === 'Enter' && addEvent()}
//           />
//           <button
//             onClick={addEvent}
//             disabled={!newEventName.trim()}
//             className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             <Plus className="h-4 w-4" />
//             <span>Add Event</span>
//           </button>
//         </div>
//       </div>

//       {/* Events List */}
//       <div className="space-y-3">
//         {events.map(event => (
//           <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
//             {/* Event Header */}
//             <div className="p-4">
//               <div className="flex items-center justify-between">
//                 <button
//                   onClick={() => toggleEventExpansion(event.id)}
//                   className="flex items-center space-x-2 text-left flex-1"
//                 >
//                   {expandedEvents.has(event.id) ? (
//                     <ChevronDown className="h-4 w-4 text-gray-400" />
//                   ) : (
//                     <ChevronRight className="h-4 w-4 text-gray-400" />
//                   )}
//                   <div>
//                     <h5 className="font-semibold text-gray-900 dark:text-white">
//                       {event.name}
//                     </h5>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       {event.properties.length} properties
//                     </p>
//                   </div>
//                 </button>
                
//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={() => generateAIProperties(event.id)}
//                     className="p-1 text-purple-600 hover:text-purple-700 transition-colors"
//                     title="Generate AI Properties"
//                   >
//                     <Wand2 className="h-4 w-4" />
//                   </button>
//                   <button
//                     onClick={() => deleteEvent(event.id)}
//                     className="p-1 text-red-500 hover:text-red-700 transition-colors"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Expanded Event Content */}
//             {expandedEvents.has(event.id) && (
//               <div className="border-t border-gray-200 dark:border-gray-700 p-4">
//                 {/* Properties */}
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <h6 className="font-medium text-gray-900 dark:text-white">Properties</h6>
//                     <div className="flex items-center space-x-2">
//                       <select
//                         value={selectedPropertyType}
//                         onChange={(e) => setSelectedPropertyType(e.target.value as any)}
//                         className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
//                       >
//                         <option value="string">String</option>
//                         <option value="number">Number</option>
//                         <option value="boolean">Boolean</option>
//                         <option value="object">Object</option>
//                         <option value="array">Array</option>
//                       </select>
//                       <select
//                         value={selectedPropertySource}
//                         onChange={(e) => setSelectedPropertySource(e.target.value as any)}
//                         className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
//                       >
//                         <option value="on-screen">On-screen</option>
//                         <option value="carried-forward">Carried Forward</option>
//                         <option value="global">Global</option>
//                       </select>
//                       <button
//                         onClick={() => addProperty(event.id)}
//                         className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
//                       >
//                         <Plus className="h-3 w-3" />
//                         <span>Add</span>
//                       </button>
//                     </div>
//                   </div>

//                   {event.properties.map((property, index) => (
//                     <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                       <div className="grid grid-cols-2 gap-2 mb-2">
//                         <input
//                           type="text"
//                           value={property.name}
//                           onChange={(e) => updateProperty(event.id, index, { name: e.target.value })}
//                           className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
//                           placeholder="Property name"
//                         />
//                         <div className="flex items-center space-x-1">
//                           <select
//                             value={property.type}
//                             onChange={(e) => updateProperty(event.id, index, { type: e.target.value as any })}
//                             className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white flex-1"
//                           >
//                             <option value="string">String</option>
//                             <option value="number">Number</option>
//                             <option value="boolean">Boolean</option>
//                             <option value="object">Object</option>
//                             <option value="array">Array</option>
//                           </select>
//                           <button
//                             onClick={() => deleteProperty(event.id, index)}
//                             className="p-1 text-red-500 hover:text-red-700 transition-colors"
//                           >
//                             <Trash2 className="h-3 w-3" />
//                           </button>
//                         </div>
//                       </div>
                      
//                       <div className="grid grid-cols-2 gap-2 mb-2">
//                         <select
//                           value={property.source}
//                           onChange={(e) => updateProperty(event.id, index, { source: e.target.value as any })}
//                           className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
//                         >
//                           <option value="on-screen">On-screen</option>
//                           <option value="carried-forward">Carried Forward</option>
//                           <option value="global">Global</option>
//                         </select>
//                         <div className="flex items-center space-x-2">
//                           <label className="flex items-center space-x-1 text-sm">
//                             <input
//                               type="checkbox"
//                               checked={property.required}
//                               onChange={(e) => updateProperty(event.id, index, { required: e.target.checked })}
//                               className="rounded"
//                             />
//                             <span className="text-gray-600 dark:text-gray-400">Required</span>
//                           </label>
//                         </div>
//                       </div>
                      
//                       <input
//                         type="text"
//                         value={property.description}
//                         onChange={(e) => updateProperty(event.id, index, { description: e.target.value })}
//                         className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white mb-2"
//                         placeholder="Property description"
//                       />
                      
//                       <div className="flex items-center space-x-2">
//                         <span className="text-xs text-gray-500 dark:text-gray-400">Example:</span>
//                         <input
//                           type="text"
//                           value={String(property.example)}
//                           onChange={(e) => {
//                             let value: any = e.target.value;
//                             if (property.type === 'number') value = Number(value) || 0;
//                             if (property.type === 'boolean') value = value === 'true';
//                             updateProperty(event.id, index, { example: value });
//                           }}
//                           className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white flex-1"
//                           placeholder="Example value"
//                         />
//                       </div>
//                     </div>
//                   ))}

//                   {event.properties.length === 0 && (
//                     <div className="text-center py-4 text-gray-500 dark:text-gray-400">
//                       <p className="text-sm">No properties defined</p>
//                       <p className="text-xs">Add properties to track event details</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Detected UI Elements */}
//       {screenshot.annotations && screenshot.annotations.length > 0 && (
//         <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
//           <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Detected Elements</h4>
//           <div className="space-y-2">
//             {screenshot.annotations.map(annotation => (
//               <div key={annotation.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
//                 <div className="flex items-center space-x-2">
//                   <div 
//                     className="w-3 h-3 rounded"
//                     style={{ backgroundColor: annotation.color }}
//                   />
//                   <span className="text-sm text-gray-700 dark:text-gray-300">
//                     {annotation.label}
//                   </span>
//                   <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
//                     ({annotation.type})
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EventPropertiesPanel;