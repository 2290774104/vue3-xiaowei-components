import XwTable from './packages/Table';
import XwSearch from './packages/Search';
import XwForm from './packages/Form';

declare module 'vue' {
  export interface GlobalComponents {
    XwTable: typeof XwTable;
    XwSearch: typeof XwSearch;
    XwForm: typeof XwForm;
  }
}
