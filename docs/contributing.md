# Contributing

Thank you for your interest in contributing to PatchPilot.

Whether you're fixing bugs, improving documentation, refining prompts, or building new features, your contributions are welcome.

---

## Ways to Contribute

You can contribute by:

- Reporting bugs
- Improving documentation
- Fixing issues
- Adding new parsers
- Improving AI prompts
- Writing tests
- Suggesting new features
- Reviewing pull requests

---

## Development Workflow

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run tests and verify the application builds successfully.
5. Commit your work using a clear commit message.
6. Open a pull request describing your changes.

Example:

```bash
git checkout -b feature/improve-log-parser
```

---

## Coding Guidelines

### General

- Keep functions focused and easy to understand.
- Prefer descriptive names over abbreviations.
- Avoid unnecessary complexity.
- Write comments only when they add context beyond the code itself.

### Python

- Follow PEP 8.
- Use type hints where practical.
- Prefer small, testable functions.

### TypeScript

- Enable strict typing.
- Avoid `any` whenever possible.
- Reuse shared types from `packages/shared`.

---

## Documentation Guidelines

Documentation is treated as a first-class part of the project.

When submitting documentation:

- Write for developers encountering the project for the first time.
- Include code examples when helpful.
- Keep terminology consistent.
- Update related documentation whenever behavior changes.
- Verify that commands and examples are accurate.

---

## Pull Request Checklist

Before opening a pull request, confirm that:

- [ ] The project builds successfully.
- [ ] New functionality has been tested.
- [ ] Documentation has been updated.
- [ ] Existing tests continue to pass.
- [ ] New code follows the project's style guidelines.

---

## Reporting Issues

When filing a bug report, include:

- Operating system
- PatchPilot version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Relevant logs or screenshots

Providing detailed reports helps maintainers diagnose problems more quickly.

---

## Code of Conduct

Be respectful, constructive, and collaborative.

We aim to foster an inclusive environment where contributors can learn, share ideas, and improve the project together.

---

## Questions

If you have questions before contributing, open a GitHub Discussion or create an issue describing what you'd like to work on.
