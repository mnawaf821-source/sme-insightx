import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import type { JobPosting } from '../api/hr.api';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  status: z.enum(['draft', 'open', 'closed']).default('draft'),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  job?: JobPosting;
  onSubmit: (data: JobFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function JobForm({ job, onSubmit, onClose, isLoading }: JobFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title || '',
      department: job?.department || '',
      description: job?.description || '',
      requirements: job?.requirements || '',
      location: job?.location || '',
      type: job?.type || 'full-time',
      salaryMin: job?.salaryMin || undefined,
      salaryMax: job?.salaryMax || undefined,
      status: job?.status || 'draft',
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{job ? 'Edit Job' : 'Create Job Posting'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" placeholder="e.g. Senior Developer" {...register('title')} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" placeholder="e.g. Engineering" {...register('department')} />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g. Remote" {...register('location')} />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                rows={4}
                placeholder="Describe the role..."
                {...register('description')}
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <textarea
                id="requirements"
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm"
                rows={3}
                placeholder="List requirements..."
                {...register('requirements')}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Type</Label>
                <select className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm" {...register('type')}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <Label htmlFor="salaryMin">Min Salary</Label>
                <Input id="salaryMin" type="number" placeholder="50000" {...register('salaryMin')} />
              </div>
              <div>
                <Label htmlFor="salaryMax">Max Salary</Label>
                <Input id="salaryMax" type="number" placeholder="100000" {...register('salaryMax')} />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <select className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm" {...register('status')}>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : job ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
