declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>;
    getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
  }
}

// Custom command for login
Cypress.Commands.add('login', () => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: {
      username: Cypress.env('TEST_USERNAME'),
      password: Cypress.env('TEST_PASSWORD')
    }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
  });
});

// Custom command for getting elements by data-testid
Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-cy=${testId}]`);
});