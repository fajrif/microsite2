import { z } from 'zod'

export const userSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    full_name: z.string().min(1, 'Full name is required'),
    phone: z.string().optional().transform(val => val === '' ? undefined : val),
    company: z.string().optional().transform(val => val === '' ? undefined : val),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(
            /[^A-Za-z0-9]/,
            'Password must contain at least one special character'
        ),
})

export const userUpdateSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    full_name: z.string().min(1, 'Full name is required'),
    phone: z.string().optional().transform(val => val === '' ? undefined : val),
    company: z.string().optional().transform(val => val === '' ? undefined : val),
    password: z
        .string()
        .optional()
        .transform(val => val === '' ? undefined : val)
        .refine(
            (val) => {
                if (val === undefined) return true
                if (val.length < 8) return false
                if (!/[A-Z]/.test(val)) return false
                if (!/[a-z]/.test(val)) return false
                if (!/[0-9]/.test(val)) return false
                if (!/[^A-Za-z0-9]/.test(val)) return false
                return true
            },
            {
                message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
            }
        ),
})

export const userLoginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
})

export type UserFormData = z.infer<typeof userSchema>
export type UserUpdateData = z.infer<typeof userUpdateSchema>
export type UserLoginData = z.infer<typeof userLoginSchema>
