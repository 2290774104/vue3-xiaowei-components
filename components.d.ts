import XwTable from './packages/Table';
import XwSearch from './packages/Search';

declare module 'vue' {
  export interface GlobalComponents {
    XwTable: typeof XwTable;
    XwSearch: typeof XwSearch;
  }
}
