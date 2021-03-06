import { defineSupportCode } from 'cucumber';
import { expect } from '../helpers/chai-imports';

import { ViewerPage } from './../pages/viewer.po';
import { MetadataPage } from './../pages/metadata.po';

defineSupportCode(function ({ Given, Then }) {
  const viewer = new ViewerPage();
  const metadata = new MetadataPage();

  Then(/the logo associated with the resource are displayed to the user$/, async () => {
    expect(await metadata.isLogoDisplayed()).to.equal(true);
  });

});
