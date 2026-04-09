import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetBuild, useDeleteBuild, useRemoveItem } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Edit, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import BuildEditorDialog from '../components/BuildEditorDialog';
import ItemEditorDialog from '../components/ItemEditorDialog';
import ConfirmDestructiveDialog from '../components/ConfirmDestructiveDialog';
import BuildImportExportPanel from '../components/BuildImportExportPanel';
import { formatDistanceToNow } from 'date-fns';
import type { Item } from '../backend';

export default function BuildDetailPage() {
  const { buildId } = useParams({ from: '/build/$buildId' });
  const navigate = useNavigate();
  const { data: build, isLoading, isError } = useGetBuild(BigInt(buildId));
  const deleteBuild = useDeleteBuild();
  const removeItem = useRemoveItem();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  const handleDelete = async () => {
    await deleteBuild.mutateAsync(BigInt(buildId));
    navigate({ to: '/' });
  };

  const handleRemoveItem = async (item: Item) => {
    await removeItem.mutateAsync({ buildId: BigInt(buildId), itemId: item.id });
    setDeletingItem(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-8 h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !build) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load build. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalCost = build.items.reduce((sum, item) => sum + (item.cost || 0) * Number(item.quantity), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Builds
      </Button>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h2 className="mb-2 text-3xl font-bold tracking-tight">{build.name}</h2>
          <p className="mb-4 text-muted-foreground">{build.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Created {formatDistanceToNow(Number(build.createdAt) / 1000000, { addSuffix: true })}</span>
            <span>•</span>
            <span>Updated {formatDistanceToNow(Number(build.updatedAt) / 1000000, { addSuffix: true })}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <BuildImportExportPanel build={build} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                {build.items.length} {build.items.length === 1 ? 'item' : 'items'}
                {totalCost > 0 && ` • Total cost: $${totalCost.toFixed(2)}`}
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddItemDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {build.items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-muted-foreground">No items yet</p>
              <Button onClick={() => setShowAddItemDialog(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {build.items.map((item) => (
                    <TableRow key={item.id.toString()}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity.toString()}</TableCell>
                      <TableCell className="text-right">
                        {item.cost !== undefined ? `$${item.cost.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.cost !== undefined ? `$${(item.cost * Number(item.quantity)).toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {item.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingItem(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeletingItem(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BuildEditorDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        build={build}
        onSuccess={() => setShowEditDialog(false)}
      />

      <ItemEditorDialog
        open={showAddItemDialog}
        onOpenChange={setShowAddItemDialog}
        buildId={BigInt(buildId)}
        onSuccess={() => setShowAddItemDialog(false)}
      />

      {editingItem && (
        <ItemEditorDialog
          open={true}
          onOpenChange={(open) => !open && setEditingItem(null)}
          buildId={BigInt(buildId)}
          item={editingItem}
          onSuccess={() => setEditingItem(null)}
        />
      )}

      {deletingItem && (
        <ConfirmDestructiveDialog
          open={true}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          title="Remove Item"
          description={`Are you sure you want to remove "${deletingItem.name}"? This action cannot be undone.`}
          onConfirm={() => handleRemoveItem(deletingItem)}
        />
      )}

      <ConfirmDestructiveDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Build"
        description={`Are you sure you want to delete "${build.name}"? This will permanently remove the build and all its items. This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete Build"
      />
    </div>
  );
}
