describe('Crypto Chess Game', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the chess board', () => {
    cy.get('.chess-board').should('be.visible');
    cy.get('.chess-square').should('have.length', 64);
  });

  it('should show game status', () => {
    cy.get('.status').should('contain', 'White to move');
  });

  it('should display game controls', () => {
    cy.get('.game-controls').should('be.visible');
    cy.get('[title*="theme"]').should('be.visible');
    cy.get('[title*="sound"]').should('be.visible');
    cy.get('[title*="reset"]').should('be.visible');
  });

  it('should allow piece selection', () => {
    // Click on a white pawn
    cy.get('.chess-square').contains('♙').first().click();
    cy.get('.chess-square.selected').should('be.visible');
  });

  it('should show move history', () => {
    cy.get('.move-history').should('be.visible');
  });

  it('should toggle theme', () => {
    const initialTheme = cy.get('html').invoke('attr', 'data-theme');
    cy.get('[title*="theme"]').click();
    cy.get('html').should('not.have.attr', 'data-theme', initialTheme);
  });

  it('should toggle sound', () => {
    cy.get('[title*="sound"]').click();
    cy.get('.control-info').should('contain', 'Off');
    cy.get('[title*="sound"]').click();
    cy.get('.control-info').should('contain', 'On');
  });

  it('should reset game', () => {
    // Make a move first
    cy.get('.chess-square').contains('♙').first().click();
    cy.get('.chess-square').eq(16).click(); // Move pawn forward
    
    // Reset game
    cy.get('[title*="reset"]').click();
    cy.get('.status').should('contain', 'White to move');
  });
});
