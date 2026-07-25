import { PagesList } from './base/enums';
import { isPlantsId } from './base/helpers';
import Cart from './components/cart';
import CartPage from './pages/cart-page';
import CatalogPage from './pages/catalog-page';
import ErrorPage from './pages/error-page';
import PlantPage from './pages/plant-page';

// Base path the app is deployed under (e.g. '/ci-cd' on GitHub Pages, '' locally).
const BASE_PATH = process.env.PUBLIC_URL || '';

function toLogicalPath(pathname: string): string {
  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    return pathname.slice(BASE_PATH.length) || '/';
  }
  return pathname;
}

class Router {
  static catalogPage: CatalogPage;
  static cartPage: CartPage;
  static plantPage: PlantPage;
  static errorPage: ErrorPage;

  constructor(cart: Cart) {
    Router.catalogPage = new CatalogPage(cart);
    Router.cartPage = new CartPage(cart);
    Router.plantPage = new PlantPage(cart);
    Router.errorPage = new ErrorPage(cart);
  }

  static render(pathname: string) {
    // console.log('render:', pathname);
    switch (pathname) {
      case PagesList.catalogPage:
        Router.catalogPage.draw();
        break;
      case PagesList.cartPage:
        Router.cartPage.draw();
        break;
      case '/':
        this.goTo(PagesList.catalogPage);
        break;
      default:
        if (isPlantsId(pathname)) {
          Router.plantPage.draw(pathname.slice(1));
        } else {
          Router.errorPage.draw();
        }
        break;
    }
    Router.changeLinks();
  }

  static goTo(pageId: string) {
    window.history.pushState({ pageId }, pageId, BASE_PATH + pageId);
    Router.render(pageId);
    window.scrollTo(0, 0);
  }

  static changeLinks() {
    const links = document.querySelectorAll('[href^="/"]');
    links.forEach((link) => {
      if (!link.classList.contains('link-changed')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          if (
            link instanceof HTMLAnchorElement &&
            (new URL(link.href).pathname !== '/catalog' ||
              toLogicalPath(new URL(window.location.href).pathname) !== '/catalog')
          ) {
            Router.goTo(new URL(link.href).pathname);
          }
        });
        link.classList.add('link-changed');
      }
    });
  }

  static startRouter() {
    window.addEventListener('popstate', () => {
      Router.render(toLogicalPath(new URL(window.location.href).pathname));
    });
    const page = toLogicalPath(new URL(window.location.href).pathname);
    Router.render(page);
  }
}

export default Router;
