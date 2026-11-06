import XwForm from './modules/Form.vue';

XwForm.install = function (app: any) {
  app.component('XwForm', XwForm);
};

export default XwForm;

export * from './types';
