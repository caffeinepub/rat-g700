import type { Build, Item } from '../backend';

const SCHEMA_VERSION = '1.0';

interface ExportFormat {
  schemaVersion: string;
  name: string;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    cost?: number;
    notes?: string;
  }>;
  exportedAt: string;
}

export interface ImportResult {
  valid: boolean;
  errors: string[];
  data?: {
    name: string;
    description: string;
    items: Item[];
  };
}

export function exportBuild(build: Build): void {
  const exportData: ExportFormat = {
    schemaVersion: SCHEMA_VERSION,
    name: build.name,
    description: build.description,
    items: build.items.map((item) => ({
      name: item.name,
      quantity: Number(item.quantity),
      cost: item.cost,
      notes: item.notes,
    })),
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${build.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBuild(jsonString: string): ImportResult {
  const errors: string[] = [];

  try {
    const data = JSON.parse(jsonString);

    // Validate schema version
    if (!data.schemaVersion) {
      errors.push('Missing schemaVersion field');
    } else if (data.schemaVersion !== SCHEMA_VERSION) {
      errors.push(`Unsupported schema version: ${data.schemaVersion}. Expected: ${SCHEMA_VERSION}`);
    }

    // Validate required fields
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Missing or invalid "name" field');
    }
    if (!data.description || typeof data.description !== 'string') {
      errors.push('Missing or invalid "description" field');
    }
    if (!Array.isArray(data.items)) {
      errors.push('Missing or invalid "items" field (must be an array)');
    }

    // Validate items
    if (Array.isArray(data.items)) {
      data.items.forEach((item: any, index: number) => {
        if (!item.name || typeof item.name !== 'string') {
          errors.push(`Item ${index + 1}: Missing or invalid "name" field`);
        }
        if (typeof item.quantity !== 'number' || item.quantity < 1) {
          errors.push(`Item ${index + 1}: Missing or invalid "quantity" field (must be a positive number)`);
        }
        if (item.cost !== undefined && (typeof item.cost !== 'number' || item.cost < 0)) {
          errors.push(`Item ${index + 1}: Invalid "cost" field (must be a non-negative number)`);
        }
        if (item.notes !== undefined && typeof item.notes !== 'string') {
          errors.push(`Item ${index + 1}: Invalid "notes" field (must be a string)`);
        }
      });
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Convert to internal format
    const items: Item[] = data.items.map((item: any) => ({
      id: BigInt(0), // Will be assigned by backend
      name: item.name,
      quantity: BigInt(item.quantity),
      cost: item.cost,
      notes: item.notes,
    }));

    return {
      valid: true,
      errors: [],
      data: {
        name: data.name,
        description: data.description,
        items,
      },
    };
  } catch (error) {
    return {
      valid: false,
      errors: ['Invalid JSON format'],
    };
  }
}
