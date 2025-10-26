import { z } from 'zod';

/**
 * Schema for validating adoption application creation requests
 * @see DTO.ApplicationCreateCommand for the corresponding type
 */
export const ApplicationCreateSchema = z.object({
  dog_id: z.string().uuid('Invalid dog ID format'),
  motivation: z.string().min(20, 'Motivation must be at least 20 characters long'),
  contact_preference: z.enum(['email', 'phone'], {
    errorMap: () => ({ message: 'Contact preference must be either email or phone' }),
  }),
  extra_notes: z.string().max(500, 'Extra notes cannot exceed 500 characters').optional(),
});

export type ApplicationCreateInput = z.infer<typeof ApplicationCreateSchema>;
