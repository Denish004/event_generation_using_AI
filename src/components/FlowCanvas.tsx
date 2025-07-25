import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  MousePointer, 
  Move, 
  Zap, 
  Trash2, 
  Plus, 
  Square,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Hand
} from 'lucide-react';
import { UserFlow, Screenshot, Annotation, Connection } from '../App';

interface FlowCanvasProps {
  userFlow: UserFlow;
  onFlowUpdate: (flow: UserFlow) => void;
}

type Tool = 'select' | 'move' | 'connect' | 'annotate' | 'pan';
type ConnectionType = 'navigation' | 'action' | 'data-flow';

const FlowCanvas: React.FC<FlowCanvasProps> = ({ userFlow, onFlowUpdate }) => {
  const [tool, setTool] = useState<Tool>('select');
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{screenId: string, annotationId?: string, x: number, y: number} | null>(null);
  const [currentConnectionPath, setCurrentConnectionPath] = useState<string>('');
  const [connectionType, setConnectionType] = useState<ConnectionType>('navigation');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationStart, setAnnotationStart] = useState({ x: 0, y: 0 });
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const connectionColors = {
    navigation: '#3B82F6',
    action: '#10B981',
    'data-flow': '#8B5CF6'
  };

  const annotationColors = {
    button: '#3B82F6',
    input: '#10B981',
    text: '#F59E0B',
    container: '#8B5CF6',
    interaction: '#EF4444'
  };

  const tools = [
    { id: 'select', label: 'Select', icon: MousePointer },
    { id: 'pan', label: 'Pan', icon: Hand },
    { id: 'move', label: 'Move', icon: Move },
    { id: 'annotate', label: 'Annotate', icon: Square },
    { id: 'connect', label: 'Connect', icon: Zap },
  ];

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    setMousePos({ x, y });

    if (isPanning && tool === 'pan') {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging && selectedScreenId && tool === 'move') {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      
      const updatedScreens = userFlow.screens.map(screen => 
        screen.id === selectedScreenId 
          ? { 
              ...screen, 
              position: { 
                x: screen.position.x + deltaX, 
                y: screen.position.y + deltaY 
              } 
            }
          : screen
      );
      
      onFlowUpdate({ ...userFlow, screens: updatedScreens });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isAnnotating && currentAnnotation && selectedScreenId) {
      const screen = userFlow.screens.find(s => s.id === selectedScreenId);
      if (!screen) return;
      
      const screenElement = document.querySelector(`[data-screen-id="${selectedScreenId}"]`);
      if (!screenElement) return;
      
      const screenRect = screenElement.getBoundingClientRect();
      const relativeX = ((e.clientX - screenRect.left) / screenRect.width) * 100;
      const relativeY = ((e.clientY - screenRect.top) / screenRect.height) * 100;
      
      const width = Math.abs(relativeX - annotationStart.x);
      const height = Math.abs(relativeY - annotationStart.y);
      const finalX = Math.min(annotationStart.x, relativeX);
      const finalY = Math.min(annotationStart.y, relativeY);
      
      setCurrentAnnotation({
        ...currentAnnotation,
        x: finalX,
        y: finalY,
        width,
        height
      });
    } else if (isDrawingConnection && connectionStart) {
      // Update connection path for visual feedback
      const startX = connectionStart.x;
      const startY = connectionStart.y;
      const endX = x;
      const endY = y;
      
      // Create smooth curve
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const controlOffset = Math.abs(endX - startX) * 0.3;
      
      const path = `M ${startX} ${startY} Q ${midX + controlOffset} ${midY} ${endX} ${endY}`;
      setCurrentConnectionPath(path);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (tool === 'pan') {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (tool === 'connect') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      
      if (!isDrawingConnection) {
        setConnectionStart({ screenId: '', x, y });
        setIsDrawingConnection(true);
      } else {
        // Complete connection
        if (connectionStart) {
          const newConnection: Connection = {
            id: Math.random().toString(36).substr(2, 9),
            fromScreenId: connectionStart.screenId || 'canvas',
            fromAnnotationId: connectionStart.annotationId || '',
            toScreenId: 'canvas',
            type: connectionType,
            color: connectionColors[connectionType]
          };
          
          const updatedFlow = {
            ...userFlow,
            connections: [...userFlow.connections, newConnection]
          };
          
          onFlowUpdate(updatedFlow);
        }
        setIsDrawingConnection(false);
        setConnectionStart(null);
        setCurrentConnectionPath('');
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setIsDragging(false);
    
    if (isAnnotating && currentAnnotation && selectedScreenId) {
      if (currentAnnotation.width! > 2 && currentAnnotation.height! > 2) {
        const newAnnotation: Annotation = {
          ...currentAnnotation as Annotation,
          label: `Element ${Date.now()}`,
          connections: []
        };
        
        const updatedScreens = userFlow.screens.map(screen => 
          screen.id === selectedScreenId 
            ? { ...screen, annotations: [...screen.annotations, newAnnotation] }
            : screen
        );
        
        onFlowUpdate({ ...userFlow, screens: updatedScreens });
      }
      setIsAnnotating(false);
      setCurrentAnnotation(null);
    }
  };

  const handleScreenClick = (screenId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (tool === 'select') {
      setSelectedScreenId(selectedScreenId === screenId ? null : screenId);
      setSelectedAnnotationId(null);
      setSelectedConnectionId(null);
    } else if (tool === 'connect') {
      const rect = e.currentTarget.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const x = (rect.left + rect.width / 2 - canvasRect.left - pan.x) / zoom;
      const y = (rect.top + rect.height / 2 - canvasRect.top - pan.y) / zoom;
      
      if (!isDrawingConnection) {
        setConnectionStart({ screenId, x, y });
        setIsDrawingConnection(true);
      } else if (connectionStart && connectionStart.screenId !== screenId) {
        // Create connection between screens
        const newConnection: Connection = {
          id: Math.random().toString(36).substr(2, 9),
          fromScreenId: connectionStart.screenId,
          fromAnnotationId: connectionStart.annotationId || '',
          toScreenId: screenId,
          type: connectionType,
          color: connectionColors[connectionType]
        };
        
        const updatedFlow = {
          ...userFlow,
          connections: [...userFlow.connections, newConnection]
        };
        
        onFlowUpdate(updatedFlow);
        setIsDrawingConnection(false);
        setConnectionStart(null);
        setCurrentConnectionPath('');
      }
    }
  };

  const handleScreenMouseDown = (screenId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (tool === 'move') {
      setIsDragging(true);
      setSelectedScreenId(screenId);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (tool === 'annotate') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setIsAnnotating(true);
      setSelectedScreenId(screenId);
      setAnnotationStart({ x, y });
      setCurrentAnnotation({
        id: Math.random().toString(36).substr(2, 9),
        type: 'button',
        x,
        y,
        width: 0,
        height: 0,
        label: '',
        color: annotationColors.button,
        connections: []
      });
    }
  };

  const handleAnnotationClick = (screenId: string, annotationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (tool === 'select') {
      setSelectedScreenId(screenId);
      setSelectedAnnotationId(selectedAnnotationId === annotationId ? null : annotationId);
      setSelectedConnectionId(null);
    } else if (tool === 'connect') {
      const rect = e.currentTarget.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const x = (rect.left + rect.width / 2 - canvasRect.left - pan.x) / zoom;
      const y = (rect.top + rect.height / 2 - canvasRect.top - pan.y) / zoom;
      
      if (!isDrawingConnection) {
        setConnectionStart({ screenId, annotationId, x, y });
        setIsDrawingConnection(true);
      } else if (connectionStart) {
        // Create connection
        const newConnection: Connection = {
          id: Math.random().toString(36).substr(2, 9),
          fromScreenId: connectionStart.screenId,
          fromAnnotationId: connectionStart.annotationId || '',
          toScreenId: screenId,
          toAnnotationId: annotationId,
          type: connectionType,
          color: connectionColors[connectionType]
        };
        
        const updatedFlow = {
          ...userFlow,
          connections: [...userFlow.connections, newConnection]
        };
        
        onFlowUpdate(updatedFlow);
        setIsDrawingConnection(false);
        setConnectionStart(null);
        setCurrentConnectionPath('');
      }
    }
  };

  const deleteSelected = () => {
    if (selectedConnectionId) {
      const updatedConnections = userFlow.connections.filter(c => c.id !== selectedConnectionId);
      onFlowUpdate({ ...userFlow, connections: updatedConnections });
      setSelectedConnectionId(null);
    } else if (selectedAnnotationId && selectedScreenId) {
      const updatedScreens = userFlow.screens.map(screen => 
        screen.id === selectedScreenId 
          ? { ...screen, annotations: screen.annotations.filter(a => a.id !== selectedAnnotationId) }
          : screen
      );
      onFlowUpdate({ ...userFlow, screens: updatedScreens });
      setSelectedAnnotationId(null);
    }
  };

  const resetView = () => {
    setZoom(0.8);
    setPan({ x: 0, y: 0 });
  };

  const getConnectionPath = (connection: Connection) => {
    const fromScreen = userFlow.screens.find(s => s.id === connection.fromScreenId);
    const toScreen = userFlow.screens.find(s => s.id === connection.toScreenId);
    
    if (!fromScreen || !toScreen) return '';
    
    const fromAnnotation = fromScreen.annotations.find(a => a.id === connection.fromAnnotationId);
    const toAnnotation = connection.toAnnotationId 
      ? toScreen.annotations.find(a => a.id === connection.toAnnotationId)
      : null;
    
    // Calculate positions
    const fromX = fromAnnotation 
      ? fromScreen.position.x + (fromAnnotation.x / 100) * 400 + (fromAnnotation.width / 100) * 400 / 2
      : fromScreen.position.x + 200;
    const fromY = fromAnnotation 
      ? fromScreen.position.y + (fromAnnotation.y / 100) * 300 + (fromAnnotation.height / 100) * 300 / 2
      : fromScreen.position.y + 150;
    
    const toX = toAnnotation 
      ? toScreen.position.x + (toAnnotation.x / 100) * 400 + (toAnnotation.width / 100) * 400 / 2
      : toScreen.position.x + 200;
    const toY = toAnnotation 
      ? toScreen.position.y + (toAnnotation.y / 100) * 300 + (toAnnotation.height / 100) * 300 / 2
      : toScreen.position.y + 150;
    
    // Create smooth curved path
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const controlOffset = Math.abs(toX - fromX) * 0.3;
    
    return `M ${fromX} ${fromY} Q ${midX + controlOffset} ${midY} ${toX} ${toY}`;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Tools */}
            <div className="flex items-center space-x-2">
              {tools.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setTool(id as Tool);
                    setIsDrawingConnection(false);
                    setConnectionStart(null);
                    setCurrentConnectionPath('');
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tool === id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            
            {/* Connection Type */}
            {tool === 'connect' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Connection:</span>
                <select
                  value={connectionType}
                  onChange={(e) => setConnectionType(e.target.value as ConnectionType)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value="navigation">Navigation</option>
                  <option value="action">Action</option>
                  <option value="data-flow">Data Flow</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Controls */}
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`p-2 rounded-lg transition-colors ${
                showAnnotations 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => setZoom(Math.min(zoom * 1.2, 3))}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setZoom(Math.max(zoom * 0.8, 0.2))}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            
            <button
              onClick={resetView}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            {(selectedAnnotationId || selectedConnectionId) && (
              <button
                onClick={deleteSelected}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900"
        style={{ 
          cursor: tool === 'pan' ? 'grab' : tool === 'connect' ? 'crosshair' : 'default'
        }}
        onMouseMove={handleCanvasMouseMove}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onClick={() => {
          if (tool === 'select') {
            setSelectedScreenId(null);
            setSelectedAnnotationId(null);
            setSelectedConnectionId(null);
          }
          if (isDrawingConnection && tool !== 'connect') {
            setIsDrawingConnection(false);
            setConnectionStart(null);
            setCurrentConnectionPath('');
          }
        }}
      >
        {/* SVG for connections */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          <defs>
            {/* Arrow markers for different connection types */}
            {Object.entries(connectionColors).map(([type, color]) => (
              <marker
                key={type}
                id={`arrow-${type}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="3"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,0 L0,6 L9,3 z" fill={color} />
              </marker>
            ))}
          </defs>
          
          {/* Existing connections */}
          {userFlow.connections.map(connection => (
            <path
              key={connection.id}
              d={getConnectionPath(connection)}
              stroke={connection.color}
              strokeWidth={selectedConnectionId === connection.id ? 4 : 3}
              fill="none"
              strokeDasharray={connection.type === 'data-flow' ? '8,4' : 'none'}
              markerEnd={`url(#arrow-${connection.type})`}
              className="pointer-events-auto cursor-pointer hover:stroke-opacity-80"
              onClick={(e) => {
                e.stopPropagation();
                if (tool === 'select') {
                  setSelectedConnectionId(connection.id);
                  setSelectedScreenId(null);
                  setSelectedAnnotationId(null);
                }
              }}
            />
          ))}
          
          {/* Current drawing connection */}
          {isDrawingConnection && currentConnectionPath && (
            <path
              d={currentConnectionPath}
              stroke={connectionColors[connectionType]}
              strokeWidth={2}
              fill="none"
              strokeDasharray="4,4"
              className="pointer-events-none"
            />
          )}
        </svg>

        {/* Screenshots */}
        <div 
          className="absolute inset-0"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          {userFlow.screens.map((screen, index) => (
            <div
              key={screen.id}
              data-screen-id={screen.id}
              className={`absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition-all ${
                selectedScreenId === screen.id 
                  ? 'border-purple-500 shadow-xl' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              style={{
                left: screen.position.x,
                top: screen.position.y,
                width: 400,
                height: 600,
                cursor: tool === 'move' ? 'move' : tool === 'annotate' ? 'crosshair' : 'pointer'
              }}
              onClick={(e) => handleScreenClick(screen.id, e)}
              onMouseDown={(e) => handleScreenMouseDown(screen.id, e)}
            >
              {/* Screen Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {screen.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
              </div>
              
              {/* Screenshot */}
              <div className="relative h-[calc(100%-60px)] overflow-hidden">
                <img
                  src={screen.url}
                  alt={screen.name}
                  className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800"
                  draggable={false}
                />
                
                {/* Annotations */}
                {showAnnotations && screen.annotations.map(annotation => (
                  <div
                    key={annotation.id}
                    className={`absolute border-2 cursor-pointer transition-all ${
                      selectedAnnotationId === annotation.id 
                        ? 'border-yellow-400 bg-yellow-400/20 shadow-lg' 
                        : 'border-current hover:bg-current/10'
                    }`}
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`,
                      width: `${annotation.width}%`,
                      height: `${annotation.height}%`,
                      color: annotation.color,
                      minWidth: '8px',
                      minHeight: '8px'
                    }}
                    onClick={(e) => handleAnnotationClick(screen.id, annotation.id, e)}
                  >
                    {selectedAnnotationId === annotation.id && (
                      <div className="absolute -top-8 left-0 bg-current text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {annotation.type} element
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Current annotation being drawn */}
                {isAnnotating && currentAnnotation && selectedScreenId === screen.id && (
                  <div
                    className="absolute border-2 border-dashed border-purple-500 bg-purple-500/10"
                    style={{
                      left: `${currentAnnotation.x}%`,
                      top: `${currentAnnotation.y}%`,
                      width: `${currentAnnotation.width}%`,
                      height: `${currentAnnotation.height}%`
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: connectionColors.navigation }}></div>
              <span>Navigation Flow</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: connectionColors.action }}></div>
              <span>User Action</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: connectionColors['data-flow'] }}></div>
              <span>Data Flow</span>
            </div>
          </div>
          
          <div className="text-right">
            {tool === 'connect' && isDrawingConnection && (
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                Click on target to complete connection
              </span>
            )}
            {tool === 'annotate' && (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Click and drag to create annotation
              </span>
            )}
            {tool === 'move' && (
              <span className="text-green-600 dark:text-green-400 font-medium">
                Click and drag to move screens
              </span>
            )}
            {tool === 'pan' && (
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                Click and drag to pan canvas
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowCanvas;