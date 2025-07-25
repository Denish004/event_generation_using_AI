import { createContext, useState, ReactNode } from 'react'
import { StoreSnapshot, TLRecord } from 'tldraw'

interface AppContextType {
  drawingData: StoreSnapshot<TLRecord> | null
  setDrawingData: (data: StoreSnapshot<TLRecord>) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export { AppContext }

export function AppProvider({ children }: { children: ReactNode }) {
  const [drawingData, setDrawingData] = useState<StoreSnapshot<TLRecord> | null>(null)

  return (
    <AppContext.Provider value={{ drawingData, setDrawingData }}>
      {children}
    </AppContext.Provider>
  )
}
