import getLayoutTemplateModule from './getLayoutTemplateModule';
export { StudyListPage } from './components/StudyListPage';
export { AuthProvider, useAuth } from './context/AuthContext';
export { AuthGate } from './components/AuthGate';

const id = '@ohif/extension-custom-ui';

const extension = {
  id,
  getLayoutTemplateModule,
};

export default extension;
