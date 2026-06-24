describe('Resilient checkout — slow payment', () => {
  beforeEach(() => {
    cy.visit('/index.dev.html');
    cy.contains('button', 'Slow payment (3s)').click();
  });

  it('shows loading feedback during a slow payment API', () => {
    cy.get('#resilient-pay').click();
    cy.get('#resilient-status').should('contain', 'still working');
    cy.get('#resilient-status .spinner').should('exist');
    cy.get('#resilient-status', { timeout: 10000 }).should('contain', 'Payment confirmed');
    cy.get('#resilient-pay').should('contain', 'Paid');
  });
});
