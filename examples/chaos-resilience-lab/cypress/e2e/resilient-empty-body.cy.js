describe('Resilient checkout — empty API response', () => {
  beforeEach(() => {
    cy.visit('/index.dev.html');
    cy.contains('button', 'Empty response').click();
  });

  it('refuses to confirm payment when the API body is empty', () => {
    cy.get('#resilient-pay').click();
    cy.get('#resilient-status').should('contain', 'Could not verify payment');
    cy.get('#resilient-status').should('not.contain', 'Payment confirmed');
    cy.get('#resilient-pay').should('contain', 'Retry payment');
  });
});
