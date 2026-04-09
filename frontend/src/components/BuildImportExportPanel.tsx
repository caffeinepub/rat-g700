import { useState } from 'react';
import { useCreateBuild, useAddItem } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import type { Build } from '../backend';
import { exportBuild, importBuild, type ImportResult } from '../utils/buildImportExport';

interface BuildImportExportPanelProps {
  build: Build;
}

export default function BuildImportExportPanel({ build }: BuildImportExportPanelProps) {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const createBuild = useCreateBuild();
  const addItem = useAddItem();

  const handleExport = () => {
    exportBuild(build);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('idle');
    setImportMessage('');

    try {
      const text = await file.text();
      const result: ImportResult = importBuild(text);

      if (!result.valid) {
        setImportStatus('error');
        setImportMessage(result.errors.join(', '));
        return;
      }

      // Create the build
      const buildId = await createBuild.mutateAsync({
        name: result.data!.name,
        description: result.data!.description,
      });

      // Add all items
      for (const item of result.data!.items) {
        await addItem.mutateAsync({ buildId, item });
      }

      setImportStatus('success');
      setImportMessage(`Successfully imported build "${result.data!.name}" with ${result.data!.items.length} items.`);
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Failed to import build. Please check the file format.');
    }

    // Reset file input
    e.target.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import & Export</CardTitle>
        <CardDescription>Back up your build or import from a file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Build
          </Button>
          <div>
            <Input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <Button asChild variant="outline" className="gap-2">
              <label htmlFor="import-file" className="cursor-pointer">
                <Upload className="h-4 w-4" />
                Import Build
              </label>
            </Button>
          </div>
        </div>

        {importStatus === 'success' && (
          <Alert className="border-primary/50 bg-primary/5">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription>{importMessage}</AlertDescription>
          </Alert>
        )}

        {importStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{importMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
