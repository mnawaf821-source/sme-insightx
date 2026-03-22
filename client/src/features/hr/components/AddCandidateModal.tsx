import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useJobs } from '../hooks/useHR';

const candidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  jobPostingId: z.string().min(1, 'Select a job'),
  notes: z.string().optional(),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

interface AddCandidateModalProps {
  onSubmit: (data: CandidateFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function AddCandidateModal({ onSubmit, onClose, isLoading }: AddCandidateModalProps) {
  const { data: jobs } = useJobs();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
  });

  const openJobs = (jobs || []).filter((j) => j.status === 'open');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="mx-4 w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Add Candidate</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" placeholder="+1 234 567 890" {...register('phone')} />
            </div>

            <div>
              <Label>Job Posting</Label>
              <select
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                {...register('jobPostingId')}
              >
                <option value="">Select a job...</option>
                {openJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} — {job.department || 'General'}
                  </option>
                ))}
              </select>
              {errors.jobPostingId && <p className="mt-1 text-xs text-red-500">{errors.jobPostingId.message}</p>}
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <textarea
                id="notes"
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                rows={3}
                placeholder="Additional notes..."
                {...register('notes')}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Candidate'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
