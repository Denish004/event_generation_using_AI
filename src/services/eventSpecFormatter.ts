import { AnalyticsEvent, EventProperty } from '../NewApp';

export interface EventSpecChunk {
  eventName: string;
  description: string;
  properties: Array<{
    name: string;
    dataType: string;
    source: string;
    description: string;
    mandatory: boolean;
  }>;
  source: string[];
}

export function formatEventsToSpec(events: AnalyticsEvent[]): EventSpecChunk[] {
  return events.map(event => {
    // Compose a description based on event name and triggers
    const description = `When user triggers "${event.name}" via ${event.triggers.join(', ')} on screen ${event.screenId}`;
    // Format properties
    const properties = event.properties.map((prop: EventProperty) => ({
      name: prop.name,
      dataType: prop.type,
      source: prop.source === 'on-screen'
        ? 'UI'
        : prop.source === 'carried-forward'
        ? 'carried'
        : prop.source === 'global'
        ? 'global'
        : 'referrer',
      description: prop.description || '',
      mandatory: !!prop.required,
    }));
    // Use event.sources as source
    return {
      eventName: event.name,
      description,
      properties,
      source: event.sources,
    };
  });
} 