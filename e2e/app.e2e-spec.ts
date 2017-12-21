import { PrinciplewareFeMvcPage } from './app.po';

describe('principleware-fe-mvc App', () => {
  let page: PrinciplewareFeMvcPage;

  beforeEach(() => {
    page = new PrinciplewareFeMvcPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
