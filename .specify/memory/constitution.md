<!--
SYNC IMPACT REPORT
==================
Version Change: Template → 1.0.0
Principles Defined:
  - I. Clean Architecture & SOLID Principles (new)
  - II. Theme Support (new)
  - III. React Best Practices (new)

Added Sections:
  - Core Principles (3 principles defined)
  - Code Quality Standards (new)
  - Development Workflow (new)
  - Governance (new)

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section already references this file
  ✅ .specify/templates/spec-template.md - No changes needed (technology agnostic)
  ✅ .specify/templates/tasks-template.md - No changes needed (follows any architecture)

Follow-up TODOs: None
-->

# Worlds Project Constitution

## Development server
Do not run the server, it'll be running already in the terminal.

Ask for any server output if you need it

## Core Principles

### I. Clean Architecture & SOLID Principles

All code MUST adhere to Clean Architecture layering and SOLID design principles:

- **Single Responsibility**: Each module, class, or function has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived types must be substitutable for base types
- **Interface Segregation**: No client forced to depend on unused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

**Architecture Layers** (dependency flow: outer → inner only):
- Presentation (UI components, pages)
- Application (use cases, application logic)
- Domain (business logic, entities)
- Infrastructure (external services, APIs, storage)

**Rationale**: Clean architecture ensures maintainability, testability, and long-term
scalability. SOLID principles prevent code rot and enable safe refactoring.

### II. Theme Support

The application MUST support three theme modes with seamless switching:

- **Dark Mode**: Full dark theme implementation
- **Light Mode**: Full light theme implementation
- **Auto Mode**: Respects system/browser preference and updates dynamically

**Requirements**:
- Theme state persisted across sessions
- No flash of unstyled content (FOUC) on load
- All components theme-aware
- Accessibility standards maintained in both themes (WCAG 2.1 AA minimum)

**Rationale**: User preference for visual presentation directly impacts usability and
accessibility. Auto mode respects user's system-wide choice while allowing override.

### III. React Best Practices

All React code MUST follow current community best practices:

**Functional Components & Hooks**:
- Prefer functional components over class components
- Use hooks appropriately (useState, useEffect, useContext, custom hooks)
- Follow Rules of Hooks (only at top level, only in React functions)

**Performance**:
- Memoization where beneficial (React.memo, useMemo, useCallback)
- Avoid unnecessary re-renders
- Code splitting and lazy loading for route-based bundles

**Code Organization**:
- Component co-location (styles, tests alongside component)
- Custom hooks for reusable logic
- Prop types or TypeScript for type safety
- Clear component naming (PascalCase for components)

**State Management**:
- Local state by default
- Context for cross-cutting concerns
- State management library (if needed) chosen based on complexity

**Rationale**: React best practices evolve with the framework. Following current
patterns ensures maintainability, performance, and community alignment.

## Code Quality Standards

### Testing Requirements

- **Unit Tests**: Required for business logic, utilities, and complex components
- **Integration Tests**: Required for user journeys spanning multiple components
- **Contract Tests**: Required for API endpoints and external service boundaries
- **Test Coverage**: Aim for 80%+ coverage on critical paths

### Code Review Requirements

All changes MUST:
- Pass automated linting and formatting checks
- Include tests appropriate to the change
- Follow the architecture principles above
- Be reviewed by at least one team member
- Pass all CI checks before merge

### Documentation Requirements

- **Component Documentation**: Props, usage examples, edge cases
- **Architecture Decisions**: Document significant architectural choices
- **API Documentation**: All endpoints, request/response formats
- **README Updates**: Keep setup and running instructions current

## Development Workflow

### Feature Development Process

1. **Specification**: Create or update feature spec in `/specs/[###-feature-name]/spec.md`
2. **Planning**: Run `/speckit.plan` to generate implementation plan
3. **Task Generation**: Run `/speckit.tasks` to create task breakdown
4. **Implementation**: Execute tasks following dependency order
5. **Validation**: Verify against acceptance criteria
6. **Review**: Submit for code review with constitution compliance check

### Branch Strategy

- **main**: Production-ready code
- **feature/[###-feature-name]**: Feature development branches
- Feature branches merge to main after review and CI pass

### Commit Standards

- Clear, descriptive commit messages
- Reference issue/feature numbers where applicable
- Atomic commits (one logical change per commit)
- Conventional commits format encouraged (feat:, fix:, docs:, refactor:, etc.)

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines. Any conflict
between this document and other documentation is resolved in favor of the constitution.

### Amendment Process

Constitution amendments require:
1. Documented rationale for the change
2. Impact analysis on existing code and templates
3. Version bump following semantic versioning
4. Update to all dependent templates and documentation
5. Team review and approval

### Versioning Policy

Constitution versions follow semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Backward incompatible governance or principle removals/redefinitions
- **MINOR**: New principles, sections, or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance Review

All pull requests and code reviews MUST verify compliance with this constitution:
- Architecture layers respected
- SOLID principles followed
- Theme support implemented correctly
- React best practices applied
- Code quality standards met

### Complexity Justification

Any deviation from these principles MUST be justified in the implementation plan's
"Complexity Tracking" section with:
- What principle is being violated
- Why the violation is necessary
- What simpler alternative was rejected and why

**Version**: 1.0.0 | **Ratified**: 2025-10-22 | **Last Amended**: 2025-10-22
