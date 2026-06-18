import { FiTool } from 'react-icons/fi';
import EmptyState from '../../components/ui/EmptyState';

export default function ModulePlaceholder({ title }) {
  return (
    <EmptyState
      icon={FiTool}
      title={`Módulo ${title} em desenvolvimento`}
      description="Esta área será conectada ao backend FastAPI em uma próxima etapa. Por enquanto, esta é apenas a casca visual do ERP."
    />
  );
}