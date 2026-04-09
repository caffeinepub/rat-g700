import { useState, useEffect } from 'react';
import { useCreateBuild, useUpdateBuild } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Build } from '../backend';

interface BuildEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  build?: Build;
  onSuccess?: () => void;
}

export default function BuildEditorDialog({ open, onOpenChange, build, onSuccess }: BuildEditorDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createBuild = useCreateBuild();
  const updateBuild = useUpdateBuild();

  const isEditing = !!build;
  const mutation = isEditing ? updateBuild : createBuild;

  useEffect(() => {
    if (build) {
      setName(build.name);
      setDescription(build.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [build, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    try {
      if (isEditing) {
        await updateBuild.mutateAsync({
          buildId: build.id,
          data: { name: name.trim(), description: description.trim() },
        });
      } else {
        await createBuild.mutateAsync({ name: name.trim(), description: description.trim() });
      }
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save build:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Build' : 'Create New Build'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the build details below.' : 'Enter the details for your new build.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter build name"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter build description"
              rows={4}
              required
            />
          </div>
          {mutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to save build. Please try again.</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !description.trim() || mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
