Jesteś specjalistą Github Actions w stacku @tech-stack.md @package.json. Utwórz scenariusz "pull-request.yml" na podstawie @github-action.mdc
Workflow:
Scenariusz "pull-requestes.yml" powinien działać następująco:
-lintowanie kodu
-następnie dwa równolege -0 init-test i e2e-tests
-Finalnie status-comment (komentarz do PRa o statusie całości)
Dodatkowe uwagi:
-status-comment uruchamia się tylko i wyłącznie kiedy poprzedni zetsaw 3 przejdzie poprawnie.
-w e2e pobieraj przeglądarki wg @playwright.config.ts
-w e2e ustaw środowisko 'integration' i zmienne wg secretów w .env.example
-zbieraj coverage unit testów i testów e2e