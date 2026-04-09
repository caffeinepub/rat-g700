import { useState } from 'react';
import { useSetMetadata } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

export default function FirstRunSetupPage() {
  const [description, setDescription] = useState('');
  const [definitionBuild, setDefinitionBuild] = useState('');
  const setMetadata = useSetMetadata();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && definitionBuild.trim()) {
      setMetadata.mutate({
        description: description.trim(),
        definitionBuild: definitionBuild.trim(),
      });
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to RAT G700</CardTitle>
          <CardDescription>Let's set up your build management tool</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-primary/50 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> RAT G700 is a legitimate build and configuration management tool. It does not provide remote access, device control, or any malware functionality. This tool helps you organize and manage your build configurations, parts lists, and project documentation.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">What does "RAT G700" mean to you?</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Rapid Assembly Toolkit G700, Resource Allocation Tool, etc."
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed in the app header to remind you what this tool represents.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="definitionBuild">What does a "build" represent in your workflow?</Label>
              <Textarea
                id="definitionBuild"
                value={definitionBuild}
                onChange={(e) => setDefinitionBuild(e.target.value)}
                placeholder="e.g., A parts list for a project, a configuration template, a bill of materials, etc."
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                This helps contextualize what you're managing with this tool.
              </p>
            </div>

            {setMetadata.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to save settings. Please try again.</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={!description.trim() || !definitionBuild.trim() || setMetadata.isPending}>
              {setMetadata.isPending ? 'Saving...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
