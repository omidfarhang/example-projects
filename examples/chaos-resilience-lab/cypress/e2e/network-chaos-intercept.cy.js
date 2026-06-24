describe('Network chaos via cy.intercept', () => {
  it('delays the payment API and keeps the resilient UI responsive', () => {
    cy.intercept('POST', '/api/payment', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    });

    cy.visit('/index.dev.html');
    cy.get('#resilient-pay').click();
    cy.get('#resilient-pay').should('contain', 'Processing');
    cy.get('#resilient-status', { timeout: 10000 }).should('contain', 'Payment confirmed');
  });
});
