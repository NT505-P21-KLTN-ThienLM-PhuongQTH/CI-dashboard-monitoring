import PageHeader from '../../components/PageHeader';
import RepositoryTable from '../../components/DataTable/RepositoryTable';

function Repository() {
  return (
    <div className="min-h-screen bg-background p-6">
      <PageHeader
        title="Repositories"
        description="Manage your repositories and their settings."
      />
      <RepositoryTable />
    </div>
  );
}

export default Repository;