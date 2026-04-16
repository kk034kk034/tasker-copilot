# SECURITY

## Security posture
This project is local-first and intended for developer use. It handles profile data, generated text, and optional LLM credentials.

## Reporting a vulnerability
Please open a private security advisory or contact maintainers before public disclosure.

## Secrets policy
- Never hardcode API keys, cookies, or credentials.
- Use environment variables from `.env`.
- `.env` files must not be committed.

## Platform compliance
- This tool is assistive only.
- It must not auto-submit proposals.
- It must not bypass anti-bot protections, CAPTCHA, or platform rules.

## Safe usage expectations
- Review generated proposals manually before submission.
- Verify outputs for correctness and policy compliance.
