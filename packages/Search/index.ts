import xwSearch from './modules/Search.vue';

xwSearch.install = function (app: any) {
  app.component('XwSearch', xwSearch);
};

export default xwSearch;
