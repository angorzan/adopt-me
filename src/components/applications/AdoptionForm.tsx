import { type FormEvent, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type AdoptionFormProps = {
  dogId: string
  dogName: string
  isAuthenticated: boolean
}

type FieldErrors = {
  motivation?: string
  contactPreference?: string
  extraNotes?: string
  consent?: string
}

type SubmitStatus = "idle" | "submitting" | "success"

type ServerError = "dog_not_available" | "duplicate_application" | "server_error" | "auth_required"

const serverErrorMessages: Record<ServerError, string> = {
  dog_not_available: "Wybrany pies nie jest obecnie dostępny do adopcji.",
  duplicate_application:
    "Masz już aktywny wniosek dla tego psa. Poczekaj na odpowiedź schroniska.",
  server_error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
  auth_required: "Musisz być zalogowany, aby wysłać wniosek adopcyjny.",
}

export function AdoptionForm({ dogId, dogName, isAuthenticated }: AdoptionFormProps) {
  const [motivation, setMotivation] = useState("")
  const [contactPreference, setContactPreference] = useState<"email" | "phone" | "">("")
  const [extraNotes, setExtraNotes] = useState("")
  const [consent, setConsent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [status, setStatus] = useState<SubmitStatus>("idle")

  const isSubmitting = status === "submitting"

  const motivationLength = useMemo(() => motivation.trim().length, [motivation])
  const extraNotesLength = useMemo(() => extraNotes.trim().length, [extraNotes])

  const resetErrors = () => {
    setFieldErrors({})
    setGlobalError(null)
  }

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {}

    if (motivation.trim().length < 20) {
      errors.motivation = "Uzasadnienie musi mieć co najmniej 20 znaków."
    }

    if (!contactPreference) {
      errors.contactPreference = "Wybierz preferowany kanał kontaktu."
    }

    if (extraNotes.trim().length > 500) {
      errors.extraNotes = "Dodatkowe informacje mogą mieć maksymalnie 500 znaków."
    }

    if (!consent) {
      errors.consent = "Musisz wyrazić zgodę na przetwarzanie danych, aby wysłać wniosek."
    }

    return errors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting || !isAuthenticated) {
      if (!isAuthenticated) {
        setGlobalError(serverErrorMessages.auth_required)
      }
      return
    }

    resetErrors()

    const errors = validate()
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    setStatus("submitting")

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dog_id: dogId,
          motivation: motivation.trim(),
          contact_preference: contactPreference,
          ...(extraNotes.trim().length ? { extra_notes: extraNotes.trim() } : {}),
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          setGlobalError(serverErrorMessages.auth_required)
          setStatus("idle")
          return
        }

        const payload = await response.json().catch(() => null)

        if (response.status === 400 && payload?.error) {
          const { fieldErrors: serverFieldErrors, formErrors } = payload.error

          const mappedErrors: FieldErrors = {}

          if (serverFieldErrors?.motivation?.length) {
            mappedErrors.motivation = serverFieldErrors.motivation[0]
          }
          if (serverFieldErrors?.contact_preference?.length) {
            mappedErrors.contactPreference = serverFieldErrors.contact_preference[0]
          }
          if (serverFieldErrors?.extra_notes?.length) {
            mappedErrors.extraNotes = serverFieldErrors.extra_notes[0]
          }
          if (serverFieldErrors?.dog_id?.length) {
            setGlobalError(serverFieldErrors.dog_id[0])
          }
          if (formErrors?.length) {
            setGlobalError(formErrors[0])
          }

          setFieldErrors((current) => ({ ...current, ...mappedErrors }))
          setStatus("idle")
          return
        }

        const errorKey: ServerError | undefined = payload?.error
        if (errorKey && errorKey in serverErrorMessages) {
          setGlobalError(serverErrorMessages[errorKey as ServerError])
        } else {
          setGlobalError("Nie udało się wysłać wniosku. Spróbuj ponownie później.")
        }

        setStatus("idle")
        return
      }

      setStatus("success")
      setMotivation("")
      setContactPreference("")
      setExtraNotes("")
      setConsent(false)
    } catch (error) {
      console.error("Failed to submit adoption application", error)
      setGlobalError("Wystąpił problem z połączeniem. Spróbuj ponownie później.")
      setStatus("idle")
    }
  }

  if (!isAuthenticated) {
    return (
      <Card data-test-id="adoption-form-unauthenticated">
        <CardHeader>
          <CardTitle>Zaloguj się, aby wysłać wniosek</CardTitle>
          <CardDescription>
            Formularz adopcyjny jest dostępny tylko dla zalogowanych użytkowników. Zaloguj się lub utwórz konto,
            aby kontynuować.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-muted px-3 py-2 text-sm text-muted-foreground">
            Po zalogowaniu będziesz mógł wysłać wniosek adopcyjny dla psa {dogName} oraz śledzić status zgłoszenia w swoim profilu.
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="w-full sm:w-auto" data-test-id="adoption-form-login-button">
              <a href="/auth/login">Zaloguj się</a>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto" data-test-id="adoption-form-signup-button">
              <a href="/auth/signup">Załóż konto</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "success") {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30" data-test-id="adoption-form-success">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle2 className="size-5" aria-hidden="true" />
            Wniosek wysłany
          </CardTitle>
          <CardDescription data-test-id="adoption-form-success-message">
            Dziękujemy! Twój wniosek adopcyjny dla psa {dogName} został zapisany. Schronisko skontaktuje się
            z Tobą w wybrany sposób po przeanalizowaniu zgłoszenia.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card data-test-id="adoption-form-container">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate data-test-id="adoption-form">
        <CardHeader>
          <CardTitle>Formularz adopcyjny</CardTitle>
          <CardDescription>
            Wniosek dla psa {dogName}. Uzupełnij wymagane pola, aby przesłać zgłoszenie do schroniska.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {globalError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" data-test-id="adoption-form-global-error">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{globalError}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="motivation">Dlaczego chcesz adoptować tego psa? *</Label>
            <Textarea
              id="motivation"
              name="motivation"
              value={motivation}
              aria-invalid={fieldErrors.motivation ? "true" : undefined}
              aria-describedby={fieldErrors.motivation ? "motivation-error" : undefined}
              placeholder={`Opisz, dlaczego ${dogName} będzie miał u Ciebie dobre warunki.`}
              onChange={(event) => setMotivation(event.target.value)}
              disabled={isSubmitting}
              maxLength={800}
              data-test-id="adoption-form-motivation"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Minimum 20 znaków</span>
              <span data-test-id="adoption-form-motivation-counter">{motivationLength}/800</span>
            </div>
            {fieldErrors.motivation && (
              <p id="motivation-error" className="text-sm text-destructive" data-test-id="adoption-form-motivation-error">
                {fieldErrors.motivation}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Preferowany kontakt *</Label>
            <Select
              value={contactPreference || undefined}
              onValueChange={(value: "email" | "phone") => setContactPreference(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger
                className="w-full"
                aria-invalid={fieldErrors.contactPreference ? "true" : undefined}
                aria-describedby={fieldErrors.contactPreference ? "contact-preference-error" : undefined}
                data-test-id="adoption-form-contact-preference"
              >
                <SelectValue placeholder="Wybierz kanał kontaktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email" data-test-id="adoption-form-contact-email">E-mail</SelectItem>
                <SelectItem value="phone" data-test-id="adoption-form-contact-phone">Telefon</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.contactPreference && (
              <p id="contact-preference-error" className="text-sm text-destructive" data-test-id="adoption-form-contact-preference-error">
                {fieldErrors.contactPreference}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra-notes">Dodatkowe informacje (opcjonalnie)</Label>
            <Textarea
              id="extra-notes"
              name="extra_notes"
              value={extraNotes}
              aria-invalid={fieldErrors.extraNotes ? "true" : undefined}
              aria-describedby={fieldErrors.extraNotes ? "extra-notes-error" : undefined}
              placeholder="Podziel się informacjami, które mogą pomóc schronisku lepiej Cię poznać."
              onChange={(event) => setExtraNotes(event.target.value)}
              disabled={isSubmitting}
              maxLength={500}
              data-test-id="adoption-form-extra-notes"
            />
            <div className="flex items-center justify-end text-xs text-muted-foreground">
              <span data-test-id="adoption-form-extra-notes-counter">{extraNotesLength}/500</span>
            </div>
            {fieldErrors.extraNotes && (
              <p id="extra-notes-error" className="text-sm text-destructive" data-test-id="adoption-form-extra-notes-error">
                {fieldErrors.extraNotes}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(Boolean(checked))}
                disabled={isSubmitting}
                aria-describedby={fieldErrors.consent ? "consent-error" : undefined}
                data-test-id="adoption-form-consent-checkbox"
              />
              <Label htmlFor="consent" className="cursor-pointer">
                Wyrażam zgodę na przetwarzanie moich danych osobowych na potrzeby procesu adopcyjnego.
              </Label>
            </div>
            {fieldErrors.consent && (
              <p id="consent-error" className="text-sm text-destructive" data-test-id="adoption-form-consent-error">
                {fieldErrors.consent}
              </p>
            )}
          </div>
        </CardContent>
        <div className="flex justify-end px-6 pb-6">
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto" data-test-id="adoption-form-submit-button">
            {isSubmitting ? "Wysyłanie…" : "Wyślij wniosek"}
          </Button>
        </div>
      </form>
    </Card>
  )
}


