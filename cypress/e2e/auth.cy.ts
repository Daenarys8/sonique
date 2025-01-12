describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show login form', () => {
    cy.get('[data-cy=login-form]').should('be.visible');
  });

  it('should show validation errors', () => {
    cy.get('[data-cy=submit-button]').click();
    cy.get('[data-cy=error-message]').should('be.visible');
  });

  it('should navigate to signup page', () => {
    cy.get('[data-cy=signup-link]').click();
    cy.url().should('include', '/signup');
  });

  it('should handle successful login', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { token: 'fake-token' }
    }).as('loginRequest');

    cy.get('[data-cy=username-input]').type('testuser');
    cy.get('[data-cy=password-input]').type('Password123!');
    cy.get('[data-cy=submit-button]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/game');
  });
});