// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global commands here
Cypress.Commands.add('getByData', (selector: string) => {
  return cy.get(`[data-testid="${selector}"]`);
});

Cypress.Commands.add('getByRole', (role: string, options?: any) => {
  return cy.get(`[role="${role}"]`, options);
});

Cypress.Commands.add('getByLabel', (label: string) => {
  return cy.get(`[aria-label="${label}"]`);
});

Cypress.Commands.add('getByText', (text: string, options?: any) => {
  return cy.get(`:contains("${text}")`, options);
});
