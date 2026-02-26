import getLayoutTemplateModule from './getLayoutTemplateModule';
export { StudyListPage } from './components/StudyListPage';

const id = '@ohif/extension-custom-ui';

const extension = {
  id,
  getLayoutTemplateModule,
};

export default extension;
