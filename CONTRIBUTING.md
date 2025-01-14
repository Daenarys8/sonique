# Contributing Guidelines

Thank you for considering contributing to our project! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/Daenarys8/sonique`
3. Create a new branch: `git checkout -b feature/your-feature`
4. Install dependencies: `npm install`

## Development Setup

1. Copy `.env.example` to `.env.local` and fill in required values
2. Run development server: `npm run dev`
3. Run tests: `npm test`

## Pull Request Process

1. Ensure your code follows our style guide (run `npm run lint`)
2. Update documentation as needed
3. Add tests for new features
4. Run the test suite and ensure all tests pass
5. Update the CHANGELOG.md
6. Submit a pull request

## Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Add proper types for all props and functions
- Follow accessibility guidelines
- Keep components focused and small

## Testing

- Write unit tests for utility functions
- Write integration tests for components
- Maintain test coverage above 80%
- Test accessibility with jest-axe

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests in the body

## Code Review Process

1. Maintainers will review your PR within 2 business days
2. Address any requested changes
3. Once approved, your PR will be merged

## Additional Guidelines

### Performance
- Optimize bundle size
- Use code splitting where appropriate
- Implement proper memoization
- Profile and optimize render cycles

### Security
- Never commit sensitive data
- Validate all inputs
- Implement proper error handling
- Follow security best practices

### Accessibility
- Follow WCAG guidelines
- Test with screen readers
- Ensure keyboard navigation works
- Provide proper ARIA attributes

## Getting Help

- Join our Discord channel
- Check existing issues
- Read the documentation
- Ask in pull request comments