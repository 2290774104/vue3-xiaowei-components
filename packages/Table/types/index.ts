// import type { TableProps } from 'element-plus';

export declare interface IData {
  [key: string]: any;
}

export declare interface IColumn {
  type?: 'selection' | 'index' | 'expand' | 'image';
  index?: number | ((index: number) => any);
  columnKey?: string;
  label: string;
  prop: string;
  width?: string | number;
  minWidth?: string;
  hidden?: boolean;
  fixed?: true | 'left' | 'right';
  resizable?: boolean;
  formatter?: (scope: {
    row: any;
    column: IColumn;
    cellValue: string;
    index: number;
  }) => string;
  showOverflowTooltip?: boolean;
  align?: 'center' | 'left' | 'right';
  headerAlign?: 'center' | 'left' | 'right';
  className?: string;
  labelClassName?: string;
  selectable?: (row: any, index: number) => boolean;
  reserveSelection?: boolean;
  customRender?: string;
  scopedSlots?: {
    customRender?: string;
  };
}

export declare interface IPagination {
  currentPage: number;
  pageSizes?: number[];
  pageSize?: number;
  layout?: string;
  background?: boolean;
}
