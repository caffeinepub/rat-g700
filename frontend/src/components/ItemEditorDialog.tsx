import { useState, useEffect } from 'react';
import { useAddItem, useUpdateItem } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Item } from '../backend';

interface ItemEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buildId: bigint;
  item?: Item;
  onSuccess?: () => void;
}

export default function ItemEditorDialog({ open, onOpenChange, buildId, item, onSuccess }: ItemEditorDialogProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const addItem = useAddItem();
  const updateItem = useUpdateItem();

  const isEditing = !!item;
  const mutation = isEditing ? updateItem : addItem;

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity.toString());
      setCost(item.cost !== undefined ? item.cost.toString() : '');
      setNotes(item.notes || '');
    } else {
      setName('');
      setQuantity('1');
      setCost('');
      setNotes('');
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quantity.trim()) return;

    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum < 1) return;

    const costNum = cost.trim() ? parseFloat(cost) : undefined;
    if (cost.trim() && (isNaN(costNum!) || costNum! < 0)) return;

    const itemData: Item = {
      id: item?.id || BigInt(0),
      name: name.trim(),
      quantity: BigInt(quantityNum),
      cost: costNum,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEditing) {
        await updateItem.mutateAsync({ buildId, itemId: item.id, item: itemData });
      } else {
        await addItem.mutateAsync({ buildId, item: itemData });
      }
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the item details below.' : 'Enter the details for the new item.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              autoFocus
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (optional)</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes"
              rows={3}
            />
          </div>
          {mutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to save item. Please try again.</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !quantity.trim() || mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
