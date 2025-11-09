import { z } from "zod";

// Walidacja hasła - tylko minimum 5 znaków
const passwordSchema = z.string().min(5, "Hasło musi mieć minimum 5 znaków");

// Walidacja e-mail
const emailSchema = z
  .string()
  .email("Nieprawidłowy format adresu e-mail")
  .max(255, "Adres e-mail jest za długi")
  .toLowerCase();

// Schema logowania
export const loginCommandSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Hasło jest wymagane"),
});

export type LoginCommand = z.infer<typeof loginCommandSchema>;

// Schema rejestracji
export const registerCommandSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    gdprConsent: z.literal(true, {
      errorMap: () => ({ message: "Musisz zaakceptować przetwarzanie danych" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export type RegisterCommand = z.infer<typeof registerCommandSchema>;

// Schema odzyskiwania hasła
export const forgotPasswordCommandSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordCommand = z.infer<typeof forgotPasswordCommandSchema>;

// Schema resetowania hasła
export const resetPasswordCommandSchema = z
  .object({
    token: z.string().uuid("Nieprawidłowy token"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export type ResetPasswordCommand = z.infer<typeof resetPasswordCommandSchema>;
