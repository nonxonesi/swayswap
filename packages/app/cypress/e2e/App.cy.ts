describe('End-to-end Test: 😁 Happy Path', () => {
  it('should execute whole app basic flow', () => {
    cy.visit('/');

    cy.contains('button', /Launch app/i).click();

    // create a wallet and fund it
    cy.contains('button', /Create wallet/i).click();
    cy.contains('button', 'Give me ETH').click();
    cy.getByAriaLabel('Accept the use agreement').check();
    cy.contains('button', 'Get Swapping!').click();
    cy.contains('Enter amount');

    // mint tokens
    cy.visit('/mint');
    cy.contains('button', 'Mint tokens').click();
    cy.contains('Token received successfully!');
    // wait to be redirected to swap page after minting
    cy.contains('Enter amount');

    // go to pool page -> add liquidity page
    cy.contains('button', 'Pool').click();
    cy.contains('You do not have any open positions');
    cy.contains('button', 'Add Liquidity').click();

    const creatingPoolSelector = '[aria-label="create-pool"]';
    const addingLiquiditySelector = '[aria-label="pool-reserves"]';

    // check if is 'creating a pool' or 'adding liquidity'
    cy.get('body')
      .then(($body) => {
        if ($body.find(creatingPoolSelector).length) return creatingPoolSelector;
        if ($body.find(addingLiquiditySelector).length) return addingLiquiditySelector;
        return '';
      })
      .then((selector: string) => {
        if (!selector) {
          // should break test
          cy.contains(creatingPoolSelector);
        }

        const hasPoolCreated = selector === addingLiquiditySelector;

        if (hasPoolCreated) {
          // validate add liquidity
          cy.contains('Enter Ether amount');
          cy.getByAriaLabel('Coin From Input').type('0.2');

          // make sure preview output box shows up
          cy.getByAriaLabel('Preview Add Liquidity Output');

          // make sure pool price box shows up
          cy.getByAriaLabel('Pool Price Box');
          cy.contains('button', 'Add liquidity').click();
        } else {
          // validate create pool
          cy.contains('Enter Ether amount');
          cy.getByAriaLabel('Coin From Input').type('0.2');
          cy.getByAriaLabel('Coin To Input').type('190');

          // make sure preview output box shows up
          cy.getByAriaLabel('Preview Add Liquidity Output');

          // make sure pool price box shows up
          cy.getByAriaLabel('Pool Price Box');
          cy.contains('button', 'Create liquidity').click();
        }

        // make sure liquidity worked
        cy.contains('ETH/DAI');

        // validate swap
        cy.contains('button', 'Swap').click();
        cy.contains('Enter amount');
        cy.getByAriaLabel('Coin From Input').type('0.1');
        // make sure preview output box shows up
        cy.getByAriaLabel('Preview Swap Output');

        // execute swap operation
        cy.getByAriaLabel('Swap button').click();
        cy.contains('Swap made successfully!');

        // validate remove liquidity
        cy.contains('button', 'Pool').click();
        cy.contains('button', 'Remove liquidity').click();
        cy.getByAriaLabel('Set Maximun Balance').click();
        //
        // make sure preview output box shows up
        cy.getByAriaLabel('Preview Remove Liquidity Output');
        // make sure current positions box shows up
        cy.getByAriaLabel('Pool Current Position');
        cy.contains('button', 'Remove liquidity').click();
        cy.contains('Liquidity removed successfully!');
      });
  });
});
