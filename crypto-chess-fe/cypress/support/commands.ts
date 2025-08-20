// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      getByData(selector: string): Chainable<JQuery<HTMLElement>>;
      getByRole(role: string, options?: any): Chainable<JQuery<HTMLElement>>;
      getByLabel(label: string): Chainable<JQuery<HTMLElement>>;
      getByText(text: string, options?: any): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
