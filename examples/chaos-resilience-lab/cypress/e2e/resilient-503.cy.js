describe('Resilient checkout — payment 503', () => {
  beforeEach(() => {
    cy.visit('/index.dev.html');
    cy.contains('button', 'Payment 503').click();
  });

  it('shows a retry banner instead of crashing', () => {
    cy.get('#resilient-pay').click();
    cy.get('#resilient-status').should('contain', 'Payment service unavailable');
    cy.get('#resilient-pay').should('contain', 'Retry payment').and('not.be.disabled');
    cy.get('#resilient-app').should('not.have.class', 'checkout--crash');
  });
});
