describe('Game Features', () => {
  beforeEach(() => {
    cy.login(); // Custom command to handle login
    cy.visit('/game');
  });

  it('should show game categories', () => {
    cy.get('[data-cy=category-grid]').should('be.visible');
    cy.get('[data-cy=category-card]').should('have.length.at.least', 1);
  });

  it('should open category puzzle', () => {
    cy.get('[data-cy=category-card]').first().click();
    cy.get('[data-cy=puzzle-screen]').should('be.visible');
  });

  it('should handle puzzle completion', () => {
    cy.get('[data-cy=category-card]').first().click();
    cy.get('[data-cy=puzzle-screen]').should('be.visible');
    
    // Simulate puzzle completion
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('puzzle-complete', { detail: { score: 100 } }));
    });
    
    cy.get('[data-cy=success-message]').should('be.visible');
    cy.get('[data-cy=coins-counter]').should('contain', '100');
  });

  it('should handle settings changes', () => {
    cy.get('[data-cy=settings-button]').click();
    cy.get('[data-cy=sound-toggle]').click();
    cy.get('[data-cy=settings-close]').click();
    
    // Verify sound setting was saved
    cy.window().then((win) => {
      const soundEnabled = win.localStorage.getItem('soundEnabled');
      expect(soundEnabled).to.equal('false');
    });
  });
});